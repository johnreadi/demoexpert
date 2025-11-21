import express from 'express';
import session from 'express-session';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcryptjs';
const { prisma } = require('./prisma.js');

const app = express();

const PORT = Number(process.env.PORT || 8084);
const NODE_ENV = process.env.NODE_ENV || 'development';
const SESSION_SECRET = process.env.SESSION_SECRET || 'dev_session_secret_change_me';
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';
const TRUST_PROXY = process.env.TRUST_PROXY ? Number(process.env.TRUST_PROXY) : 0;
const COOKIE_SECURE = process.env.COOKIE_SECURE === 'true';
const COOKIE_SAME_SITE = (process.env.COOKIE_SAME_SITE as 'lax'|'strict'|'none') || 'lax';

app.set('trust proxy', TRUST_PROXY);

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://cdn.tailwindcss.com"],
      styleSrc: ["'self'", "https:", "'unsafe-inline'"],
      fontSrc: ["'self'", "https:", "data:"],
      imgSrc: ["'self'", "data:"],
      connectSrc: ["'self'", CORS_ORIGIN]
    }
  }
}));
app.use(morgan('combined'));
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: CORS_ORIGIN,
  credentials: true,
}));

app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: COOKIE_SECURE,
    sameSite: COOKIE_SAME_SITE,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
}));

type UserSession = { id: string; name: string; email: string; role: 'Admin'|'Staff'; status: 'approved'|'pending' };

app.get('/healthz', (_req, res) => {
  res.status(200).json({ status: 'ok', env: NODE_ENV });
});

app.get('/api/healthz', (_req, res) => {
  res.status(200).json({ status: 'ok', env: NODE_ENV });
});

function normalizeSettings(input: any) {
  const heroBg = input?.hero?.background ?? (input?.hero?.backgroundImage ? { type: 'image', value: input.hero.backgroundImage } : { type: 'color', value: '#003366' });
  const hero = { title: input?.hero?.title ?? '', subtitle: input?.hero?.subtitle ?? '', background: heroBg };
  const pc = input?.pageContent ?? {};
  const normalizePage = (p: any) => ({ heroTitle: p?.heroTitle ?? '', heroSubtitle: p?.heroSubtitle ?? '', heroImage: p?.heroImage ?? '', contentTitle: p?.contentTitle ?? '', contentDescription: p?.contentDescription ?? '', contentImage: p?.contentImage ?? '', features: Array.isArray(p?.features) ? p.features : [] });
  const pageContent = { repairs: normalizePage(pc?.repairs ?? {}), maintenance: normalizePage(pc?.maintenance ?? {}), tires: normalizePage(pc?.tires ?? {}) };
  const adv = input?.advancedSettings ?? {};
  const advancedSettings = {
    smtp: { host: adv?.smtp?.host ?? '', port: adv?.smtp?.port ?? 0, user: adv?.smtp?.user ?? '', pass: adv?.smtp?.pass ?? '' },
    ai: { chatModel: adv?.ai?.chatModel ?? '', estimationModel: adv?.ai?.estimationModel ?? '' },
    seo: { metaTitle: adv?.seo?.metaTitle ?? '', metaDescription: adv?.seo?.metaDescription ?? '', keywords: adv?.seo?.keywords ?? '' },
    security: { allowPublicRegistration: adv?.security?.allowPublicRegistration ?? true }
  };
  return { ...input, hero, pageContent, advancedSettings };
}

const DEFAULT_SETTINGS = {
  businessInfo: { name: "Démolition Expert", logoUrl: "", address: "123 Rue de la Casse, 76000 Rouen", phone: "02 35 00 00 00", email: "contact@demoexpert.fr", openingHours: "Lun-Ven: 9h-18h, Sam: 9h-12h" },
  socialLinks: { facebook: "", twitter: "", linkedin: "" },
  themeColors: { headerBg: "#003366", footerBg: "#003366" },
  hero: { title: "Bienvenue chez Démolition Expert", subtitle: "Vente de pièces auto d'occasion, rachat de véhicules, enlèvement d'épaves", background: { type: "color", value: "#003366" } },
  services: [
    { id: "1", icon: "fas fa-car", title: "Pièces Détachées", description: "Large choix de pièces automobiles d'occasion de qualité", link: "/pieces" },
    { id: "2", icon: "fas fa-hand-holding-dollar", title: "Rachat de Véhicules", description: "Rachetons votre véhicule quelle que soit sa condition", link: "/rachat-vehicule" },
    { id: "3", icon: "fas fa-trash", title: "Enlèvement d'Épaves", description: "Service d'enlèvement gratuit d'épaves dans toute la Normandie", link: "/enlevement-epave" }
  ],
  testimonials: [
    { id: "1", text: "Service rapide et professionnel. J'ai trouvé la pièce dont j'avais besoin en un rien de temps !", author: "Marie D." },
    { id: "2", text: "Le rachat de mon ancienne voiture a été simple et rapide. Je recommande vivement !", author: "Jean-Pierre L." },
    { id: "3", text: "Équipe sympathique et compétente. Tarifs très compétitifs sur tous les services.", author: "Sophie M." }
  ],
  footer: { description: "Votre expert en pièces automobiles d'occasion depuis 1995", servicesLinks: [], infoLinks: [] },
  legal: { mentions: { title: "Mentions Légales", content: "" }, cgv: { title: "Conditions Générales de Vente", content: "" }, confidentialite: { title: "Politique de Confidentialité", content: "" } },
  liftRental: { pricingTiers: [{ duration: 1, price: 50 }, { duration: 2, price: 90 }, { duration: 4, price: 160 }], unavailableDates: [] },
  pageContent: {
    repairs: { heroTitle: "", heroSubtitle: "", heroImage: "", contentTitle: "", contentDescription: "", contentImage: "", features: [] },
    maintenance: { heroTitle: "", heroSubtitle: "", heroImage: "", contentTitle: "", contentDescription: "", contentImage: "", features: [] },
    tires: { heroTitle: "", heroSubtitle: "", heroImage: "", contentTitle: "", contentDescription: "", contentImage: "", features: [] }
  },
  advancedSettings: {
    smtp: { host: "", port: 0, user: "", pass: "" },
    ai: { chatModel: "", estimationModel: "" },
    seo: { metaTitle: "", metaDescription: "", keywords: "" },
    security: { allowPublicRegistration: true }
  }
};

async function ensureDefaultSettings() {
  try {
    const s = await prisma.settings.findUnique({ where: { key: 'site_settings' } });
    if (!s) {
      await prisma.settings.create({ data: { key: 'site_settings', value: DEFAULT_SETTINGS } });
    }
  } catch (e) {
    console.error('Failed to ensure default settings:', e);
  }
}

app.get('/api/auth/me', (req, res) => {
  const user = (req.session as any).user as UserSession | undefined;
  if (!user) return res.status(401).json({ error: 'unauthorized' });
  return res.json(user);
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'missing_credentials' });
  try {
    const user = await prisma.user.findUnique({ where: { email: String(email).toLowerCase() } });
    if (!user) return res.status(401).json({ error: 'invalid_credentials' });
    const ok = await bcrypt.compare(String(password), user.password);
    if (!ok) return res.status(401).json({ error: 'invalid_credentials' });
    if (user.status === 'pending') return res.status(403).json({ error: 'account_pending' });
    const safeUser: UserSession = { id: user.id, name: user.name, email: user.email, role: user.role as any, status: user.status as any };
    (req.session as any).user = safeUser;
    return res.json(safeUser);
  } catch (e) {
    return res.status(500).json({ error: 'login_failed' });
  }
});

app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'missing_credentials' });
  try {
    const user = await prisma.user.findUnique({ where: { email: String(email).toLowerCase() } });
    if (!user) return res.status(401).json({ error: 'invalid_credentials' });
    const ok = await bcrypt.compare(String(password), user.password);
    if (!ok) return res.status(401).json({ error: 'invalid_credentials' });
    if (user.status === 'pending') return res.status(403).json({ error: 'account_pending' });
    const safeUser: UserSession = { id: user.id, name: user.name, email: user.email, role: user.role as any, status: user.status as any };
    (req.session as any).user = safeUser;
    return res.json(safeUser);
  } catch (e) {
    return res.status(500).json({ error: 'login_failed' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ error: 'logout_failed' });
    res.clearCookie('connect.sid');
    return res.json({ success: true });
  });
});

app.post('/auth/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ error: 'logout_failed' });
    res.clearCookie('connect.sid');
    return res.json({ success: true });
  });
});

app.post('/api/ai/chat', async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(501).json({ error: 'ai_not_configured', message: 'GEMINI_API_KEY manquant côté serveur.' });
    }
    const { message, history, settings } = req.body || {};
    const intro = settings?.businessInfo ? `Vous êtes un assistant virtuel pour '${settings.businessInfo.name}', une casse automobile en Normandie, France. Votre nom est 'ExpertBot'.
- Répondez de manière amicale, professionnelle et concise en français.
- Services principaux : Vente de pièces auto d'occasion, rachat de véhicules, enlèvement gratuit d'épaves, réparation pare-brise, location de pont, entretien, pneus.
- Adresse : ${settings.businessInfo.address}.
- Téléphone : ${settings.businessInfo.phone}.
- Horaires : ${settings.businessInfo.openingHours}.
- Pour les prix des pièces, indiquez que le client doit faire une 'demande de devis' sur la page du produit car les prix varient.
- Pour le rachat, dirigez l'utilisateur vers la page 'Rachat de Véhicules'.
- Si vous ne connaissez pas la réponse, dites-le poliment et suggérez de contacter l'entreprise directement par téléphone.` :
      "Vous êtes un assistant virtuel amical et professionnel. Répondez en français.";

    const historyText = Array.isArray(history)
      ? history.map((m: any) => `${m.sender === 'user' ? 'Utilisateur' : 'Bot'}: ${m.text}`).join('\n')
      : '';

    const prompt = `${intro}

Historique:
${historyText}

Dernière question utilisateur: ${String(message ?? '').trim()}`;

    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          { role: 'user', parts: [{ text: prompt }] }
        ]
      })
    });
    if (!r.ok) {
      const text = await r.text().catch(() => '');
      return res.status(502).json({ error: 'ai_call_failed', details: text });
    }
    const data = await r.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Désolé, je n’ai pas pu générer de réponse.';
    return res.json({ text });
  } catch (e: any) {
    return res.status(500).json({ error: 'ai_internal_error' });
  }
});

app.get('/api/products', async (req, res) => {
  try {
    const { category, brand, model, limit } = req.query as any;
    const take = limit ? Number(limit) : undefined;
    const products = await prisma.product.findMany({
      where: {
        ...(category ? { category: String(category) } : {}),
        ...(brand ? { brand: { contains: String(brand), mode: 'insensitive' } } : {}),
        ...(model ? { model: { contains: String(model), mode: 'insensitive' } } : {}),
      },
      orderBy: { createdAt: 'desc' },
      ...(take ? { take } : {}),
    });
    res.json(products);
  } catch (e) {
    res.status(500).json({ error: 'failed_to_list_products' });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (!product) return res.status(404).json({ error: 'not_found' });
    res.json(product);
  } catch (e) {
    res.status(500).json({ error: 'failed_to_get_product' });
  }
});

app.get('/products', async (req, res) => {
  try {
    const { category, brand, model, limit } = req.query as any;
    const take = limit ? Number(limit) : undefined;
    const products = await prisma.product.findMany({
      where: {
        ...(category ? { category: String(category) } : {}),
        ...(brand ? { brand: { contains: String(brand), mode: 'insensitive' } } : {}),
        ...(model ? { model: { contains: String(model), mode: 'insensitive' } } : {}),
      },
      orderBy: { createdAt: 'desc' },
      ...(take ? { take } : {}),
    });
    res.json(products);
  } catch (e) {
    res.status(500).json({ error: 'failed_to_list_products' });
  }
});

app.get('/products/:id', async (req, res) => {
  try {
    const product = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (!product) return res.status(404).json({ error: 'not_found' });
    res.json(product);
  } catch (e) {
    res.status(500).json({ error: 'failed_to_get_product' });
  }
});

app.post('/products', async (req, res) => {
  try {
    const data = req.body || {};
    const created = await prisma.product.create({ data: {
      name: data.name,
      oemRef: data.oemRef,
      brand: data.brand,
      model: data.model,
      year: Number(data.year),
      category: String(data.category),
      price: String(data.price),
      condition: data.condition,
      warranty: data.warranty,
      compatibility: data.compatibility ?? null,
      images: Array.isArray(data.images) ? data.images : [],
      description: data.description,
    }});
    res.status(201).json(created);
  } catch (e) {
    res.status(400).json({ error: 'failed_to_create_product' });
  }
});

app.put('/products/:id', async (req, res) => {
  try {
    const data = req.body || {};
    const updated = await prisma.product.update({ where: { id: req.params.id }, data: {
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.oemRef !== undefined ? { oemRef: data.oemRef } : {}),
      ...(data.brand !== undefined ? { brand: data.brand } : {}),
      ...(data.model !== undefined ? { model: data.model } : {}),
      ...(data.year !== undefined ? { year: Number(data.year) } : {}),
      ...(data.category !== undefined ? { category: String(data.category) } : {}),
      ...(data.price !== undefined ? { price: String(data.price) } : {}),
      ...(data.condition !== undefined ? { condition: data.condition } : {}),
      ...(data.warranty !== undefined ? { warranty: data.warranty } : {}),
      ...(data.compatibility !== undefined ? { compatibility: data.compatibility } : {}),
      ...(data.images !== undefined ? { images: Array.isArray(data.images) ? data.images : [] } : {}),
      ...(data.description !== undefined ? { description: data.description } : {}),
    }});
    res.json(updated);
  } catch (e) {
    res.status(400).json({ error: 'failed_to_update_product' });
  }
});

app.delete('/products/:id', async (req, res) => {
  try {
    await prisma.product.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (e) {
    res.status(404).json({ error: 'not_found' });
  }
});

app.get('/api/auctions', async (_req, res) => {
  try {
    const auctions = await prisma.auction.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(auctions);
  } catch {
    res.status(500).json({ error: 'failed_to_list_auctions' });
  }
});

app.get('/api/auctions/:id', async (req, res) => {
  try {
    const auction = await prisma.auction.findUnique({ where: { id: req.params.id }, include: { bids: { orderBy: { timestamp: 'desc' } } } });
    if (!auction) return res.status(404).json({ error: 'not_found' });
    res.json(auction);
  } catch {
    res.status(500).json({ error: 'failed_to_get_auction' });
  }
});

app.get('/auctions', async (_req, res) => {
  try {
    const auctions = await prisma.auction.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(auctions);
  } catch {
    res.status(500).json({ error: 'failed_to_list_auctions' });
  }
});

app.get('/auctions/:id', async (req, res) => {
  try {
    const auction = await prisma.auction.findUnique({ where: { id: req.params.id }, include: { bids: { orderBy: { timestamp: 'desc' } } } });
    if (!auction) return res.status(404).json({ error: 'not_found' });
    res.json(auction);
  } catch {
    res.status(500).json({ error: 'failed_to_get_auction' });
  }
});

function requireAdmin(req: any, res: any, next: any) {
  const user = req.session?.user;
  if (!user || user.role !== 'Admin') return res.status(403).json({ error: 'forbidden' });
  next();
}

app.post('/auctions', requireAdmin, async (req, res) => {
  try {
    const d = req.body || {};
    const created = await prisma.auction.create({ data: {
      vehicleName: d.vehicleName,
      brand: d.brand,
      model: d.model,
      year: Number(d.year),
      mileage: Number(d.mileage),
      description: d.description,
      images: Array.isArray(d.images) ? d.images : [],
      startingPrice: String(d.startingPrice),
      currentBid: String(d.startingPrice),
      bidCount: 0,
      endDate: new Date(d.endDate),
    }});
    res.status(201).json(created);
  } catch {
    res.status(400).json({ error: 'failed_to_create_auction' });
  }
});

app.put('/auctions/:id', requireAdmin, async (req, res) => {
  try {
    const d = req.body || {};
    const updated = await prisma.auction.update({ where: { id: req.params.id }, data: {
      ...(d.vehicleName !== undefined ? { vehicleName: d.vehicleName } : {}),
      ...(d.brand !== undefined ? { brand: d.brand } : {}),
      ...(d.model !== undefined ? { model: d.model } : {}),
      ...(d.year !== undefined ? { year: Number(d.year) } : {}),
      ...(d.mileage !== undefined ? { mileage: Number(d.mileage) } : {}),
      ...(d.description !== undefined ? { description: d.description } : {}),
      ...(d.images !== undefined ? { images: Array.isArray(d.images) ? d.images : [] } : {}),
      ...(d.startingPrice !== undefined ? { startingPrice: String(d.startingPrice) } : {}),
      ...(d.currentBid !== undefined ? { currentBid: String(d.currentBid) } : {}),
      ...(d.bidCount !== undefined ? { bidCount: Number(d.bidCount) } : {}),
      ...(d.endDate !== undefined ? { endDate: new Date(d.endDate) } : {}),
    }});
    res.json(updated);
  } catch {
    res.status(400).json({ error: 'failed_to_update_auction' });
  }
});

app.delete('/api/auctions/:id', requireAdmin, async (req, res) => {
  try {
    await prisma.auction.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch {
    res.status(404).json({ error: 'not_found' });
  }
});

app.post('/api/auctions/:id/bids', async (req, res) => {
  try {
    const user = (req.session as any)?.user;
    if (!user) return res.status(401).json({ error: 'unauthorized' });
    const { amount } = req.body || {};
    const auction = await prisma.auction.findUnique({ where: { id: req.params.id } });
    if (!auction) return res.status(404).json({ error: 'not_found' });
    if (new Date(auction.endDate).getTime() <= Date.now()) return res.status(400).json({ error: 'auction_ended' });
    const nextAmount = Number(amount);
    const current = Number(auction.currentBid);
    if (!(nextAmount > current)) return res.status(400).json({ error: 'bid_too_low' });

    await prisma.$transaction(async (tx) => {
      await tx.bid.create({ data: { auctionId: auction.id, userId: user.id, bidderName: user.name, amount: String(nextAmount) } });
      await tx.auction.update({ where: { id: auction.id }, data: { currentBid: String(nextAmount), bidCount: auction.bidCount + 1 } });
    });

    const updated = await prisma.auction.findUnique({ where: { id: auction.id }, include: { bids: { orderBy: { timestamp: 'desc' } } } });
    res.json(updated);
  } catch {
    res.status(400).json({ error: 'failed_to_place_bid' });
  }
});

app.get('/api/settings', async (_req, res) => {
  try {
    const settings = await prisma.settings.findUnique({ where: { key: 'site_settings' } });
    if (!settings) {
      return res.json(DEFAULT_SETTINGS);
    }
    res.json(normalizeSettings(settings.value));
  } catch (error) {
    console.error("Failed to fetch settings from database:", error);
    return res.json(DEFAULT_SETTINGS);
  }
});

app.put('/api/settings', async (req, res) => {
  try {
    const settingsData = req.body;
    const settings = await prisma.settings.upsert({
      where: { key: 'site_settings' },
      update: { value: settingsData },
      create: { key: 'site_settings', value: settingsData }
    });
    res.json(settings.value);
  } catch {
    res.status(500).json({ error: 'failed_to_update_settings' });
  }
});

app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'not_found' });
});

ensureDefaultSettings().finally(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`API listening on 0.0.0.0:${PORT} (${NODE_ENV})`);
  });
});
