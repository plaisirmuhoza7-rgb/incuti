export interface User {
  id: string;
  name: string;
  phone: string;
  created_at: string;
}

export interface Farm {
  id: string;
  user_id: string;
  location_text: string;
  district: string;
  area_ha: number;
  crops: string;
  intercrop: string;
  created_at: string;
}

export type RiskLevel = 'low' | 'moderate' | 'high';
export type ConfidenceLevel = 'low' | 'medium' | 'high';

export interface ScanRecord {
  id: string;
  farm_id: string;
  image_url: string;
  observation: string;
  risk_level: RiskLevel;
  recommendations: string[];
  explanation?: string;
  confidence?: ConfidenceLevel;
  created_at: string;
}

export interface ActionRecord {
  id: string;
  farm_id: string;
  action_type: string;
  description: string;
  photo_url?: string;
  status: string;
  created_at: string;
}

export interface LearningContentItem {
  id: string;
  category: string;
  title_kinyarwanda: string;
  description_kinyarwanda: string;
  video_url: string;
  related_risk_tags: string; // comma separated tags e.g. "erosion,soil_cover"
}

export interface ChatLogRecord {
  id: string;
  user_id: string;
  question: string;
  answer: string;
  created_at: string;
}

export interface GeminiScanAnalysis {
  observation: string;
  risk_level: RiskLevel;
  recommendations: string[];
  explanation: string;
  confidence: ConfidenceLevel;
}
