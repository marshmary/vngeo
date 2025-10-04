import { supabase } from '@/lib/supabase';

export interface DocumentFile {
  id: string;
  name: string;
  path: string;
  size: number;
  created_at: string;
  updated_at: string;
  mimetype: string;
  folder: string;
  downloadUrl: string;
  fileExtension: string;
}

export interface DocumentFolder {
  name: string;
  count: number;
  documents: DocumentFile[];
}

export class DocumentsPageService {
  private static BUCKET_NAME = import.meta.env.VITE_SUPABASE_STORAGE_BUCKET || 'documents';

  /**
   * Get all documents organized by folders
   */
  static async getDocumentsByFolders(): Promise<DocumentFolder[]> {
    try {
      // First, list all top-level items (folders and files) in the bucket
      const { data: topLevelItems, error: listError } = await supabase.storage
        .from(this.BUCKET_NAME)
        .list('', {
          limit: 1000,
          offset: 0,
          sortBy: { column: 'name', order: 'asc' },
        });

      if (listError) {
        console.error('Error fetching top-level items:', listError);
        throw listError;
      }

      const folderMap = new Map<string, DocumentFile[]>();

      // Process each item
      for (const item of topLevelItems || []) {
        // Check if this is a folder (no metadata.size indicates it's a folder)
        if (item.metadata?.size === undefined && item.id === null) {
          // This is a folder, fetch documents from it
          const folderName = item.name;

          const { data: folderFiles, error: folderError } = await supabase.storage
            .from(this.BUCKET_NAME)
            .list(folderName, {
              limit: 1000,
              offset: 0,
              sortBy: { column: 'name', order: 'asc' },
            });

          if (folderError) {
            console.error(`Error fetching files from folder ${folderName}:`, folderError);
            continue;
          }

          const documents: DocumentFile[] = [];

          for (const file of folderFiles || []) {
            // Skip nested folders
            if (file.metadata?.size === undefined) continue;

            // Skip .folderkeep files
            if (file.name === '.folderkeep') continue;

            const fullPath = `${folderName}/${file.name}`;

            // Get public URL for download
            const { data: urlData } = supabase.storage
              .from(this.BUCKET_NAME)
              .getPublicUrl(fullPath);

            // Get file extension
            const fileExtension = file.name.split('.').pop()?.toUpperCase() || 'FILE';

            documents.push({
              id: file.id || fullPath,
              name: file.name,
              path: fullPath,
              size: file.metadata?.size || 0,
              created_at: file.created_at,
              updated_at: file.updated_at,
              mimetype: file.metadata?.mimetype || 'application/octet-stream',
              folder: folderName,
              downloadUrl: urlData.publicUrl,
              fileExtension
            });
          }

          if (documents.length > 0) {
            folderMap.set(folderName, documents);
          }
        } else if (item.metadata?.size !== undefined) {
          // This is a file in the root directory
          // Skip .folderkeep files
          if (item.name === '.folderkeep') continue;

          const { data: urlData } = supabase.storage
            .from(this.BUCKET_NAME)
            .getPublicUrl(item.name);

          const fileExtension = item.name.split('.').pop()?.toUpperCase() || 'FILE';

          const rootDocument: DocumentFile = {
            id: item.id || item.name,
            name: item.name,
            path: item.name,
            size: item.metadata?.size || 0,
            created_at: item.created_at,
            updated_at: item.updated_at,
            mimetype: item.metadata?.mimetype || 'application/octet-stream',
            folder: 'General',
            downloadUrl: urlData.publicUrl,
            fileExtension
          };

          if (!folderMap.has('General')) {
            folderMap.set('General', []);
          }
          folderMap.get('General')!.push(rootDocument);
        }
      }

      // Convert to array format
      const folders: DocumentFolder[] = Array.from(folderMap.entries()).map(([name, documents]) => ({
        name,
        count: documents.length,
        documents: documents.sort((a, b) => a.name.localeCompare(b.name))
      }));

      // Sort folders alphabetically
      return folders.sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
      console.error('Error in getDocumentsByFolders:', error);
      throw error;
    }
  }

  /**
   * Get documents from a specific folder
   */
  static async getDocumentsFromFolder(folderName: string): Promise<DocumentFile[]> {
    try {
      const { data: files, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .list(folderName, {
          limit: 1000,
          offset: 0,
          sortBy: { column: 'name', order: 'asc' },
        });

      if (error) {
        console.error(`Error fetching files from folder ${folderName}:`, error);
        throw error;
      }

      const documentFiles: DocumentFile[] = [];
      
      for (const file of files || []) {
        // Skip folders
        if (file.metadata?.size === undefined) continue;
        
        // Get public URL for download
        const { data: urlData } = supabase.storage
          .from(this.BUCKET_NAME)
          .getPublicUrl(`${folderName}/${file.name}`);
        
        // Get file extension
        const fileExtension = file.name.split('.').pop()?.toUpperCase() || 'FILE';
        
        documentFiles.push({
          id: file.id || file.name,
          name: file.name,
          path: `${folderName}/${file.name}`,
          size: file.metadata?.size || 0,
          created_at: file.created_at,
          updated_at: file.updated_at,
          mimetype: file.metadata?.mimetype || 'application/octet-stream',
          folder: folderName,
          downloadUrl: urlData.publicUrl,
          fileExtension
        });
      }

      return documentFiles.sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
      console.error(`Error in getDocumentsFromFolder:`, error);
      throw error;
    }
  }

  /**
   * Format file size for display
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Get file type icon based on extension
   */
  static getFileTypeIcon(extension: string): string {
    const ext = extension.toLowerCase();
    
    if (['pdf'].includes(ext)) return 'pdf';
    if (['doc', 'docx'].includes(ext)) return 'word';
    if (['xls', 'xlsx'].includes(ext)) return 'excel';
    if (['ppt', 'pptx'].includes(ext)) return 'powerpoint';
    if (['jpg', 'jpeg', 'png', 'gif', 'svg'].includes(ext)) return 'image';
    if (['mp4', 'avi', 'mov', 'wmv'].includes(ext)) return 'video';
    if (['mp3', 'wav', 'flac'].includes(ext)) return 'audio';
    if (['zip', 'rar', '7z'].includes(ext)) return 'archive';
    
    return 'file';
  }
}
