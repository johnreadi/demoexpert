const { PartCategory, MOCK_SITE_SETTINGS, MOCK_PRODUCTS, MOCK_USERS, MOCK_AUCTIONS, MOCK_ADMIN_MESSAGES } = require('./mock_data');

// Base de données en mémoire
let db = {
    products: JSON.parse(JSON.stringify(MOCK_PRODUCTS)),
    auctions: JSON.parse(JSON.stringify(MOCK_AUCTIONS)),
    users: JSON.parse(JSON.stringify(MOCK_USERS)),
    messages: JSON.parse(JSON.stringify(MOCK_ADMIN_MESSAGES)),
    settings: JSON.parse(JSON.stringify(MOCK_SITE_SETTINGS)),
    bookings: [],
    logs: [],
    blog: [],
    contacts: [],
};


// --- Fonctions de la base de données ---

const getSiteSettings = () => db.settings;
const updateSiteSettings = (newSettings) => {
    db.settings = { ...db.settings, ...newSettings };
    return db.settings;
};

const getProducts = (filters) => {
    let products = db.products;
    if (filters.category) products = products.filter(p => p.category === filters.category);
    if (filters.brand) products = products.filter(p => p.brand.toLowerCase().includes(filters.brand.toLowerCase()));
    if (filters.limit) products = products.slice(0, filters.limit);
    return products;
};

const getProductById = (id) => db.products.find(p => p.id === id);
const addProduct = (productData) => {
    const newProduct = { ...productData, id: `prod-${Date.now()}` };
    db.products.unshift(newProduct);
    return newProduct;
};
const updateProduct = (productId, productData) => {
    const index = db.products.findIndex(p => p.id === productId);
    if (index === -1) throw new Error("Product not found");
    db.products[index] = { ...db.products[index], ...productData };
    return db.products[index];
};
const deleteProduct = (productId) => {
    db.products = db.products.filter(p => p.id !== productId);
    return { success: true };
};

const getAuctions = () => db.auctions;
const getAuctionById = (id) => db.auctions.find(a => a.id === id);

const addBid = (auctionId, bidAmount, userId, bidderName) => {
    const auction = db.auctions.find(a => a.id === auctionId);
    if (!auction) throw new Error("Auction not found");
    if (bidAmount <= auction.currentBid) throw new Error("Bid must be higher than current bid");
    
    auction.currentBid = bidAmount;
    auction.bidCount++;
    auction.bids.unshift({ userId, bidderName, amount: bidAmount, timestamp: new Date().toISOString() });
    return auction;
};

const addAuction = (auctionData) => {
    const newAuction = {
        ...auctionData,
        id: `auc-${Date.now()}`,
        currentBid: auctionData.startingPrice,
        bidCount: 0,
        bids: [],
    };
    db.auctions.unshift(newAuction);
    return newAuction;
};

const updateAuction = (auctionId, auctionData) => {
    const index = db.auctions.findIndex(a => a.id === auctionId);
    if (index === -1) throw new Error("Auction not found");
    db.auctions[index] = { ...db.auctions[index], ...auctionData };
    return db.auctions[index];
};

const deleteAuction = (auctionId) => {
    db.auctions = db.auctions.filter(a => a.id !== auctionId);
    return { success: true };
};

const addMessageToDb = (message) => {
    const newMessage = { ...message, id: `msg-${Date.now()}` };
    db.messages.unshift(newMessage);
    return newMessage;
};

const submitContactForm = (data) => {
    addMessageToDb({
        from: 'Formulaire de Contact', senderName: data.name, senderEmail: data.email, subject: data.subject, content: data.message,
        receivedAt: new Date().toISOString(), isRead: false, isArchived: false, status: 'pending'
    });
    return { success: true };
};

const submitBuybackRequest = (data) => {
    addMessageToDb({
        from: "Rachat de véhicule", senderName: data.name, senderEmail: data.email, subject: `Rachat: ${data.brand} ${data.model}`, 
        content: `Demande de rachat pour ${data.brand} ${data.model} (${data.year}).`,
        receivedAt: new Date().toISOString(), isRead: false, isArchived: false, status: 'pending'
    });
    return { success: true, estimation: "Notre équipe analyse votre demande et vous contactera avec une estimation détaillée très prochainement." };
};

const submitScrapRemovalRequest = (data) => { addMessageToDb({ from: "Enlèvement d'épave", senderName: data.name, senderEmail: data.email, subject: `Enlèvement ${data.vehicle}`, content: `Demande pour enlever: ${data.vehicle}`, receivedAt: new Date().toISOString(), isRead: false, isArchived: false, status: 'pending' }); return { success: true }; };
const submitWindshieldRequest = (data) => { addMessageToDb({ from: "Devis Pare-brise", senderName: data.name, senderEmail: data.email, subject: `Devis pour ${data.vehicle}`, content: `Type de dommage: ${data.damageType}`, receivedAt: new Date().toISOString(), isRead: false, isArchived: false, status: 'pending' }); return { success: true }; };
const submitLiftRentalRequest = (data) => { addMessageToDb({ from: "Location de Pont", senderName: data.name, senderEmail: data.email, subject: `Réservation pour le ${data.date}`, content: `Durée: ${data.duration}h`, receivedAt: new Date().toISOString(), isRead: false, isArchived: false, status: 'pending' }); return { success: true }; };
const submitQuoteRequest = (product, quoteData) => { addMessageToDb({ from: "Devis Pièce", senderName: quoteData.name, senderEmail: quoteData.email, subject: `Devis pour ${product.name}`, content: `Pièce: ${product.name} (Réf: ${product.oemRef})`, receivedAt: new Date().toISOString(), isRead: false, isArchived: false, status: 'pending' }); return { success: true }; };

const getAdminUsers = () => db.users;
const getAdminMessages = () => db.messages;
const getBidsForUser = (userId) => {
    return db.auctions.map(auction => {
        const userBids = auction.bids.filter(bid => bid.userId === userId);
        if (userBids.length === 0) return null;
        const userHighestBid = userBids.sort((a, b) => b.amount - a.amount)[0];
        const currentHighestBid = auction.bids.sort((a,b) => b.amount - a.amount)[0];

        return {
            auctionId: auction.id, vehicleName: auction.vehicle.name, isWinning: currentHighestBid?.userId === userId,
            userHighestBid: userHighestBid.amount, currentHighestBid: auction.currentBid, endDate: auction.endDate,
            status: new Date(auction.endDate) > new Date() ? 'active' : 'terminated'
        };
    }).filter(Boolean);
};
const getMessagesForUser = (userEmail) => db.messages.filter(msg => msg.senderEmail.toLowerCase() === userEmail.toLowerCase());
const loginUser = (email, password) => {
    const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user || user.password !== password) throw new Error('Email ou mot de passe incorrect.');
    if (user.status === 'pending') throw new Error("Votre compte est en attente d'approbation.");
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
};
const registerUser = (data) => {
    if (db.users.find(u => u.email.toLowerCase() === data.email.toLowerCase())) throw new Error('Un compte avec cet email existe déjà.');
    const newUser = { id: `user-${Date.now()}`, name: data.name, email: data.email, role: 'Staff', status: 'pending', password: data.password };
    db.users.push(newUser);
    return { success: true };
};

const approveUser = (userId) => {
    const user = db.users.find(u => u.id === userId);
    if (!user) throw new Error("User not found");
    user.status = 'approved';
    return user;
};
const getBlogPosts = () => db.blog;
const sendAdminReply = (data) => { const msg = db.messages.find(m => m.id === data.messageId); if(msg) msg.status = 'replied'; return { success: true }; }
const sendNewMessage = (data) => { return { success: true }; }
const archiveMessage = (messageId, isArchived) => { const msg = db.messages.find(m => m.id === messageId); if(msg) msg.isArchived = isArchived; return msg; }
const getContacts = () => db.contacts;
const addContact = (contactData) => { const newContact = {...contactData, id: `contact-${Date.now()}`}; db.contacts.unshift(newContact); return newContact; };
const getLiftRentalBookings = () => db.bookings;
const getAuditLogs = () => db.logs;
const updateLiftRentalBookingStatus = (bookingId, status) => { const booking = db.bookings.find(b => b.id === bookingId); if (booking) booking.status = status; return booking; };
const addUser = (userData) => { const newUser = { ...userData, id: `user-${Date.now()}`, status: 'approved' }; db.users.unshift(newUser); return newUser; };
const updateUser = (userId, userData) => { const index = db.users.findIndex(u => u.id === userId); if(index > -1) db.users[index] = {...db.users[index], ...userData}; return db.users[index]; };
const deleteUser = (userId) => { db.users = db.users.filter(u => u.id !== userId); return { success: true }; };
const updateUserProfile = (userId, data) => { const user = db.users.find(u => u.id === userId); if (user) { user.name = data.name; user.email = data.email; } const { password, ...userToReturn } = user; return userToReturn; };
const updateUserPassword = (userId, data) => { const user = db.users.find(u => u.id === userId); if (user && user.password === data.current) { user.password = data.new; return { success: true }; } throw new Error("Current password incorrect"); };

module.exports = {
    getSiteSettings, updateSiteSettings, getProducts, getProductById, addProduct, updateProduct, deleteProduct,
    getAuctions, getAuctionById, addBid, addAuction, updateAuction, deleteAuction,
    addMessageToDb, submitContactForm, submitBuybackRequest, submitScrapRemovalRequest, submitWindshieldRequest, submitLiftRentalRequest, submitQuoteRequest,
    getAdminUsers, getAdminMessages, getBidsForUser, getMessagesForUser, loginUser, registerUser, approveUser, getBlogPosts,
    sendAdminReply, sendNewMessage, archiveMessage, getContacts, addContact, getLiftRentalBookings, getAuditLogs,
    updateLiftRentalBookingStatus, addUser, updateUser, deleteUser, updateUserProfile, updateUserPassword,
};
