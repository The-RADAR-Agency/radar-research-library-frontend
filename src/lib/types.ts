export interface User {
  id: string
  email: string
  full_name: string | null
  created_at: string
}

export interface SourceDocument {
  id: string
  title: string
  summary: string | null
  key_themes: string[] | null
  page_count: number | null
  publication_date: string | null
  publisher: string | null
  document_type: string
  uploaded_by: string
  uploaded_at: string
  processing_status: 'uploaded' | 'processing' | 'completed' | 'failed'
  visibility: 'just_me' | 'select_users' | 'radar_members' | 'public'
  visible_to: string[] | null
  card_image_url: string | null
  thumbnail_url: string | null
  file_url: string | null
  uploaded_by_user?: User
  topics?: Topic[]
  categories?: Category[]
  geographical_focus?: GeographicalFocus[]
}

export interface Driver {
  id: string
  driver_name: string
  description: string
  extracted_from: string
  verification_status: string
  verified_by: string | null
  verification_date: string | null
  verification_notes: string | null
  last_edited_by: string | null
  last_edited_at: string | null
  card_image_url: string | null
  created_at: string
  updated_at: string
  extracted_from_report?: SourceDocument
  verified_by_user?: User
  last_edited_by_user?: User
  topics?: Topic[]
  categories?: Category[]
  steep_categories?: SteepCategory[]
  geographical_focus?: GeographicalFocus[]
  industries?: Industry[]
}

export interface Trend {
  id: string
  trend_name: string
  description: string
  extracted_from: string
  trend_type: string | null
  time_horizon: string | null
  impact_potential: string | null
  likelihood: string | null
  verification_status: string
  verified_by: string | null
  verification_date: string | null
  verification_notes: string | null
  last_edited_by: string | null
  last_edited_at: string | null
  card_image_url: string | null
  created_at: string
  updated_at: string
  extracted_from_report?: SourceDocument
  verified_by_user?: User
  last_edited_by_user?: User
  topics?: Topic[]
  categories?: Category[]
  steep_categories?: SteepCategory[]
  geographical_focus?: GeographicalFocus[]
  industries?: Industry[]
}

export interface Signal {
  id: string
  signal_name: string
  description: string
  extracted_from: string
  strength: string | null
  observation_date: string | null
  potential_impact: string | null
  verification_status: string
  verified_by: string | null
  verification_date: string | null
  verification_notes: string | null
  last_edited_by: string | null
  last_edited_at: string | null
  card_image_url: string | null
  created_at: string
  updated_at: string
  extracted_from_report?: SourceDocument
  verified_by_user?: User
  last_edited_by_user?: User
  topics?: Topic[]
  categories?: Category[]
  steep_categories?: SteepCategory[]
  geographical_focus?: GeographicalFocus[]
  industries?: Industry[]
}

export interface Evidence {
  id: string
  evidence_text: string
  evidence_type: any
  extracted_from: string
  verification_status: string
  verified_by: string | null
  verification_date: string | null
  verification_notes: string | null
  last_edited_by: string | null
  last_edited_at: string | null
  card_image_url: string | null
  created_at: string
  updated_at: string
  extracted_from_report?: SourceDocument
  verified_by_user?: User
  last_edited_by_user?: User
  topics?: Topic[]
  categories?: Category[]
  steep_categories?: SteepCategory[]
  geographical_focus?: GeographicalFocus[]
  industries?: Industry[]
}

export interface Topic {
  id: string
  topic_name: string
  existing_assets?: string[]
}

export interface Category {
  id: string
  category_name: string
  industries?: string[]
}

export interface SteepCategory {
  id: string
  steep_name: string
  steep_code?: string
  color_code: string
  description?: string
  sort_order?: number
}

export interface GeographicalFocus {
  id: string
  region_name: string
  description?: string
  sort_order?: number
}

export interface Industry {
  id: string
  industry_name: string
}

export type Entity = Driver | Trend | Signal | Evidence

export interface LibraryFilters {
  topics: string[]
  categories: string[]
  steep: string[]
  geographies: string[]
  industries: string[]
  visibility: 'All' | 'My Content' | 'Shared with Me'
}
