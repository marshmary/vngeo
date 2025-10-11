import { supabase } from '@/lib/supabase';
import type { GeneralSetting, SettingKey } from '@/types/settings.types';

export class SettingsService {
  /**
   * Get a setting by key
   */
  static async getSetting(key: SettingKey): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('general_settings')
        .select('value')
        .eq('key', key)
        .single();

      if (error) {
        console.error('Error fetching setting:', error);
        return null;
      }

      return data?.value || null;
    } catch (error) {
      console.error('Error fetching setting:', error);
      return null;
    }
  }

  /**
   * Get all settings
   */
  static async getAllSettings(): Promise<GeneralSetting[]> {
    try {
      const { data, error } = await supabase
        .from('general_settings')
        .select('*')
        .order('key', { ascending: true });

      if (error) {
        console.error('Error fetching settings:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching settings:', error);
      return [];
    }
  }

  /**
   * Update a setting
   */
  static async updateSetting(key: SettingKey, value: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('general_settings')
        .update({ value })
        .eq('key', key);

      if (error) {
        console.error('Error updating setting:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error updating setting:', error);
      return false;
    }
  }

  /**
   * Create a new setting (upsert)
   */
  static async upsertSetting(
    key: SettingKey,
    value: string,
    description?: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('general_settings')
        .upsert(
          { key, value, description },
          { onConflict: 'key' }
        );

      if (error) {
        console.error('Error upserting setting:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error upserting setting:', error);
      return false;
    }
  }

  /**
   * Get map drawing video URL
   */
  static async getMapDrawingVideoUrl(): Promise<string | null> {
    return this.getSetting('map_drawing_video_url');
  }

  /**
   * Update map drawing video URL
   */
  static async updateMapDrawingVideoUrl(url: string): Promise<boolean> {
    return this.upsertSetting(
      'map_drawing_video_url',
      url,
      'URL for the map drawing tutorial video'
    );
  }

  /**
   * Get feedback form URL
   */
  static async getFeedbackFormUrl(): Promise<string | null> {
    return this.getSetting('feedback_form_url');
  }

  /**
   * Update feedback form URL
   */
  static async updateFeedbackFormUrl(url: string): Promise<boolean> {
    return this.upsertSetting(
      'feedback_form_url',
      url,
      'URL for the feedback Google Form'
    );
  }
}
