/**
 * Global Type Definitions
 * 
 * Comprehensive type definitions for the entire application.
 * These types ensure type safety across all components and hooks.
 */

// ========== Database Entity Types ==========

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  role?: 'admin' | 'user' | 'agent';
  created_at: string;
  updated_at: string;
  last_login_at?: string;
  is_active: boolean;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  theme?: 'light' | 'dark' | 'system';
  language?: 'pt' | 'en';
  notifications?: NotificationPreferences;
  privacy?: PrivacySettings;
}

export interface NotificationPreferences {
  email_notifications: boolean;
  push_notifications: boolean;
  sms_notifications: boolean;
  marketing_emails: boolean;
  event_reminders: boolean;
  weekly_digest: boolean;
}

export interface PrivacySettings {
  profile_visibility: 'public' | 'private' | 'friends';
  show_activity: boolean;
  show_location: boolean;
  allow_tags: boolean;
}

// ========== Event System Types ==========

export interface Event {
  id: string;
  title: string;
  description?: string;
  slug: string;
  date_start: string;
  date_end?: string;
  location?: string;
  address?: string;
  city: string;
  state: string;
  country: string;
  image_url?: string;
  price_min?: number;
  price_max?: number;
  currency: string;
  status: EventStatus;
  organizer_id?: string;
  venue_id?: string;
  category_ids?: string[];
  created_at: string;
  updated_at: string;
  published_at?: string;
  views?: number;
  likes?: number;
  
  // Relationships
  organizer?: Organizer;
  venue?: Venue;
  categories?: Category[];
  tickets?: TicketTier[];
  reviews?: EventReview[];
  images?: EventImage[];
  occurrences?: EventOccurrence[];
}

export type EventStatus = 'draft' | 'published' | 'cancelled' | 'postponed' | 'sold_out';

export interface EventOccurrence {
  id: string;
  event_id: string;
  date_start: string;
  date_end?: string;
  available_tickets?: number;
  status: EventStatus;
}

export interface TicketTier {
  id: string;
  event_id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  quantity_total?: number;
  quantity_available?: number;
  sale_start?: string;
  sale_end?: string;
  is_active: boolean;
}

export interface EventReview {
  id: string;
  event_id: string;
  user_id: string;
  rating: number;
  comment?: string;
  created_at: string;
  user?: User;
}

export interface EventImage {
  id: string;
  event_id: string;
  url: string;
  alt_text?: string;
  order_index: number;
  is_cover: boolean;
}

// ========== Venue Types ==========

export interface Venue {
  id: string;
  name: string;
  description?: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postal_code?: string;
  latitude?: number;
  longitude?: number;
  capacity?: number;
  phone?: string;
  email?: string;
  website?: string;
  image_url?: string;
  amenities?: VenueAmenity[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface VenueAmenity {
  id: string;
  name: string;
  icon?: string;
  category: 'accessibility' | 'facilities' | 'services' | 'tech';
}

// ========== Organizer Types ==========

export interface Organizer {
  id: string;
  name: string;
  description?: string;
  email?: string;
  phone?: string;
  website?: string;
  instagram?: string;
  facebook?: string;
  twitter?: string;
  logo_url?: string;
  banner_url?: string;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ========== Artist Types ==========

export interface Artist {
  id: string;
  name: string;
  stage_name?: string;
  bio?: string;
  genre?: string[];
  city?: string;
  state?: string;
  country?: string;
  email?: string;
  phone?: string;
  instagram?: string;
  facebook?: string;
  spotify_url?: string;
  youtube_url?: string;
  website?: string;
  image_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ========== Category Types ==========

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  parent_id?: string;
  order_index: number;
  is_active: boolean;
  children?: Category[];
}

// ========== Blog Types ==========

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  cover_url?: string;
  status: PostStatus;
  category_id?: string;
  author_id: string;
  published_at?: string;
  created_at: string;
  updated_at: string;
  views?: number;
  likes?: number;
  
  // SEO fields
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string[];
  
  // Relationships
  author?: User;
  category?: Category;
  tags?: Tag[];
  comments?: Comment[];
}

export type PostStatus = 'draft' | 'published' | 'archived';

export interface Tag {
  id: string;
  name: string;
  slug: string;
  color?: string;
  count?: number;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  status: CommentStatus;
  parent_id?: string;
  created_at: string;
  updated_at: string;
  user?: User;
  replies?: Comment[];
}

export type CommentStatus = 'pending' | 'approved' | 'rejected' | 'spam';

// ========== Notification Types ==========

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  read_at?: string;
  created_at: string;
  action_url?: string;
  image_url?: string;
}

export type NotificationType = 
  | 'event_reminder' 
  | 'new_event' 
  | 'event_update' 
  | 'event_cancelled'
  | 'comment_reply'
  | 'like_received'
  | 'follow_received'
  | 'system_announcement'
  | 'promotion';

// ========== Form Types ==========

export interface FormFieldProps {
  name: string;
  label?: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string | boolean;
  className?: string;
}

export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
  group?: string;
}

export interface FormValidationError {
  field: string;
  message: string;
  code?: string;
}

// ========== UI Component Types ==========

export interface TableColumn<T = unknown> {
  key: string;
  title: string;
  dataIndex?: keyof T;
  width?: number | string;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: unknown, item: T, index: number) => React.ReactNode;
}

export interface PaginationInfo {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface FilterOption {
  label: string;
  value: string | number;
  count?: number;
}

export interface SortOption {
  field: string;
  direction: 'asc' | 'desc';
}

// ========== API Response Types ==========

export interface ApiResponse<T = unknown> {
  data: T;
  success: boolean;
  message?: string;
  errors?: FormValidationError[];
  meta?: {
    pagination?: PaginationInfo;
    total?: number;
    count?: number;
    [key: string]: unknown;
  };
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: Record<string, unknown>;
}

// ========== Search and Filter Types ==========

export interface SearchFilters {
  query?: string;
  category?: string[];
  city?: string[];
  date_range?: {
    start?: string;
    end?: string;
  };
  price_range?: {
    min?: number;
    max?: number;
  };
  status?: string[];
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface SearchResult<T = unknown> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  filters: SearchFilters;
  facets?: Record<string, FilterOption[]>;
}

// ========== Analytics Types ==========

export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, unknown>;
  timestamp?: Date;
  user_id?: string;
  session_id?: string;
}

export interface AnalyticsMetric {
  name: string;
  value: number;
  change?: number;
  change_percentage?: number;
  period: string;
}

// ========== Hook Return Types ==========

export interface UseLoadingReturn {
  isLoading: (key?: string) => boolean;
  startLoading: (key?: string) => void;
  stopLoading: (key?: string) => void;
  toggleLoading: (key?: string) => void;
  withLoading: <T extends unknown[]>(
    fn: (...args: T) => Promise<unknown>,
    key?: string
  ) => (...args: T) => Promise<unknown>;
  loadingStates: Record<string, boolean>;
  hasAnyLoading: boolean;
}

export interface UseAuthReturn {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  role: string | null;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name?: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

// ========== Utility Types ==========

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type ID = string;

export type Timestamp = string;

export type Status = 'active' | 'inactive' | 'pending' | 'suspended';

// ========== Event Handler Types ==========

export type ClickHandler = (event: React.MouseEvent<HTMLElement>) => void;
export type ChangeHandler<T = string> = (value: T) => void;
export type SubmitHandler<T = Record<string, unknown>> = (data: T) => void | Promise<void>;
export type ErrorHandler = (error: Error | ApiError) => void;

// ========== Component Prop Types ==========

export interface BaseProps {
  className?: string;
  children?: React.ReactNode;
  'data-testid'?: string;
}

export interface InteractiveProps {
  disabled?: boolean;
  loading?: boolean;
  onClick?: ClickHandler;
}

export interface RouterProps {
  to?: string;
  replace?: boolean;
  state?: unknown;
}

// ========== Context Types ==========

export interface ThemeContextValue {
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  isDark: boolean;
}

export interface AuthContextValue extends UseAuthReturn {}

export interface NotificationContextValue {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'created_at'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

// ========== Configuration Types ==========

export interface AppConfig {
  api: {
    baseUrl: string;
    timeout: number;
    retries: number;
  };
  features: {
    analytics: boolean;
    notifications: boolean;
    darkMode: boolean;
    i18n: boolean;
  };
  seo: {
    defaultTitle: string;
    defaultDescription: string;
    defaultKeywords: string[];
    siteUrl: string;
  };
  social: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
}

// Re-export commonly used React types for convenience
export type { ReactNode, ReactElement, ComponentType, FC } from 'react';