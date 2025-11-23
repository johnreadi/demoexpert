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
  const businessInfo = {
    name: input?.businessInfo?.name ?? DEFAULT_SETTINGS.businessInfo.name,
    logoUrl: input?.businessInfo?.logoUrl ?? DEFAULT_SETTINGS.businessInfo.logoUrl,
    address: input?.businessInfo?.address ?? DEFAULT_SETTINGS.businessInfo.address,
    phone: input?.businessInfo?.phone ?? DEFAULT_SETTINGS.businessInfo.phone,
    email: input?.businessInfo?.email ?? DEFAULT_SETTINGS.businessInfo.email,
    openingHours: input?.businessInfo?.openingHours ?? DEFAULT_SETTINGS.businessInfo.openingHours,
  };
  const socialLinks = {
    facebook: input?.socialLinks?.facebook ?? DEFAULT_SETTINGS.socialLinks.facebook,
    twitter: input?.socialLinks?.twitter ?? DEFAULT_SETTINGS.socialLinks.twitter,
    linkedin: input?.socialLinks?.linkedin ?? DEFAULT_SETTINGS.socialLinks.linkedin,
  };
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
  const withDefaultService = (svc: any, idx: number) => {
    const def = DEFAULT_SETTINGS.services[idx] ?? DEFAULT_SETTINGS.services[0];
    return {
      id: svc?.id ?? def.id,
      icon: svc?.icon ?? def.icon,
      title: svc?.title ?? def.title,
      description: svc?.description ?? def.description,
      link: svc?.link ?? def.link,
    };
  };
  const inputServices = Array.isArray(input?.services) ? input.services : [];
  const normalizedServices = inputServices.map((s: any, idx: number) => withDefaultService(s, idx)).filter(s => s.title && s.link);
  const services = normalizedServices.length >= DEFAULT_SETTINGS.services.length
    ? normalizedServices
    : [...normalizedServices, ...DEFAULT_SETTINGS.services.slice(normalizedServices.length)];
  const testimonials = Array.isArray(input?.testimonials) && input.testimonials.length > 0 ? input.testimonials : DEFAULT_SETTINGS.testimonials;
  const f = input?.footer ?? {};
  const footer = {
    description: f?.description ?? DEFAULT_SETTINGS.footer.description,
    servicesLinks: Array.isArray(f?.servicesLinks) && f.servicesLinks.length > 0 ? f.servicesLinks : DEFAULT_SETTINGS.footer.servicesLinks,
    infoLinks: Array.isArray(f?.infoLinks) && f.infoLinks.length > 0 ? f.infoLinks : DEFAULT_SETTINGS.footer.infoLinks,
  };
  return { ...input, businessInfo, socialLinks, hero, services, testimonials, pageContent, advancedSettings, footer };
}

const DEFAULT_SETTINGS = {
  businessInfo: {
    name: 'Démolition Expert',
    logoUrl: '',
    address: '450 Route de Gournay, 76160 Saint-Jacques-sur-Darnétal, France',
    phone: '02 35 08 18 55',
    email: 'contact@casseautopro.fr',
    openingHours: 'Lun-Ven: 8h00 - 18h00, Sam: 9h00 - 12h00'
  },
  socialLinks: {
    facebook: 'https://facebook.com',
    twitter: 'https://twitter.com',
    linkedin: 'https://linkedin.com'
  },
  themeColors: { headerBg: '#003366', footerBg: '#003366' },
  hero: {
    title: "Pièces d'occasion de qualité",
    subtitle: "Économisez jusqu'à 80% et recyclez !",
    background: { type: 'image', value: 'https://picsum.photos/seed/hero/1920/1080' }
  },
  services: [
    { id: 'serv-1', icon: 'fas fa-cogs', title: 'Vente de Pièces', description: "Un large inventaire de pièces détachées d'occasion, testées et garanties.", link: '/pieces' },
    { id: 'serv-2', icon: 'fas fa-car', title: 'Rachat de Véhicules', description: "Nous rachetons votre véhicule hors d'usage au meilleur prix du marché.", link: '/rachat-vehicule' },
    { id: 'serv-3', icon: 'fas fa-truck-pickup', title: "Enlèvement d'Épave", description: "Service d'enlèvement d'épave gratuit en Normandie. Simple et rapide.", link: '/enlevement-epave' },
    { id: 'serv-4', icon: 'fas fa-shield-halved', title: 'Pare-brise', description: "Réparation d'impacts et remplacement. Service rapide et garanti.", link: '/pare-brise' },
    { id: 'serv-5', icon: 'fas fa-tools', title: 'Location de Pont', description: 'Louez un de nos ponts élévateurs pour faire votre mécanique.', link: '/location-pont' },
    { id: 'serv-6', icon: 'fas fa-wrench', title: 'Réparation & Entretien', description: 'Diagnostic, réparation et entretien toutes marques.', link: '/entretien' }
  ],
  testimonials: [
    { id: 'test-1', text: "Service rapide et pièce conforme. J'ai économisé une fortune sur la réparation de ma Clio. Je recommande !!", author: 'Julien D., Rouen' },
    { id: 'test-2', text: "Enlèvement de mon épave en 48h, tout s'est très bien passé. Équipe très professionnelle.", author: 'Sylvie M., Le Havre' },
    { id: 'test-3', text: "J'ai trouvé un alternateur pour ma 308 que je ne trouvais nulle part ailleurs. Merci Démolition Expert !", author: 'Garage Martin' }
  ],
  footer: {
    description: "Votre spécialiste de la pièce automobile d'occasion et du recyclage en Normandie.",
    servicesLinks: [
      { id: 'fsl-1', text: 'Pièces Détachées', url: '/pieces' },
      { id: 'fsl-2', text: 'Rachat de Véhicules', url: '/rachat-vehicule' },
      { id: 'fsl-3', text: "Enlèvement d'Épaves", url: '/enlevement-epave' },
      { id: 'fsl-4', text: 'Réparation', url: '/reparation' }
    ],
    infoLinks: [
      { id: 'fil-1', text: 'Contact', url: '/contact' },
      { id: 'fil-3', text: 'CGV', url: '/cgv' },
      { id: 'fil-4', text: 'Mentions Légales', url: '/mentions-legales' }
    ]
  },
  legal: {
    mentions: { title: 'Mentions Légales', content: '' },
    cgv: { title: 'Conditions Générales de Vente', content: '' },
    confidentialite: { title: 'Politique de Confidentialité', content: '' }
  },
  liftRental: {
    pricingTiers: [ { duration: 1, price: 50 }, { duration: 2, price: 90 }, { duration: 4, price: 160 } ],
    unavailableDates: ['2025-12-25', '2026-01-01']
  },
  pageContent: {
    repairs: { heroTitle: 'Réparation & Maintenance', heroSubtitle: 'Diagnostic précis et réparations fiables.', heroImage: 'https://picsum.photos/seed/mechanic-repair/1920/1080', contentTitle: 'Un service expert', contentDescription: "Notre équipe est équipée pour diagnostiquer et résoudre tous types de problèmes.", contentImage: 'https://picsum.photos/seed/diagnostic-tool/800/600', features: [ '<strong>Diagnostic électronique complet</strong>', '<strong>Réparation moteur</strong>', '<strong>Système de freinage</strong>' ] },
    maintenance: { heroTitle: 'Vidange & Entretien', heroSubtitle: 'Assurez la longévité de votre moteur.', heroImage: 'https://picsum.photos/seed/oil-change/1920/1080', contentTitle: "L'entretien, clé de la fiabilité", contentDescription: 'Nous proposons des forfaits d\'entretien complets adaptés.', contentImage: 'https://picsum.photos/seed/car-filters/800/600', features: [ '<strong>Vidange huile moteur</strong>', '<strong>Remplacement des filtres</strong>', '<strong>Contrôle des points de sécurité</strong>' ] },
    tires: { heroTitle: 'Service Pneus', heroSubtitle: 'Vente, montage et équilibrage.', heroImage: 'https://picsum.photos/seed/tire-fitting/1920/1080', contentTitle: 'Votre sécurité, notre priorité', contentDescription: "Nous proposons une large gamme de pneus neufs et d'occasion.", contentImage: 'https://picsum.photos/seed/wheel-balancing/800/600', features: [ '<strong>Vente de pneus neufs et d\'occasion</strong>', '<strong>Montage et équilibrage</strong>', '<strong>Réparation de crevaison</strong>' ] }
  },
  advancedSettings: {
    smtp: { host: 'smtp.example.com', port: 587, user: 'user@example.com', pass: '' },
    ai: { chatModel: 'gemini-2.5-flash', estimationModel: 'gemini-2.5-flash' },
    seo: { metaTitle: 'Démolition Expert', metaDescription: "Pièces auto d'occasion garanties.", keywords: 'casse auto, pièces occasion' },
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
    console.error('Failed to ensure default settings (database may not be available):', e);
    console.log('Continuing without database connection...');
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

    const fallback = () => {
      const q = String(message || '').toLowerCase();
      if (q.includes('bonjour') || q.includes('salut')) return 'Bonjour ! Comment puis-je vous aider ?';
      if (q.includes('horaire') || q.includes('ouvert')) return `Nos horaires: ${settings?.businessInfo?.openingHours || 'Lun-Ven 8h-18h, Sam 9h-12h'}.`;
      if (q.includes('contact') || q.includes('email') || q.includes('téléphone')) return `Contact: ${settings?.businessInfo?.phone || ''} / ${settings?.businessInfo?.email || ''}.`;
      return "Je suis un assistant. L’IA n’est pas disponible pour le moment.";
    };
    if (!apiKey) {
      return res.json({ text: fallback() });
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

app.put('/api/products/:id', async (req, res) => {
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

app.delete('/api/products/:id', async (req, res) => {
  try {
    await prisma.product.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (e) {
    res.status(404).json({ error: 'not_found' });
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
    // If we don't have a database connection, return mock data
    if (!process.env.DATABASE_URL) {
      // Return mock auction data
      const mockAuctions = [
        { 
          id: 'mock-auc-1', 
          vehicle: { 
            name: 'Peugeot 208 GT Line', 
            brand: 'Peugeot', 
            model: '208', 
            year: 2019, 
            mileage: 55000, 
            description: 'Superbe Peugeot 208 GT Line...', 
            images: ['https://picsum.photos/seed/auc1-1/800/600'] 
          }, 
          startingPrice: 8000, 
          currentBid: 8300, 
          bidCount: 6, 
          bids: [ 
            { 
              userId: 'mock-user-1', 
              bidderName: 'Marie Curie', 
              amount: 8300, 
              timestamp: new Date(Date.now() - 3600000 * 1) 
            } 
          ], 
          endDate: new Date(Date.now() + 1000 * 60 * 60 * 49) 
        },
        { 
          id: 'mock-auc-2', 
          vehicle: { 
            name: 'Volkswagen Golf VII', 
            brand: 'Volkswagen', 
            model: 'Golf', 
            year: 2017, 
            mileage: 89000, 
            description: 'Volkswagen Golf 7 en excellent état...', 
            images: ['https://picsum.photos/seed/auc2-1/800/600'] 
          }, 
          startingPrice: 10000, 
          currentBid: 10500, 
          bidCount: 8, 
          bids: [ 
            { 
              userId: 'mock-user-2', 
              bidderName: 'Jean Dupont', 
              amount: 10500, 
              timestamp: new Date(Date.now() - 3600000 * 1) 
            } 
          ], 
          endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5) 
        }
      ];
      return res.json(mockAuctions);
    }
    
    const auctions = await prisma.auction.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(auctions);
  } catch (error) {
    console.error("Failed to list auctions:", error);
    // Return mock data as fallback
    res.json([]);
  }
});

app.get('/api/auctions/:id', async (req, res) => {
  try {
    // If we don't have a database connection, return mock data
    if (!process.env.DATABASE_URL) {
      // Return mock auction data based on ID
      const mockAuction = {
        id: req.params.id,
        vehicle: { 
          name: 'Peugeot 208 GT Line', 
          brand: 'Peugeot', 
          model: '208', 
          year: 2019, 
          mileage: 55000, 
          description: 'Superbe Peugeot 208 GT Line...', 
          images: ['https://picsum.photos/seed/auc1-1/800/600'] 
        }, 
        startingPrice: 8000, 
        currentBid: 8300, 
        bidCount: 6, 
        bids: [ 
          { 
            userId: 'mock-user-1', 
            bidderName: 'Marie Curie', 
            amount: 8300, 
            timestamp: new Date(Date.now() - 3600000 * 1) 
          } 
        ], 
        endDate: new Date(Date.now() + 1000 * 60 * 60 * 49) 
      };
      return res.json(mockAuction);
    }
    
    const auction = await prisma.auction.findUnique({ where: { id: req.params.id }, include: { bids: { orderBy: { timestamp: 'desc' } } } });
    if (!auction) return res.status(404).json({ error: 'not_found' });
    res.json(auction);
  } catch (error) {
    console.error("Failed to get auction:", error);
    // Return mock data as fallback
    const mockAuction = {
      id: req.params.id,
      vehicle: { 
        name: 'Peugeot 208 GT Line', 
        brand: 'Peugeot', 
        model: '208', 
        year: 2019, 
        mileage: 55000, 
        description: 'Superbe Peugeot 208 GT Line...', 
        images: ['https://picsum.photos/seed/auc1-1/800/600'] 
      }, 
      startingPrice: 8000, 
      currentBid: 8300, 
      bidCount: 6, 
      bids: [ 
        { 
          userId: 'mock-user-1', 
          bidderName: 'Marie Curie', 
          amount: 8300, 
          timestamp: new Date(Date.now() - 3600000 * 1) 
        } 
      ], 
      endDate: new Date(Date.now() + 1000 * 60 * 60 * 49) 
    };
    res.json(mockAuction);
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

app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body || {};
    
    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'missing_required_fields' });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'invalid_email_format' });
    }
    
    // Check if we have a database connection
    if (!process.env.DATABASE_URL) {
      // Return mock success if no database connection
      return res.status(201).json({ success: true, id: `mock-contact-${Date.now()}` });
    }
    
    // Store in database
    const contact = await prisma.contact.create({
      data: {
        name,
        email,
        subject,
        message
      }
    });
    
    res.status(201).json({ success: true, id: contact.id });
  } catch (error) {
    console.error('Failed to submit contact form:', error);
    res.status(500).json({ error: 'failed_to_submit_contact_form' });
  }
});

app.get('/api/contact', async (_req, res) => {
  try {
    // Check if we have a database connection
    if (!process.env.DATABASE_URL) {
      // Return mock data if no database connection
      return res.json([
        { 
          id: 'mock-contact-1', 
          name: 'John Doe', 
          email: 'john@example.com', 
          subject: 'Question sur un produit', 
          message: 'Bonjour, j\'aimerais savoir si vous avez en stock le produit REF123456 ?', 
          createdAt: new Date(Date.now() - 86400000) 
        }
      ]);
    }
    
    const contacts = await prisma.contact.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(contacts);
  } catch (error) {
    console.error('Failed to fetch contacts:', error);
    res.status(500).json({ error: 'failed_to_fetch_contacts' });
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

app.post('/api/auctions/import', requireAdmin, async (req, res) => {
  try {
    const items = Array.isArray(req.body?.auctions) ? req.body.auctions : [];
    if (items.length === 0) return res.json({ imported: 0 });
    let count = 0;
    for (const a of items) {
      const v = a?.vehicle || {};
      await prisma.auction.create({ data: {
        vehicleName: v.name || a.vehicleName || '',
        brand: v.brand || a.brand || '',
        model: v.model || a.model || '',
        year: Number(v.year || a.year || 0),
        mileage: Number(v.mileage || a.mileage || 0),
        description: v.description || a.description || '',
        images: Array.isArray(v.images) ? v.images : (Array.isArray(a.images) ? a.images : []),
        startingPrice: String(a.startingPrice || 0),
        currentBid: String(a.currentBid || a.startingPrice || 0),
        bidCount: Number(a.bidCount || 0),
        endDate: new Date(a.endDate || Date.now() + 1000 * 60 * 60 * 24 * 3),
      }});
      count++;
    }
    res.json({ imported: count });
  } catch {
    res.status(500).json({ error: 'failed_to_import' });
  }
});

app.get('/api/settings', async (_req, res) => {
  try {
    const settings = await prisma.settings.findUnique({ where: { key: 'site_settings' } });
    if (!settings) {
      return res.json(normalizeSettings(DEFAULT_SETTINGS));
    }
    res.json(normalizeSettings(settings.value));
  } catch (error) {
    console.error("Failed to fetch settings from database:", error);
    return res.json(normalizeSettings(DEFAULT_SETTINGS));
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
    console.log('Note: Some features may be limited without a database connection');
  });
});

// --- Admin Messages API ---
app.get('/api/admin/messages', async (req, res) => {
  try {
    // Check if we have a database connection
    if (!process.env.DATABASE_URL) {
      // Return mock data if no database connection
      return res.json([
        { 
          id: 'mock-msg-1', 
          from: 'Formulaire de Contact', 
          senderName: 'John Doe', 
          senderEmail: 'john@example.com', 
          subject: 'Question sur un produit', 
          content: 'Bonjour, j\'aimerais savoir si vous avez en stock le produit REF123456 ?', 
          receivedAt: new Date(Date.now() - 86400000), 
          isRead: false, 
          isArchived: false, 
          status: 'pending' 
        }
      ]);
    }
    
    const messages = await prisma.adminMessage.findMany({
      orderBy: { receivedAt: 'desc' }
    });
    res.json(messages);
  } catch (error) {
    console.error('Failed to fetch admin messages:', error);
    res.status(500).json({ error: 'failed_to_fetch_admin_messages' });
  }
});

app.post('/api/admin/messages', async (req, res) => {
  try {
    const { from, senderName, senderEmail, subject, content, userId } = req.body || {};
    
    // Validate required fields
    if (!from || !senderName || !senderEmail || !subject || !content) {
      return res.status(400).json({ error: 'missing_required_fields' });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(senderEmail)) {
      return res.status(400).json({ error: 'invalid_email_format' });
    }
    
    // Check if we have a database connection
    if (!process.env.DATABASE_URL) {
      // Return mock success if no database connection
      return res.status(201).json({ 
        id: `mock-msg-${Date.now()}`, 
        from, 
        senderName, 
        senderEmail, 
        subject, 
        content, 
        userId,
        receivedAt: new Date(),
        isRead: false,
        isArchived: false,
        status: 'pending'
      });
    }
    
    // Store in database
    const message = await prisma.adminMessage.create({
      data: {
        from,
        senderName,
        senderEmail,
        subject,
        content,
        userId,
        receivedAt: new Date()
      }
    });
    
    res.status(201).json(message);
  } catch (error) {
    console.error('Failed to create admin message:', error);
    res.status(500).json({ error: 'failed_to_create_admin_message' });
  }
});

app.put('/api/admin/messages/:id', async (req, res) => {
  try {
    const { isRead, isArchived, status } = req.body || {};
    
    // Check if we have a database connection
    if (!process.env.DATABASE_URL) {
      // Return mock success if no database connection
      return res.json({ 
        id: req.params.id,
        isRead: isRead !== undefined ? isRead : false,
        isArchived: isArchived !== undefined ? isArchived : false,
        status: status || 'pending'
      });
    }
    
    // Update in database
    const message = await prisma.adminMessage.update({
      where: { id: req.params.id },
      data: {
        ...(isRead !== undefined && { isRead }),
        ...(isArchived !== undefined && { isArchived }),
        ...(status && { status })
      }
    });
    
    res.json(message);
  } catch (error) {
    console.error('Failed to update admin message:', error);
    res.status(500).json({ error: 'failed_to_update_admin_message' });
  }
});

app.delete('/api/admin/messages/:id', async (req, res) => {
  try {
    // Check if we have a database connection
    if (!process.env.DATABASE_URL) {
      // Return mock success if no database connection
      return res.json({ success: true });
    }
    
    // Delete from database
    await prisma.adminMessage.delete({
      where: { id: req.params.id }
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to delete admin message:', error);
    res.status(500).json({ error: 'failed_to_delete_admin_message' });
  }
});
