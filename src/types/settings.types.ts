export interface GeneralSetting {
  id: string;
  key: string;
  value: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export type SettingKey = 'map_drawing_video_url' | 'feedback_form_url';
