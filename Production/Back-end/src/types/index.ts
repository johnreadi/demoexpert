export enum PartCategory {
  MECANIQUE = 'Mécanique',
  ELECTRICITE = 'Électricité',
  CARROSSERIE = 'Carrosserie',
  AUTRE = 'Autre'
}

export enum UserRole {
  ADMIN = 'Admin',
  STAFF = 'Staff'
}

export enum UserStatus {
  PENDING = 'pending',
  APPROVED = 'approved'
}

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled'
}

export enum MessageStatus {
  PENDING = 'pending',
  REPLIED = 'replied'
}

export enum QuoteStatus {
  PENDING = 'pending',
  REPLIED = 'replied',
  ARCHIVED = 'archived'
}

export enum ScrapRemovalStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum BuybackStatus {
  PENDING = 'pending',
  ESTIMATED = 'estimated',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  COMPLETED = 'completed'
}

export enum WindshieldServiceType {
  REPAIR = 'repair',
  REPLACEMENT = 'replacement'
}

export enum WindshieldUrgency {
  NORMAL = 'normal',
  URGENT = 'urgent'
}

export enum WindshieldStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  status: UserStatus;
  created_at: Date;
  updated_at: Date;
}

export interface PartCategory {
  id: string;
  name: PartCategory;
  created_at: Date;
}

export interface Product {
  id: string;
  name: string;
  oem_ref?: string;
  brand: string;
  model: string;
  year?: number;
  category_id?: string;
  price: number;
  condition: 'Neuf' | 'Bon état' | 'Occasion';
  warranty: string;
  compatibility: string;
  description: string;
  stock_quantity: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  images?: ProductImage[];
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  is_primary: boolean;
  sort_order: number;
  created_at: Date;
}

export interface Auction {
  id: string;
  vehicle_name: string;
  vehicle_brand: string;
  vehicle_model: string;
  vehicle_year: number;
  vehicle_mileage: number;
  vehicle_description: string;
  starting_price: number;
  current_bid: number;
  bid_count: number;
  end_date: Date;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  images?: AuctionImage[];
  bids?: Bid[];
}

export interface AuctionImage {
  id: string;
  auction_id: string;
  image_url: string;
  is_primary: boolean;
  sort_order: number;
  created_at: Date;
}

export interface Bid {
  id: string;
  auction_id: string;
  user_id: string;
  bidder_name: string;
  amount: number;
  timestamp: Date;
}

export interface LiftRentalBooking {
  id: string;
  user_name: string;
  user_email: string;
  user_phone: string;
  booking_date: Date;
  start_time: string;
  duration_hours: number;
  price: number;
  status: BookingStatus;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface AdminMessage {
  id: string;
  from_source: string;
  sender_name: string;
  sender_email: string;
  user_id?: string;
  subject: string;
  content: string;
  received_at: Date;
  is_read: boolean;
  is_archived: boolean;
  status: MessageStatus;
  attachment_name?: string;
  attachment_url?: string;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  source: string;
  created_at: Date;
}

export interface AuditLogEntry {
  id: string;
  timestamp: Date;
  user_id?: string;
  user_name?: string;
  action: string;
  details: string;
  ip_address?: string;
  user_agent?: string;
}

export interface SiteSettings {
  id: string;
  setting_key: string;
  setting_value: any;
  updated_at: Date;
}

export interface BlogPost {
  id: string;
  title: string;
  summary: string;
  content: string;
  image: string;
  is_published: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface QuoteRequest {
  id: string;
  product_id?: string;
  user_name: string;
  user_email: string;
  user_phone?: string;
  message: string;
  status: QuoteStatus;
  created_at: Date;
  updated_at: Date;
}

export interface ScrapRemovalRequest {
  id: string;
  user_name: string;
  user_email: string;
  user_phone?: string;
  vehicle_info: string;
  address: string;
  status: ScrapRemovalStatus;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface BuybackRequest {
  id: string;
  user_name: string;
  user_email: string;
  user_phone?: string;
  vehicle_info: string;
  estimated_value?: number;
  status: BuybackStatus;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface WindshieldRequest {
  id: string;
  user_name: string;
  user_email: string;
  user_phone?: string;
  vehicle_info: string;
  service_type: WindshieldServiceType;
  urgency: WindshieldUrgency;
  status: WindshieldStatus;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: Omit<User, 'password'>;
  token: string;
}
