import type { Product, Auction, PartCategory, User, AdminMessage, SiteSettings, LiftRentalBooking, AuditLogEntry, BlogPost, Contact, ChatMessage } from '../types';

// Helper to handle API responses
const handleResponse = async (response: Response) => {
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `API Error: ${response.statusText}`);
    }
    return response.json();
};

const apiFetch = (url: string, options: RequestInit = {}) => {
    return fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    }).then(handleResponse);
};

// --- Site Settings API ---
export const getSiteSettings = (): Promise<SiteSettings> => apiFetch('/api/settings');
export const updateSiteSettings = (newSettings: SiteSettings): Promise<SiteSettings> => apiFetch('/api/settings', { method: 'POST', body: JSON.stringify(newSettings) });

// --- Products API ---
export const getProducts = (filters: { category?: string | PartCategory; brand?: string; model?: string, limit?: number }): Promise<Product[]> => {
    const params = new URLSearchParams(filters as any).toString();
    return apiFetch(`/api/products?${params}`);
};
export const getProductById = (id: string): Promise<Product | undefined> => apiFetch(`/api/products/${id}`);
export const addProduct = (productData: Omit<Product, 'id'>): Promise<Product> => apiFetch('/api/products', { method: 'POST', body: JSON.stringify(productData) });
export const updateProduct = (productId: string, productData: Partial<Omit<Product, 'id'>>): Promise<Product> => apiFetch(`/api/products/${productId}`, { method: 'PUT', body: JSON.stringify(productData) });
export const deleteProduct = (productId: string): Promise<{ success: boolean }> => apiFetch(`/api/products/${productId}`, { method: 'DELETE' });

// --- Auctions API ---
export const getAuctions = (): Promise<Auction[]> => apiFetch('/api/auctions');
export const getAuctionById = (id: string): Promise<Auction | undefined> => apiFetch(`/api/auctions/${id}`);
export const addBid = (auctionId: string, bidAmount: number, userId: string, bidderName: string): Promise<Auction> => apiFetch(`/api/auctions/${auctionId}/bids`, { method: 'POST', body: JSON.stringify({ bidAmount, userId, bidderName }) });
export const addAuction = (auctionData: Omit<Auction, 'id' | 'currentBid' | 'bidCount' | 'bids'>): Promise<Auction> => apiFetch('/api/auctions', { method: 'POST', body: JSON.stringify(auctionData) });
export const updateAuction = (auctionId: string, auctionData: Partial<Omit<Auction, 'id'>>): Promise<Auction> => apiFetch(`/api/auctions/${auctionId}`, { method: 'PUT', body: JSON.stringify(auctionData) });
export const deleteAuction = (auctionId: string): Promise<{ success: boolean }> => apiFetch(`/api/auctions/${auctionId}`, { method: 'DELETE' });

// --- Blog API ---
export const getBlogPosts = (): Promise<BlogPost[]> => apiFetch('/api/blog');

// --- Forms API ---
export const submitContactForm = (data: any): Promise<{ success: boolean }> => apiFetch('/api/forms/contact', { method: 'POST', body: JSON.stringify(data) });
export const submitScrapRemovalRequest = (data: any): Promise<{ success: boolean }> => apiFetch('/api/forms/scrap-removal', { method: 'POST', body: JSON.stringify(data) });
export const submitWindshieldRequest = (data: any): Promise<{ success: boolean }> => apiFetch('/api/forms/windshield', { method: 'POST', body: JSON.stringify(data) });
export const submitLiftRentalRequest = (data: any): Promise<{ success: boolean }> => apiFetch('/api/forms/lift-rental', { method: 'POST', body: JSON.stringify(data) });
export const submitBuybackRequest = (data: any): Promise<{ success: true, estimation: string }> => apiFetch('/api/forms/buyback', { method: 'POST', body: JSON.stringify(data) });
export const submitQuoteRequest = (product: Product, quoteData: any): Promise<{ success: boolean }> => apiFetch('/api/forms/quote', { method: 'POST', body: JSON.stringify({ product, quoteData }) });

// --- AI Chat Service ---
export const getAiChatResponse = async (message: string, history: ChatMessage[], settings: SiteSettings | null): Promise<string> => {
    const response = await apiFetch('/api/chat', {
        method: 'POST',
        body: JSON.stringify({ message, history, settings }),
    });
    return response.text;
};

// --- Admin Messaging API ---
export const sendAdminReply = (data: any): Promise<{ success: boolean }> => apiFetch('/api/admin/messages/reply', { method: 'POST', body: JSON.stringify(data) });
export const sendNewMessage = (data: any): Promise<{ success: boolean }> => apiFetch('/api/admin/messages/new', { method: 'POST', body: JSON.stringify(data) });
export const archiveMessage = (messageId: string, isArchived: boolean): Promise<AdminMessage> => apiFetch(`/api/admin/messages/${messageId}/archive`, { method: 'POST', body: JSON.stringify({ isArchived }) });

// --- Admin-specific API ---
export const getAdminUsers = (): Promise<User[]> => apiFetch('/api/admin/users');
export const getAdminMessages = (): Promise<AdminMessage[]> => apiFetch('/api/admin/messages');
export const getContacts = (): Promise<Contact[]> => apiFetch('/api/admin/contacts');
export const addContact = (contactData: Omit<Contact, 'id'>): Promise<Contact> => apiFetch('/api/admin/contacts', { method: 'POST', body: JSON.stringify(contactData) });
export const getLiftRentalBookings = (): Promise<LiftRentalBooking[]> => apiFetch('/api/admin/bookings');
export const getAuditLogs = (): Promise<AuditLogEntry[]> => apiFetch('/api/admin/logs');
export const updateLiftRentalBookingStatus = (bookingId: string, status: LiftRentalBooking['status']): Promise<LiftRentalBooking> => apiFetch(`/api/admin/bookings/${bookingId}/status`, { method: 'PUT', body: JSON.stringify({ status }) });
export const addUser = (userData: any): Promise<User> => apiFetch('/api/admin/users', { method: 'POST', body: JSON.stringify(userData) });
export const updateUser = (userId: string, userData: Partial<Omit<User, 'id'>>): Promise<User> => apiFetch(`/api/admin/users/${userId}`, { method: 'PUT', body: JSON.stringify(userData) });
export const approveUser = (userId: string): Promise<User> => apiFetch(`/api/admin/users/${userId}/approve`, { method: 'POST' });
export const deleteUser = (userId: string): Promise<{ success: boolean }> => apiFetch(`/api/admin/users/${userId}`, { method: 'DELETE' });

// --- User Account API ---
export const getBidsForUser = (userId: string): Promise<any[]> => apiFetch(`/api/account/bids/${userId}`);
export const getMessagesForUser = (userEmail: string): Promise<AdminMessage[]> => apiFetch(`/api/account/messages?email=${encodeURIComponent(userEmail)}`);
export const updateUserProfile = (userId: string, data: { name: string, email: string }): Promise<User> => apiFetch(`/api/account/profile/${userId}`, { method: 'PUT', body: JSON.stringify(data) });
export const updateUserPassword = (userId: string, data: { current: string, new: string }): Promise<{ success: boolean }> => apiFetch(`/api/account/password/${userId}`, { method: 'PUT', body: JSON.stringify(data) });

// --- Auth API ---
export const registerUser = (data: any): Promise<{ success: true }> => apiFetch('/api/auth/register', { method: 'POST', body: JSON.stringify(data) });
export const loginUser = (email: string, password: string): Promise<User> => apiFetch('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
