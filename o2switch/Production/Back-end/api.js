const express = require('express');
const db = require('./db');
const geminiService = require('./geminiService');
const router = express.Router();

// Middleware pour une gestion simple des erreurs asynchrones
const asyncHandler = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(err => {
    console.error(err);
    res.status(500).json({ message: err.message || "Une erreur est survenue sur le serveur." });
  });
};

// --- Settings ---
router.get('/settings', asyncHandler(async (req, res) => {
    res.json(db.getSiteSettings());
}));
router.post('/settings', asyncHandler(async (req, res) => {
    res.json(db.updateSiteSettings(req.body));
}));

// --- Products ---
router.get('/products', asyncHandler(async (req, res) => {
    res.json(db.getProducts(req.query));
}));
router.get('/products/:id', asyncHandler(async (req, res) => {
    res.json(db.getProductById(req.params.id));
}));
router.post('/products', asyncHandler(async (req, res) => {
    res.status(201).json(db.addProduct(req.body));
}));
router.put('/products/:id', asyncHandler(async (req, res) => {
    res.json(db.updateProduct(req.params.id, req.body));
}));
router.delete('/products/:id', asyncHandler(async (req, res) => {
    res.json(db.deleteProduct(req.params.id));
}));

// --- Auctions ---
router.get('/auctions', asyncHandler(async (req, res) => {
    res.json(db.getAuctions());
}));
router.get('/auctions/:id', asyncHandler(async (req, res) => {
    res.json(db.getAuctionById(req.params.id));
}));
router.post('/auctions/:id/bids', asyncHandler(async (req, res) => {
    const { bidAmount, userId, bidderName } = req.body;
    res.json(db.addBid(req.params.id, bidAmount, userId, bidderName));
}));
router.post('/auctions', asyncHandler(async (req, res) => {
    res.status(201).json(db.addAuction(req.body));
}));
router.put('/auctions/:id', asyncHandler(async (req, res) => {
    res.json(db.updateAuction(req.params.id, req.body));
}));
router.delete('/auctions/:id', asyncHandler(async (req, res) => {
    res.json(db.deleteAuction(req.params.id));
}));

// --- Blog ---
router.get('/blog', asyncHandler(async (req, res) => {
    res.json(db.getBlogPosts());
}));

// --- Forms ---
router.post('/forms/:formName', asyncHandler(async (req, res) => {
    const { formName } = req.params;
    let result;
    switch(formName) {
        case 'contact': result = db.submitContactForm(req.body); break;
        case 'scrap-removal': result = db.submitScrapRemovalRequest(req.body); break;
        case 'windshield': result = db.submitWindshieldRequest(req.body); break;
        case 'lift-rental': result = db.submitLiftRentalRequest(req.body); break;
        case 'buyback': result = db.submitBuybackRequest(req.body); break;
        case 'quote': result = db.submitQuoteRequest(req.body.product, req.body.quoteData); break;
        default: return res.status(404).json({ message: "Form not found" });
    }
    res.json(result);
}));

// --- AI Chat ---
router.post('/chat', asyncHandler(async (req, res) => {
    const { message, history, settings } = req.body;
    const text = await geminiService.getAiChatResponse(message, history, settings);
    res.json({ text });
}));

// --- Auth ---
router.post('/auth/register', asyncHandler(async (req, res) => {
    res.json(db.registerUser(req.body));
}));
router.post('/auth/login', asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    res.json(db.loginUser(email, password));
}));

// --- Admin Routes ---
router.get('/admin/users', asyncHandler(async (req, res) => res.json(db.getAdminUsers())));
router.post('/admin/users', asyncHandler(async (req, res) => res.status(201).json(db.addUser(req.body))));
router.put('/admin/users/:id', asyncHandler(async (req, res) => res.json(db.updateUser(req.params.id, req.body))));
router.delete('/admin/users/:id', asyncHandler(async (req, res) => res.json(db.deleteUser(req.params.id))));
router.post('/admin/users/:id/approve', asyncHandler(async (req, res) => res.json(db.approveUser(req.params.id))));
router.get('/admin/messages', asyncHandler(async (req, res) => res.json(db.getAdminMessages())));
router.post('/admin/messages/reply', asyncHandler(async (req, res) => res.json(db.sendAdminReply(req.body))));
router.post('/admin/messages/new', asyncHandler(async (req, res) => res.json(db.sendNewMessage(req.body))));
router.post('/admin/messages/:id/archive', asyncHandler(async (req, res) => res.json(db.archiveMessage(req.params.id, req.body.isArchived))));
router.get('/admin/contacts', asyncHandler(async (req, res) => res.json(db.getContacts())));
router.post('/admin/contacts', asyncHandler(async (req, res) => res.status(201).json(db.addContact(req.body))));
router.get('/admin/bookings', asyncHandler(async (req, res) => res.json(db.getLiftRentalBookings())));
router.put('/admin/bookings/:id/status', asyncHandler(async (req, res) => res.json(db.updateLiftRentalBookingStatus(req.params.id, req.body.status))));
router.get('/admin/logs', asyncHandler(async (req, res) => res.json(db.getAuditLogs())));

// --- Account Routes ---
router.get('/account/bids/:userId', asyncHandler(async (req, res) => res.json(db.getBidsForUser(req.params.userId))));
router.get('/account/messages', asyncHandler(async (req, res) => res.json(db.getMessagesForUser(req.query.email))));
router.put('/account/profile/:userId', asyncHandler(async (req, res) => res.json(db.updateUserProfile(req.params.userId, req.body))));
router.put('/account/password/:userId', asyncHandler(async (req, res) => res.json(db.updateUserPassword(req.params.userId, req.body))));


module.exports = router;
