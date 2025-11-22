import type { Product, Auction, PartCategory, User, AdminMessage, SiteSettings, LiftRentalBooking, AuditLogEntry, BlogPost, Contact } from '../types';
import * as db from './db';
import { http } from '../services/http';

// Helper to simulate network delay and return a promise
const simulateApiCall = <T>(data: T, delay = 200): Promise<T> => {
    return new Promise(resolve => {
        // Deep copy to prevent direct state mutation from components
        const dataCopy = JSON.parse(JSON.stringify(data));
        setTimeout(() => resolve(dataCopy), delay);
    });
};

const simulateApiError = (message: string, delay = 200): Promise<any> => {
    return new Promise((_, reject) => {
        setTimeout(() => reject(new Error(message)), delay);
    });
};

const USE_LOCAL_API = import.meta.env.MODE !== 'production' && import.meta.env.VITE_USE_LOCAL_API === 'true';
const normalizeAuction = (a: any): Auction => ({
  id: a.id,
  vehicle: {
    name: a.vehicleName ?? a.vehicle?.name ?? '',
    brand: a.brand ?? a.vehicle?.brand ?? '',
    model: a.model ?? a.vehicle?.model ?? '',
    year: Number(a.year ?? a.vehicle?.year ?? 0),
    mileage: Number(a.mileage ?? a.vehicle?.mileage ?? 0),
    description: a.description ?? a.vehicle?.description ?? '',
    images: Array.isArray(a.images) ? a.images : (Array.isArray(a.vehicle?.images) ? a.vehicle.images : ['https://picsum.photos/seed/auction/800/600']),
  },
  startingPrice: Number(a.startingPrice ?? 0),
  currentBid: Number(a.currentBid ?? 0),
  bidCount: Number(a.bidCount ?? 0),
  bids: Array.isArray(a.bids)
    ? a.bids.map((b: any) => ({
        userId: b.userId ?? '',
        bidderName: b.bidderName ?? '',
        amount: Number(b.amount ?? 0),
        timestamp: b?.timestamp ? new Date(b.timestamp) : new Date(),
      }))
    : [],
  endDate: a?.endDate ? new Date(a.endDate) : new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
});


// --- Site Settings API (real backend - no localStorage) ---
export const getSiteSettings = async (): Promise<SiteSettings> => {
  return USE_LOCAL_API ? simulateApiCall(db.getSiteSettings()) : http<SiteSettings>(`/api/settings`);
};
export const updateSiteSettings = async (newSettings: SiteSettings): Promise<SiteSettings> => {
  return USE_LOCAL_API ? simulateApiCall(db.updateSiteSettings(newSettings)) : http<SiteSettings>(`/api/settings`, { method: 'PUT', body: JSON.stringify(newSettings) });
};


// --- Products API (real backend) ---
export const getProducts = async (filters: { category?: string | PartCategory; brand?: string; model?: string, limit?: number }): Promise<Product[]> => {
  if (USE_LOCAL_API) {
    return simulateApiCall(db.getProducts({
      category: filters?.category ? String(filters.category) : undefined,
      brand: filters?.brand,
      model: filters?.model,
      limit: filters?.limit,
    }));
  }
  const params = new URLSearchParams();
  if (filters?.category) params.set('category', String(filters.category));
  if (filters?.brand) params.set('brand', String(filters.brand));
  if (filters?.model) params.set('model', String(filters.model));
  if (filters?.limit) params.set('limit', String(filters.limit));
  return http<Product[]>(`/api/products${params.toString() ? `?${params.toString()}` : ''}`);
};
export const getProductById = async (id: string): Promise<Product | undefined> =>
  USE_LOCAL_API ? simulateApiCall(db.getProductById(id)) : http<Product>(`/api/products/${id}`);
export const addProduct = async (productData: Omit<Product, 'id'>): Promise<Product> =>
  USE_LOCAL_API ? simulateApiCall(db.addProduct(productData)) : http<Product>(`/api/products`, { method: 'POST', body: JSON.stringify(productData) });
export const updateProduct = async (productId: string, productData: Partial<Omit<Product, 'id'>>): Promise<Product> =>
  USE_LOCAL_API ? simulateApiCall(db.updateProduct(productId, productData)) : http<Product>(`/api/products/${productId}`, { method: 'PUT', body: JSON.stringify(productData) });
export const deleteProduct = async (productId: string): Promise<{ success: boolean }> =>
  USE_LOCAL_API ? simulateApiCall(db.deleteProduct(productId)) : http<{ success: boolean }>(`/api/products/${productId}`, { method: 'DELETE' });


// --- Auctions API (real backend) ---
export const getAuctions = async (): Promise<Auction[]> => {
  if (USE_LOCAL_API) return simulateApiCall(db.getAuctions());
  const data = await http<any[]>(`/api/auctions`);
  return Array.isArray(data) ? data.map(normalizeAuction) : [];
};
export const getAuctionById = async (id: string): Promise<Auction | undefined> => {
  if (USE_LOCAL_API) return simulateApiCall(db.getAuctionById(id));
  const a = await http<any>(`/api/auctions/${id}`);
  return a ? normalizeAuction(a) : undefined;
};
export const addBid = async (auctionId: string, bidAmount: number, userId: string, bidderName: string): Promise<Auction> => {
  if (USE_LOCAL_API) return simulateApiCall(db.addBid(auctionId, bidAmount, userId, bidderName));
  const a = await http<any>(`/api/auctions/${auctionId}/bids`, { method: 'POST', body: JSON.stringify({ amount: bidAmount }) });
  return normalizeAuction(a);
};
export const addAuction = async (auctionData: Omit<Auction, 'id' | 'currentBid' | 'bidCount' | 'bids'>): Promise<Auction> => {
  if (USE_LOCAL_API) return simulateApiCall(db.addAuction(auctionData));
  const a = await http<any>(`/api/auctions`, { method: 'POST', body: JSON.stringify(auctionData) });
  return normalizeAuction(a);
};
export const updateAuction = async (auctionId: string, auctionData: Partial<Omit<Auction, 'id'>>): Promise<Auction> => {
  if (USE_LOCAL_API) return simulateApiCall(db.updateAuction(auctionId, auctionData));
  const a = await http<any>(`/api/auctions/${auctionId}`, { method: 'PUT', body: JSON.stringify(auctionData) });
  return normalizeAuction(a);
};
export const deleteAuction = async (auctionId: string): Promise<{ success: boolean }> =>
  USE_LOCAL_API ? simulateApiCall(db.deleteAuction(auctionId)) : http<{ success: boolean }>(`/api/auctions/${auctionId}`, { method: 'DELETE' });

// --- Blog API ---
export const getBlogPosts = (): Promise<BlogPost[]> => simulateApiCall(db.getBlogPosts());


// --- Forms API ---
export const submitContactForm = (data: any): Promise<{ success: boolean }> => simulateApiCall(db.submitContactForm(data));
export const submitScrapRemovalRequest = (data: any): Promise<{ success: boolean }> => simulateApiCall(db.submitScrapRemovalRequest(data));
export const submitWindshieldRequest = (data: any): Promise<{ success: boolean }> => simulateApiCall(db.submitWindshieldRequest(data));
export const submitLiftRentalRequest = (data: any): Promise<{ success: boolean }> => simulateApiCall(db.submitLiftRentalRequest(data));
export const submitBuybackRequest = (data: any): Promise<{ success: true, estimation: string }> => simulateApiCall(db.submitBuybackRequest(data));
export const submitQuoteRequest = (product: Product, quoteData: any): Promise<{ success: boolean }> => simulateApiCall(db.submitQuoteRequest(product, quoteData));

// --- Admin Messaging API ---
export const sendAdminReply = (data: any): Promise<{ success: boolean }> => simulateApiCall(db.sendAdminReply(data));
export const sendNewMessage = (data: any): Promise<{ success: boolean }> => simulateApiCall(db.sendNewMessage(data));
export const archiveMessage = (messageId: string, isArchived: boolean): Promise<AdminMessage> => simulateApiCall(db.archiveMessage(messageId, isArchived));


// --- Admin-specific API ---
export const getAdminUsers = (): Promise<User[]> => simulateApiCall(db.getAdminUsers());
export const getAdminMessages = (): Promise<AdminMessage[]> => simulateApiCall(db.getAdminMessages());
export const getContacts = (): Promise<Contact[]> => simulateApiCall(db.getContacts());
export const addContact = (contactData: Omit<Contact, 'id'>): Promise<Contact> => simulateApiCall(db.addContact(contactData));
export const getLiftRentalBookings = (): Promise<LiftRentalBooking[]> => simulateApiCall(db.getLiftRentalBookings());
export const getAuditLogs = (): Promise<AuditLogEntry[]> => simulateApiCall(db.getAuditLogs());
export const updateLiftRentalBookingStatus = (bookingId: string, status: LiftRentalBooking['status']): Promise<LiftRentalBooking> => simulateApiCall(db.updateLiftRentalBookingStatus(bookingId, status));
export const addUser = (userData: any): Promise<User> => simulateApiCall(db.addUser(userData));
export const updateUser = (userId: string, userData: Partial<Omit<User, 'id'>>): Promise<User> => simulateApiCall(db.updateUser(userId, userData));
export const approveUser = (userId: string): Promise<User> => simulateApiCall(db.approveUser(userId));
export const deleteUser = (userId: string): Promise<{ success: boolean }> => simulateApiCall(db.deleteUser(userId));


// --- User Account API ---
export const getBidsForUser = (userId: string): Promise<any[]> => simulateApiCall(db.getBidsForUser(userId));
export const getMessagesForUser = (userEmail: string): Promise<AdminMessage[]> => simulateApiCall(db.getMessagesForUser(userEmail));
export const updateUserProfile = (userId: string, data: { name: string, email: string }): Promise<User> => simulateApiCall(db.updateUserProfile(userId, data));
export const updateUserPassword = (userId: string, data: { current: string, new: string }): Promise<{ success: boolean }> => {
    try {
        return simulateApiCall(db.updateUserPassword(userId, data));
    } catch(e: any) {
        return simulateApiError(e.message);
    }
};

// --- Auth API ---
export const registerUser = (data: any): Promise<{ success: true }> => {
    try {
        return simulateApiCall(db.registerUser(data));
    } catch (e: any) {
        return simulateApiError(e.message);
    }
};
export const loginUser = (email: string, password: string): Promise<User> => {
    try {
        return simulateApiCall(db.loginUser(email, password));
    } catch (e: any) {
        return simulateApiError(e.message);
    }
};