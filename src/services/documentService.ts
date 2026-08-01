import { supabase } from '@/lib/supabase';

export interface StorageFile {
  id?: string | null;
  name: string;
  bucket_id?: string | null;
  created_at: string | null;
  updated_at: string | null;
  last_accessed_at?: string | null;
  metadata?: {
    size?: number;
    mimetype?: string;
    [key: string]: unknown;
  } | null;
}

export class DocumentService {
  private static BUCKET_NAME = import.meta.env.VITE_SUPABASE_STORAGE_BUCKET || 'documents';
  // Vite exposes all VITE_* env vars as strings, so coerce to a Number.
  // Fall back to 50MB if unset/invalid to match the documented default.
  private static MAX_FILE_SIZE = Number(import.meta.env.VITE_SUPABASE_MAX_FILE_SIZE) || 52428800;

  /**
   * Ensure the Supabase auth session has been restored before issuing storage
   * requests. The supabase-js client restores the persisted session
   * asynchronously on startup; if a storage request fires before that
   * completes, it goes out without an Authorization header and the RLS
   * policies return restricted/empty results (the "documents don't show on
   * first load, refresh fixes it" race). `getSession()` resolves once
   * restoration is finished.
   */
  private static async ensureAuthReady(): Promise<void> {
    try {
      await supabase.auth.getSession();
    } catch (error) {
      console.warn('[DocumentService] getSession threw, proceeding:', error);
    }
  }

  /**
   * List files and folders in a specific path
   */
  static async listFiles(path: string = ''): Promise<StorageFile[]> {
    await this.ensureAuthReady();

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
   * Delete a folder and all its contents.
   *
   * Supabase Storage has no native "delete folder" — a folder is just the set
   * of objects whose keys share a prefix. So we list everything under the
   * prefix and delete those objects in one batch. The `.folderkeep` placeholder
   * (if present) is just another object in that listing, so it is removed in
   * the same batch — no separate delete call needed.
   */
  static async deleteFolder(folderPath: string): Promise<void> {
    const files = await this.listFiles(folderPath);

    const filePaths = files.map((file) =>
      folderPath ? `${folderPath}/${file.name}` : file.name
    );

    if (filePaths.length === 0) return;

    await this.deleteFiles(filePaths);
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

  /**
   * Get max file size in bytes (for direct comparison with File.size)
   */
  static getMaxFileSizeBytes(): number {
    return this.MAX_FILE_SIZE;
  }
}
