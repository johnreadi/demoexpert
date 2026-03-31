import type { Product, Auction, PartCategory, User, AdminMessage, SiteSettings, LiftRentalBooking, AuditLogEntry, BlogPost, Contact } from '../types';
import { http } from '../services/http';
const normalizeAuction = (a: any): Auction => {
  // Handle case where auction data comes directly from database (flat structure)
  const rawVehicle = a?.vehicle ?? {
    name: a?.vehicleName ?? a?.name ?? '',
    brand: a?.brand ?? '',
    model: a?.model ?? '',
    year: a?.year ?? 0,
    mileage: a?.mileage ?? 0,
    description: a?.description ?? '',
    images: a?.images ?? [],
    videos: a?.videos ?? []
  };

  const images = (Array.isArray(rawVehicle.images) && rawVehicle.images.length > 0)
    ? rawVehicle.images
    : (Array.isArray(a?.images) && a.images.length > 0)
      ? a.images
      : ['https://picsum.photos/seed/auction/800/600'];

  const safeVehicle = {
    name: rawVehicle.name || a?.vehicleName || a?.name || '',
    brand: rawVehicle.brand || a?.brand || '',
    model: rawVehicle.model || a?.model || '',
    year: Number(rawVehicle.year || a?.year || 0),
    mileage: Number(rawVehicle.mileage || a?.mileage || 0),
    description: rawVehicle.description || a?.description || '',
    images,
    videos: Array.isArray(rawVehicle.videos) ? rawVehicle.videos : [],
  };

  return {
    id: a?.id ?? '',
    vehicle: safeVehicle,
    startingPrice: Number(a?.startingPrice ?? 0),
    currentBid: Number(a?.currentBid ?? 0),
    bidCount: Number(a?.bidCount ?? 0),
    bids: Array.isArray(a?.bids)
      ? a.bids.map((b: any) => ({
          userId: b?.userId ?? b?.user?.id ?? '',
          bidderName: b?.bidderName ?? b?.user?.name ?? 'Anonymous',
          amount: Number(b?.amount ?? 0),
          timestamp: b?.timestamp ? new Date(b.timestamp) : new Date(),
        }))
      : [],
    endDate: a?.endDate ? new Date(a.endDate) : new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
  };
};


// --- Site Settings API (real backend - no localStorage) ---
export const getSiteSettings = async (): Promise<SiteSettings> => {
  return http<SiteSettings>(`/api/settings`);
};
export const updateSiteSettings = async (newSettings: SiteSettings): Promise<SiteSettings> => {
  return http<SiteSettings>(`/api/settings`, { method: 'PUT', body: JSON.stringify(newSettings) });
};


// --- Products API (real backend) ---
export const getProducts = async (filters: { category?: string | PartCategory; brand?: string; model?: string, limit?: number }): Promise<Product[]> => {
  const params = new URLSearchParams();
  if (filters?.category) params.set('category', String(filters.category));
  if (filters?.brand) params.set('brand', String(filters.brand));
  if (filters?.model) params.set('model', String(filters.model));
  if (filters?.limit) params.set('limit', String(filters.limit));
  return http<Product[]>(`products${params.toString() ? `?${params.toString()}` : ''}`);
};
export const getProductById = async (id: string): Promise<Product | undefined> =>
  http<Product>(`products/${id}`);
export const addProduct = async (productData: Omit<Product, 'id'>): Promise<Product> =>
  http<Product>(`products`, { method: 'POST', body: JSON.stringify(productData) });
export const updateProduct = async (productId: string, productData: Partial<Omit<Product, 'id'>>): Promise<Product> =>
  http<Product>(`products/${productId}`, { method: 'PUT', body: JSON.stringify(productData) });
export const deleteProduct = async (productId: string): Promise<{ success: boolean }> =>
  http<{ success: boolean }>(`products/${productId}`, { method: 'DELETE' });


// --- Auctions API (real backend) ---
export const getAuctions = async (): Promise<Auction[]> => {
  const data = await http<any[]>(`auctions`);
  return Array.isArray(data) ? data.map(normalizeAuction) : [];
};
export const getAuctionById = async (id: string): Promise<Auction | undefined> => {
  const a = await http<any>(`auctions/${id}`);
  return a ? normalizeAuction(a) : undefined;
};
export const addBid = async (auctionId: string, bidAmount: number, userId: string, bidderName: string): Promise<Auction> => {
  const a = await http<any>(`auctions/${auctionId}/bids`, { method: 'POST', body: JSON.stringify({ amount: bidAmount }) });
  return normalizeAuction(a);
};
export const addAuction = async (auctionData: Omit<Auction, 'id' | 'currentBid' | 'bidCount' | 'bids'>): Promise<Auction> => {
  const a = await http<any>(`auctions`, { method: 'POST', body: JSON.stringify(auctionData) });
  return normalizeAuction(a);
};
export const updateAuction = async (auctionId: string, auctionData: Partial<Omit<Auction, 'id'>>): Promise<Auction> => {
  const a = await http<any>(`auctions/${auctionId}`, { method: 'PUT', body: JSON.stringify(auctionData) });
  return normalizeAuction(a);
};
export const deleteAuction = async (auctionId: string): Promise<{ success: boolean }> =>
  http<{ success: boolean }>(`auctions/${auctionId}`, { method: 'DELETE' });

// --- Blog API ---
export const getBlogPosts = (): Promise<BlogPost[]> => 
  http<BlogPost[]>(`/api/blog`);


// --- Forms API ---
export const submitContactForm = (data: any): Promise<{ success: boolean }> => 
  http<{ success: boolean }>(`/api/contact`, { method: 'POST', body: JSON.stringify(data) });

export const submitScrapRemovalRequest = (data: any): Promise<{ success: boolean }> => 
  http<{ success: boolean }>(`/api/scrap-removal`, { method: 'POST', body: JSON.stringify(data) });

export const submitWindshieldRequest = (data: any): Promise<{ success: boolean }> => 
  http<{ success: boolean }>(`/api/windshield`, { method: 'POST', body: JSON.stringify(data) });

export const submitLiftRentalRequest = (data: any): Promise<{ success: boolean }> => 
  http<{ success: boolean }>(`/api/lift-rental`, { method: 'POST', body: JSON.stringify(data) });

export const submitBuybackRequest = (data: any): Promise<{ success: true, estimation: string }> => 
  http<{ success: true, estimation: string }>(`/api/buyback`, { method: 'POST', body: JSON.stringify(data) });

export const submitQuoteRequest = (product: Product, quoteData: any): Promise<{ success: boolean }> => 
  http<{ success: boolean }>(`/api/quote`, { method: 'POST', body: JSON.stringify({ product, ...quoteData }) });

// --- Admin Messaging API ---
export const getAdminMessages = (): Promise<AdminMessage[]> => 
  http<AdminMessage[]>(`/api/admin/messages`);

export const sendAdminReply = (data: any): Promise<{ success: boolean }> => 
  http<{ success: boolean }>(`/api/admin/messages`, { method: 'POST', body: JSON.stringify(data) });

export const sendNewMessage = (data: any): Promise<{ success: boolean }> => 
  http<{ success: boolean }>(`/api/admin/messages`, { method: 'POST', body: JSON.stringify(data) });

export const archiveMessage = (messageId: string, isArchived: boolean): Promise<AdminMessage> => 
  http<AdminMessage>(`/api/admin/messages/${messageId}`, { method: 'PUT', body: JSON.stringify({ isArchived }) });

// --- Admin-specific API ---
export const getAdminUsers = (): Promise<User[]> => 
  http<User[]>(`/api/admin/users`);

export const getContacts = (): Promise<Contact[]> => 
  http<Contact[]>(`/api/contact`);

export const addContact = (contactData: Omit<Contact, 'id'>): Promise<Contact> => 
  http<Contact>(`/api/contact`, { method: 'POST', body: JSON.stringify(contactData) });

export const getLiftRentalBookings = (): Promise<LiftRentalBooking[]> => 
  http<LiftRentalBooking[]>(`/api/lift-bookings`);

export const getAuditLogs = (): Promise<AuditLogEntry[]> => 
  http<AuditLogEntry[]>(`/api/audit-logs`);

export const updateLiftRentalBookingStatus = (bookingId: string, status: LiftRentalBooking['status']): Promise<LiftRentalBooking> => 
  http<LiftRentalBooking>(`/api/lift-bookings/${bookingId}/status`, { method: 'PUT', body: JSON.stringify({ status }) });

export const addUser = (userData: any): Promise<User> => 
  http<User>(`/api/admin/users`, { method: 'POST', body: JSON.stringify(userData) });

export const updateUser = (userId: string, userData: Partial<Omit<User, 'id'>>): Promise<User> => 
  http<User>(`/api/admin/users/${userId}`, { method: 'PUT', body: JSON.stringify(userData) });

export const approveUser = (userId: string): Promise<User> => 
  http<User>(`/api/admin/users/${userId}/approve`, { method: 'POST', body: JSON.stringify({}) });

export const deleteUser = (userId: string): Promise<{ success: boolean }> => 
  http<{ success: boolean }>(`/api/admin/users/${userId}`, { method: 'DELETE' });


// --- User Account API ---
export const getBidsForUser = (userId: string): Promise<any[]> => 
  http<any[]>(`/api/users/${userId}/bids`);
export const getMessagesForUser = (userEmail: string): Promise<AdminMessage[]> => 
  http<AdminMessage[]>(`/api/users/me/messages`);
export const updateUserProfile = (userId: string, data: { name: string, email: string }): Promise<User> => 
  http<User>(`/api/users/${userId}`, { method: 'PUT', body: JSON.stringify(data) });
export const updateUserPassword = (userId: string, data: { current: string, new: string }): Promise<{ success: boolean }> => {
    return http<{ success: boolean }>(`/api/users/${userId}/password`, { method: 'PUT', body: JSON.stringify(data) });
};

// --- Auth API ---
export const registerUser = (data: any): Promise<{ success: true }> => {
    return http<{ success: true }>(`/auth/register`, { method: 'POST', body: JSON.stringify(data) });
};
export const loginUser = (email: string, password: string): Promise<User> => {
    return http<User>(`/auth/login`, { method: 'POST', body: JSON.stringify({ email, password }) });
};

export const deleteAdminMessage = (messageId: string): Promise<{ success: boolean }> =>
  http<{ success: boolean }>(`/api/admin/messages/${messageId}`, { method: 'DELETE' });

export const deleteContactsBulk = (ids: string[] = [], emails: string[] = []): Promise<{ deleted: number }> =>
  http<{ deleted: number }>(`/api/contacts/delete`, { method: 'POST', body: JSON.stringify({ ids, emails }) });

// Test SMTP configuration
export const testSmtpConfig = (testEmail: string): Promise<{ success: boolean; message?: string }> =>
  http<{ success: boolean; message?: string }>(`/api/test-smtp`, { method: 'POST', body: JSON.stringify({ testEmail }) });
