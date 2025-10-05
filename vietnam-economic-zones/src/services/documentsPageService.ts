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
  private static cache: { data: DocumentFolder[]; timestamp: number } | null = null;
  private static CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private static pendingRequest: Promise<DocumentFolder[]> | null = null;


  /**
   * Get all documents organized by folders
   */
  static async getDocumentsByFolders(): Promise<DocumentFolder[]> {
    console.log('[DocumentsPageService] Starting getDocumentsByFolders...');

    // Check cache first
    if (this.cache && Date.now() - this.cache.timestamp < this.CACHE_DURATION) {
      console.log('[DocumentsPageService] Returning cached data');
      return this.cache.data;
    }

    // If there's already a pending request, return that promise
    if (this.pendingRequest) {
      console.log('[DocumentsPageService] Reusing pending request');
      return this.pendingRequest;
    }

    // Create new request
    this.pendingRequest = this.fetchDocumentsFromStorage();

    try {
      const result = await this.pendingRequest;
      // Cache the result
      this.cache = { data: result, timestamp: Date.now() };
      return result;
    } finally {
      this.pendingRequest = null;
    }
  }

  /**
   * Internal method to fetch documents from storage
   */
  private static async fetchDocumentsFromStorage(): Promise<DocumentFolder[]> {
    console.log('[DocumentsPageService] Fetching from storage...');
    try {
      // List all files recursively in one request (no need for connection check)
      console.log('[DocumentsPageService] Listing all files from bucket:', this.BUCKET_NAME);
      const listPromise = supabase.storage
        .from(this.BUCKET_NAME)
        .list('', {
          limit: 1000,
          offset: 0,
          sortBy: { column: 'name', order: 'asc' },
        });

      // Create a timeout that will reject after 10 seconds
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout: Failed to fetch documents from storage')), 10000);
      });

      const { data: topLevelItems, error: listError } = await Promise.race([listPromise, timeoutPromise]);
      console.log('[DocumentsPageService] Received response from storage.list:', { topLevelItems, listError });

      if (listError) {
        console.error('Error fetching top-level items:', listError);

        // Provide more helpful error messages
        if (listError.message?.includes('not found') || listError.message?.includes('does not exist')) {
          throw new Error(`Storage bucket "${this.BUCKET_NAME}" does not exist. Please create it in Supabase dashboard.`);
        }
        if (listError.message?.includes('permission') || listError.message?.includes('authorized')) {
          throw new Error(`No permission to access storage bucket "${this.BUCKET_NAME}". Please check storage policies.`);
        }

        throw listError;
      }

      // Handle empty or null response
      if (!topLevelItems) {
        console.warn('No items found in storage bucket');
        return [];
      }

      const folderMap = new Map<string, DocumentFile[]>();

      // Identify folders first
      const folderNames: string[] = [];
      for (const item of topLevelItems || []) {
        if (item.metadata?.size === undefined && item.id === null) {
          folderNames.push(item.name);
        }
      }

      // Batch fetch all folder contents in parallel
      console.log('[DocumentsPageService] Found folders:', folderNames);
      const folderPromises = folderNames.map(folderName =>
        supabase.storage
          .from(this.BUCKET_NAME)
          .list(folderName, {
            limit: 1000,
            offset: 0,
            sortBy: { column: 'name', order: 'asc' },
          })
          .then(result => ({ folderName, ...result }))
      );

      const folderResults = await Promise.all(folderPromises);
      console.log('[DocumentsPageService] Fetched all folder contents');

      // Process folder results
      for (const { folderName, data: folderFiles, error: folderError } of folderResults) {
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

          // Get public URL for download (this is a client-side operation, not a network request)
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
      }

      // Process root-level files
      for (const item of topLevelItems || []) {
        if (item.metadata?.size !== undefined) {
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
      const sortedFolders = folders.sort((a, b) => a.name.localeCompare(b.name));
      console.log('[DocumentsPageService] Returning folders:', sortedFolders);
      return sortedFolders;
    } catch (error) {
      console.error('[DocumentsPageService] Error in getDocumentsByFolders:', error);
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
