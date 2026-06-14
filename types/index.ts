export type ActivityCategory = 'travel' | 'diet' | 'shopping' | 'energy' | 'sustainable_action';

export interface UserProfile {
  id: string;
  updated_at: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  streak: number;
  points: number;
  last_active: string;
  created_at: string;
}

export interface Activity {
  id: string;
  user_id: string;
  category: ActivityCategory;
  subcategory: string;
  amount: number;
  unit: string;
  co2_emission: number;
  logged_at: string;
  details: Record<string, any>;
  created_at: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon_url: string;
  category: string;
  threshold: number;
  created_at: string;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  awarded_at: string;
  badges?: Badge; // Joined relation
}

export interface AIConversation {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
}

export interface AIMessage {
  id: string;
  conversation_id: string;
  role: 'user' | 'model';
  content: string;
  created_at: string;
}
