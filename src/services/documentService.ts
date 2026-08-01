import { supabase } from '@/lib/supabase';

export interface StorageFile {
  id?: string;
  name: string;
  bucket_id?: string;
  created_at: string;
  updated_at: string;
  last_accessed_at?: string;
  metadata?: {
    size?: number;
    mimetype?: string;
    [key: string]: unknown;
  };
}

export class DocumentService {
  private static BUCKET_NAME = import.meta.env.VITE_SUPABASE_STORAGE_BUCKET || 'documents';
  private static MAX_FILE_SIZE = import.meta.env.VITE_SUPABASE_MAX_FILE_SIZE || 52428800;

  /**
   * List files and folders in a specific path
   */
  static async listFiles(path: string = ''): Promise<StorageFile[]> {
    const { data, error } = await supabase.storage
      .from(this.BUCKET_NAME)
      .list(path, {
        limit: 100,
        offset: 0,
        sortBy: { column: 'name', order: 'asc' },
      });

    if (error) throw error;
    return data as StorageFile[];
  }

  /**
   * Upload a file to the documents bucket
   */
  static async uploadFile(file: File, path: string = ''): Promise<string> {
    // Validate file size
    if (file.size > this.MAX_FILE_SIZE) {
      throw new Error(
        `File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds maximum allowed size (${(this.MAX_FILE_SIZE / 1024 / 1024).toFixed(2)}MB)`
      );
    }

    const filePath = path ? `${path}/${file.name}` : file.name;

    const { data, error } = await supabase.storage
      .from(this.BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) throw error;
    return data.path;
  }

  /**
   * Upload multiple files
   */
  static async uploadFiles(files: File[], path: string = ''): Promise<string[]> {
    const uploadPromises = files.map((file) => this.uploadFile(file, path));
    return Promise.all(uploadPromises);
  }

  /**
   * Create a folder (by uploading a .folderkeep file)
   */
  static async createFolder(folderName: string, parentPath: string = ''): Promise<string> {
    const folderPath = parentPath ? `${parentPath}/${folderName}` : folderName;

    // Create a small placeholder file to represent the folder
    const placeholderFile = new File([''], '.folderkeep', { type: 'text/plain' });
    const filePath = `${folderPath}/.folderkeep`;

    const { error } = await supabase.storage
      .from(this.BUCKET_NAME)
      .upload(filePath, placeholderFile, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) throw error;
    return folderPath;
  }

  /**
   * Delete a file
   */
  static async deleteFile(filePath: string): Promise<void> {
    const { error } = await supabase.storage
      .from(this.BUCKET_NAME)
      .remove([filePath]);

    if (error) throw error;
  }

  /**
   * Delete multiple files
   */
  static async deleteFiles(filePaths: string[]): Promise<void> {
    const { error } = await supabase.storage
      .from(this.BUCKET_NAME)
      .remove(filePaths);

    if (error) throw error;
  }

  /**
   * Delete a folder and all its contents
   */
  static async deleteFolder(folderPath: string): Promise<void> {
    // List all files in the folder
    const files = await this.listFiles(folderPath);

    // Delete all files in the folder
    const filePaths = files.map((file) =>
      folderPath ? `${folderPath}/${file.name}` : file.name
    );

    if (filePaths.length > 0) {
      await this.deleteFiles(filePaths);
    }

    // Delete the folder placeholder
    try {
      await this.deleteFile(`${folderPath}/.folderkeep`);
    } catch {
      // Folder might not have a placeholder
      console.warn('No folder placeholder found');
    }
  }

  /**
   * Get public URL for a file
   */
  static getPublicUrl(filePath: string): string {
    const { data } = supabase.storage
      .from(this.BUCKET_NAME)
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  /**
   * Download a file
   */
  static async downloadFile(filePath: string): Promise<Blob> {
    const { data, error } = await supabase.storage
      .from(this.BUCKET_NAME)
      .download(filePath);

    if (error) throw error;
    return data;
  }

  /**
   * Move/rename a file
   */
  static async moveFile(fromPath: string, toPath: string): Promise<void> {
    const { error } = await supabase.storage
      .from(this.BUCKET_NAME)
      .move(fromPath, toPath);

    if (error) throw error;
  }

  /**
   * Get file metadata
   */
  static async getFileMetadata(filePath: string): Promise<StorageFile | undefined> {
    const { data, error } = await supabase.storage
      .from(this.BUCKET_NAME)
      .list(filePath.split('/').slice(0, -1).join('/'), {
        search: filePath.split('/').pop(),
      });

    if (error) throw error;
    return data[0];
  }

  /**
   * Check if bucket exists, if not create it
   */
  static async ensureBucketExists(): Promise<void> {
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some((bucket) => bucket.name === this.BUCKET_NAME);

    if (!bucketExists) {
      const { error } = await supabase.storage.createBucket(this.BUCKET_NAME, {
        public: false,
        fileSizeLimit: this.MAX_FILE_SIZE,
      });

      if (error) throw error;
    }
  }

  /**
   * Get max file size in MB
   */
  static getMaxFileSizeMB(): number {
    return this.MAX_FILE_SIZE / 1024 / 1024;
  }
}
