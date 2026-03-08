import express from 'express';
import session from 'express-session';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';

// 🔧 FIX ENABLED: We suspect the data is in 'demoexpert-expertdb-djopvt' but URL might be 'postgres'.
if (process.env.DATABASE_URL) {
  try {
    const url = new URL(process.env.DATABASE_URL);
    if (url.pathname === '/postgres') {
       console.log('⚠️ Fixing DATABASE_URL: Changing target DB from "postgres" to "demoexpert-expertdb-djopvt"');
       url.pathname = '/demoexpert-expertdb-djopvt';
       process.env.DATABASE_URL = url.toString();
    }
  } catch (e) {
    console.error('Failed to parse/fix DATABASE_URL:', e);
  }
}

const { prisma } = require('./prisma.js');

// --- DIAGNOSTIC START ---
(async () => {
  console.log('--- STARTUP DIAGNOSTICS ---');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('Hostname:', process.env.HOSTNAME);
  
  const dbUrl = process.env.DATABASE_URL || '';
  if (dbUrl) {
    const masked = dbUrl.replace(/:([^:@]+)@/, ':****@');
    console.log('DATABASE_URL (masked):', masked);
    
    // Parse URL to debug parts
     try {
       const url = new URL(dbUrl);
       console.log('DB Host:', url.hostname);
       console.log('DB Port:', url.port);
       console.log('DB Name:', url.pathname);
       
       // DNS Lookup
       try {
         const dns = require('dns').promises;
         const lookup = await dns.lookup(url.hostname);
         console.log(`DNS Lookup for ${url.hostname}:`, lookup);
       } catch (dnsErr: any) {
         console.error(`DNS Lookup FAILED for ${url.hostname}:`, dnsErr.message);
       }
     } catch (e) {
       console.log('Invalid DATABASE_URL format');
     }

    // Attempt direct connection
    try {
      console.log('Testing DB connection...');
      await prisma.$connect();
      console.log('✅ DB Connection SUCCESS');
      await prisma.$disconnect();
    } catch (e: any) {
      console.error('❌ DB Connection FAILED:', e.message);
    }
  } else {
    console.error('❌ DATABASE_URL is NOT set');
  }
  console.log('--- END DIAGNOSTICS ---');
})();
// --- DIAGNOSTIC END ---

const app = express();

const PORT = Number(process.env.PORT || 8080);
const NODE_ENV = process.env.NODE_ENV || 'development';
const SESSION_SECRET = process.env.SESSION_SECRET || 'dev_session_secret_change_me';
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';
const TRUST_PROXY = process.env.TRUST_PROXY ? Number(process.env.TRUST_PROXY) : 0;
const IS_PROD = NODE_ENV === 'production';
const COOKIE_SECURE_RAW = (process.env.COOKIE_SECURE || '').toLowerCase();
const COOKIE_SECURE: boolean | 'auto' = COOKIE_SECURE_RAW === 'auto'
  ? 'auto'
  : COOKIE_SECURE_RAW === 'true'
    ? true
    : IS_PROD
      ? 'auto'
      : false;

const COOKIE_SAME_SITE_RAW = (process.env.COOKIE_SAME_SITE || '').toLowerCase();
const COOKIE_SAME_SITE: 'lax' | 'strict' | 'none' =
  COOKIE_SAME_SITE_RAW === 'lax' || COOKIE_SAME_SITE_RAW === 'strict' || COOKIE_SAME_SITE_RAW === 'none'
    ? (COOKIE_SAME_SITE_RAW as any)
    : (IS_PROD ? 'lax' : 'none');

app.set('trust proxy', TRUST_PROXY);

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://cdn.tailwindcss.com"],
      styleSrc: ["'self'", "https:", "'unsafe-inline'"],
      fontSrc: ["'self'", "https:", "data:"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", CORS_ORIGIN, "https://app.demoexpert.fr", "https://demoexpert.fr"]
    }
  }
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());
app.use('/api/settings', (req, _res, next) => {
  try { console.log(`[settings] ${new Date().toISOString()} ${req.method} X-Instance=${process.env.HOSTNAME || require('os').hostname()}`); } catch {}
  next();
});
app.use('/api', (_req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
  res.set('Pragma', 'no-cache');
  res.set('Vary', 'Origin');
  next();
});
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow all origins in development or if CORS_ORIGIN is set to '*'
    if (NODE_ENV !== 'production' || CORS_ORIGIN === '*') return callback(null, true);

    // Check if origin matches allowed origin
    if (origin === CORS_ORIGIN || origin.startsWith('https://app.demoexpert.fr') || origin.startsWith('https://demoexpert.fr')) {
      return callback(null, true);
    } else {
      console.warn(`Blocked by CORS: ${origin}`);
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Cookie'],
  preflightContinue: false,
  optionsSuccessStatus: 204,
}));

// Handle preflight explicitly for all routes
app.options('*', cors());

app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  proxy: true,
  cookie: {
    httpOnly: true,
    secure: COOKIE_SECURE,
    sameSite: COOKIE_SAME_SITE,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
}));

type UserSession = { id: string; name: string; email: string; role: 'Admin'|'Staff'; status: 'approved'|'pending' };

function requireAuth(req: any, res: any, next: any) {
  const user = (req.session as any)?.user as UserSession | undefined;
  if (!user) return res.status(401).json({ error: 'unauthorized' });
  next();
}

function requireAdmin(req: any, res: any, next: any) {
  const user = (req.session as any)?.user as UserSession | undefined;
  if (!user) return res.status(401).json({ error: 'unauthorized' });
  if (user.role !== 'Admin') return res.status(403).json({ error: 'forbidden' });
  next();
}

app.get('/healthz', (_req, res) => {
  res.status(200).json({ status: 'ok', env: NODE_ENV });
});

app.get('/api/healthz', (_req, res) => {
  res.status(200).json({ status: 'ok', env: NODE_ENV });
});

app.get('/api/db/health', async (_req, res) => {
  try {
    if (!process.env.DATABASE_URL) {
      return res.status(503).json({ ok: false, error: 'DATABASE_URL_missing' });
    }
    await prisma.$queryRaw`SELECT 1`; 
    res.json({ ok: true });
  } catch (e) {
    res.status(503).json({ ok: false, error: 'db_unreachable' });
  }
});

app.get('/api/admin/users', requireAdmin, async (_req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, email: true, role: true, status: true, createdAt: true, updatedAt: true }
    });
    return res.json(users);
  } catch {
    return res.status(500).json({ error: 'failed_to_list_users' });
  }
});

app.post('/api/admin/users', requireAdmin, async (req, res) => {
  try {
    const { name, email, password, role } = req.body || {};
    if (!name || !email || !password) return res.status(400).json({ error: 'missing_fields' });
    const hash = await bcrypt.hash(String(password), 10);
    const created = await prisma.user.create({
      data: {
        name: String(name),
        email: String(email).toLowerCase(),
        password: hash,
        role: role === 'Admin' ? 'Admin' : 'Staff',
        status: 'approved',
      },
      select: { id: true, name: true, email: true, role: true, status: true, createdAt: true, updatedAt: true }
    });
    return res.status(201).json(created);
  } catch (e: any) {
    if (String(e?.code || '').toLowerCase() === 'p2002') return res.status(409).json({ error: 'email_already_exists' });
    return res.status(500).json({ error: 'failed_to_create_user' });
  }
});

app.put('/api/admin/users/:id', requireAdmin, async (req, res) => {
  try {
    const { name, email, role } = req.body || {};
    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: {
        ...(name !== undefined ? { name: String(name) } : {}),
        ...(email !== undefined ? { email: String(email).toLowerCase() } : {}),
        ...(role !== undefined ? { role: role === 'Admin' ? 'Admin' : 'Staff' } : {}),
      },
      select: { id: true, name: true, email: true, role: true, status: true, createdAt: true, updatedAt: true }
    });
    return res.json(updated);
  } catch {
    return res.status(500).json({ error: 'failed_to_update_user' });
  }
});

app.post('/api/admin/users/:id/approve', requireAdmin, async (req, res) => {
  try {
    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: { status: 'approved' },
      select: { id: true, name: true, email: true, role: true, status: true, createdAt: true, updatedAt: true }
    });
    return res.json(updated);
  } catch {
    return res.status(500).json({ error: 'failed_to_approve_user' });
  }
});

app.delete('/api/admin/users/:id', requireAdmin, async (req, res) => {
  try {
    await prisma.user.delete({ where: { id: req.params.id } });
    return res.json({ success: true });
  } catch {
    return res.status(404).json({ error: 'not_found' });
  }
});

app.get('/api/admin/messages', requireAdmin, async (_req, res) => {
  try {
    const msgs = await prisma.adminMessage.findMany({ orderBy: { receivedAt: 'desc' } });
    return res.json(msgs);
  } catch {
    return res.status(500).json({ error: 'failed_to_list_messages' });
  }
});

app.post('/api/admin/messages', requireAdmin, async (req, res) => {
  try {
    const { to, subject, content } = req.body || {};
    if (!to || !subject || !content) return res.status(400).json({ error: 'missing_fields' });
    await getSmtpTransport();
    return res.json({ success: true });
  } catch (e: any) {
    if (e?.message === 'smtp_not_configured') return res.status(400).json({ error: 'smtp_not_configured' });
    return res.status(500).json({ error: 'smtp_send_failed' });
  }
});

app.put('/api/admin/messages/:id', requireAdmin, async (req, res) => {
  try {
    const { isArchived } = req.body || {};
    const updated = await prisma.adminMessage.update({ where: { id: req.params.id }, data: { isArchived: Boolean(isArchived) } });
    return res.json(updated);
  } catch {
    return res.status(404).json({ error: 'not_found' });
  }
});

app.delete('/api/admin/messages/:id', requireAdmin, async (req, res) => {
  try {
    await prisma.adminMessage.delete({ where: { id: req.params.id } });
    return res.json({ success: true });
  } catch {
    return res.status(404).json({ error: 'not_found' });
  }
});

app.get('/api/audit-logs', requireAdmin, async (_req, res) => {
  try {
    const logs = await prisma.auditLogEntry.findMany({ orderBy: { createdAt: 'desc' } });
    return res.json(logs);
  } catch (e: any) {
    const code = String(e?.code || '');
    console.error('Failed to list audit logs:', { code, message: e?.message });
    if (code === 'P2021' || code === 'P2022') {
      return res.json([]);
    }
    return res.status(500).json({ error: 'failed_to_list_audit_logs' });
  }
});

app.get('/api/lift-bookings', requireAdmin, async (_req, res) => {
  try {
    const bookings = await prisma.liftRentalBooking.findMany({ orderBy: { createdAt: 'desc' } });
    return res.json(bookings);
  } catch (e: any) {
    const code = String(e?.code || '');
    console.error('Failed to list lift bookings:', { code, message: e?.message });
    if (code === 'P2021' || code === 'P2022') {
      return res.json([]);
    }
    return res.status(500).json({ error: 'failed_to_list_lift_bookings' });
  }
});

app.put('/api/lift-bookings/:id/status', requireAdmin, async (req, res) => {
  try {
    const { status } = req.body || {};
    const updated = await prisma.liftRentalBooking.update({ where: { id: req.params.id }, data: { status: String(status || 'pending') } });
    return res.json(updated);
  } catch {
    return res.status(404).json({ error: 'not_found' });
  }
});

app.post('/api/contacts/delete', requireAdmin, async (req, res) => {
  try {
    const { ids = [], emails = [] } = req.body || {};
    const idsArr = Array.isArray(ids) ? ids.filter(Boolean).map(String) : [];
    const emailsArr = Array.isArray(emails) ? emails.filter(Boolean).map((e: any) => String(e).toLowerCase()) : [];
    const r = await prisma.contact.deleteMany({ where: { OR: [
      ...(idsArr.length ? [{ id: { in: idsArr } }] : []),
      ...(emailsArr.length ? [{ email: { in: emailsArr } }] : []),
    ] } });
    return res.json({ deleted: r.count });
  } catch {
    return res.status(500).json({ error: 'failed_to_delete_contacts' });
  }
});

app.get('/api/it-tracking', requireAdmin, (_req, res) => {
  return res.json([]);
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
  const normalizePage = (p: any, def: any) => ({
    heroTitle: p?.heroTitle ?? def.heroTitle,
    heroSubtitle: p?.heroSubtitle ?? def.heroSubtitle,
    heroImage: p?.heroImage ?? def.heroImage,
    contentTitle: p?.contentTitle ?? def.contentTitle,
    contentDescription: p?.contentDescription ?? def.contentDescription,
    contentImage: p?.contentImage ?? def.contentImage,
    features: Array.isArray(p?.features) ? p.features : def.features
  });
  const pageContent = {
    repairs: normalizePage(pc?.repairs ?? {}, DEFAULT_SETTINGS.pageContent.repairs),
    maintenance: normalizePage(pc?.maintenance ?? {}, DEFAULT_SETTINGS.pageContent.maintenance),
    tires: normalizePage(pc?.tires ?? {}, DEFAULT_SETTINGS.pageContent.tires),
    vhu: normalizePage(pc?.vhu ?? {}, DEFAULT_SETTINGS.pageContent.vhu),
    removal: normalizePage(pc?.removal ?? {}, DEFAULT_SETTINGS.pageContent.removal),
    parts: normalizePage(pc?.parts ?? {}, DEFAULT_SETTINGS.pageContent.parts),
    buyback: normalizePage(pc?.buyback ?? {}, DEFAULT_SETTINGS.pageContent.buyback),
    windshield: normalizePage(pc?.windshield ?? {}, DEFAULT_SETTINGS.pageContent.windshield),
    lift: normalizePage(pc?.lift ?? {}, DEFAULT_SETTINGS.pageContent.lift)
  };
  const adv = input?.advancedSettings ?? {};
  const advancedSettings = {
    smtp: {
      host: adv?.smtp?.host ?? '',
      port: adv?.smtp?.port ?? 0,
      user: adv?.smtp?.user ?? '',
      pass: adv?.smtp?.pass ?? '',
      fromName: adv?.smtp?.fromName ?? DEFAULT_SETTINGS.advancedSettings.smtp.fromName,
      fromEmail: adv?.smtp?.fromEmail ?? DEFAULT_SETTINGS.advancedSettings.smtp.fromEmail,
    },
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

  const faq = Array.isArray(input?.faq) ? input.faq : DEFAULT_SETTINGS.faq;

  const f = input?.footer ?? {};
  const footer = {
    description: f?.description ?? DEFAULT_SETTINGS.footer.description,
    servicesLinks: Array.isArray(f?.servicesLinks) && f.servicesLinks.length > 0 ? f.servicesLinks : DEFAULT_SETTINGS.footer.servicesLinks,
    infoLinks: Array.isArray(f?.infoLinks) && f.infoLinks.length > 0 ? f.infoLinks : DEFAULT_SETTINGS.footer.infoLinks,
  };
  return { ...input, businessInfo, socialLinks, hero, services, testimonials, faq, pageContent, advancedSettings, footer };
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
    { id: 'serv-3', icon: 'fas fa-truck-pickup', title: "Enlèvement d'Épave", description: "Service d'enlèvement d'épave gratuit en fonction de la distance en Normandie et possible hors agglomération. Simple et rapide.", link: '/enlevement-epave' },
    { id: 'serv-4', icon: 'fas fa-shield-halved', title: 'Pare-brise', description: "Réparation d'impacts et remplacement. Service rapide et garanti.", link: '/pare-brise' },
    { id: 'serv-5', icon: 'fas fa-tools', title: 'Location de Pont', description: 'Louez un de nos ponts élévateurs pour faire votre mécanique.', link: '/location-pont' },
    { id: 'serv-6', icon: 'fas fa-wrench', title: 'Réparation & Entretien', description: 'Diagnostic, réparation et entretien toutes marques.', link: '/entretien' }
  ],
  testimonials: [
    { id: 'test-1', text: "Service rapide et pièce conforme. J'ai économisé une fortune sur la réparation de ma Clio. Je recommande !!", author: 'Julien D., Rouen' },
    { id: 'test-2', text: "Enlèvement de mon épave en 48h, tout s'est très bien passé. Équipe très professionnelle.", author: 'Sylvie M., Le Havre' },
    { id: 'test-3', text: "J'ai trouvé un alternateur pour ma 308 que je ne trouvais nulle part ailleurs. Merci Démolition Expert !", author: 'Garage Martin' }
  ],
  faq: [
    {
      id: "faq-1",
      question: "Comment fonctionne le rachat de véhicule ?",
      answer: "Vous nous contactez via le formulaire dédié ou par téléphone. Nous évaluons votre véhicule et vous faisons une proposition."
    },
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
      { id: 'fil-2', text: 'VHU agréé', url: '/vhu' },
      { id: 'fil-3', text: 'FAQ', url: '/faq' },
      { id: 'fil-4', text: 'CGV', url: '/cgv' },
      { id: 'fil-5', text: 'Mentions Légales', url: '/mentions-legales' }
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
    tires: { heroTitle: 'Service Pneus', heroSubtitle: 'Vente, montage et équilibrage.', heroImage: 'https://picsum.photos/seed/tire-fitting/1920/1080', contentTitle: 'Votre sécurité, notre priorité', contentDescription: "Nous proposons une large gamme de pneus neufs et d'occasion.", contentImage: 'https://picsum.photos/seed/wheel-balancing/800/600', features: [ '<strong>Vente de pneus neufs et d\'occasion</strong>', '<strong>Montage et équilibrage</strong>', '<strong>Réparation de crevaison</strong>' ] },
    vhu: { heroTitle: "Centre VHU agréé", heroSubtitle: "Traitement réglementé des véhicules hors d’usage.", heroImage: "https://picsum.photos/seed/vhu-hero/1920/1080", contentTitle: "Procédure et conformité", contentDescription: "Enlèvement, dépollution, destruction avec certificat officiel.", contentImage: "https://picsum.photos/seed/vhu-procedure/800/600", features: [ "<strong>Centre VHU agréé</strong>", "<strong>Traçabilité complète</strong>", "<strong>Dépollution conforme</strong>" ] },
    removal: { heroTitle: "Enlèvement d'épaves", heroSubtitle: "Service d'enlèvement d'épave gratuit en fonction de la distance en Normandie et possible hors agglomération. Simple et rapide.", heroImage: "https://picsum.photos/seed/tow-truck/1920/1080", contentTitle: "Libérez-vous de votre épave", contentDescription: "Nous intervenons rapidement pour l'enlèvement de votre véhicule hors d'usage.", contentImage: "https://picsum.photos/seed/scrap-yard/800/600", features: [ "<strong>Enlèvement gratuit</strong>", "<strong>Intervention rapide</strong>", "<strong>Formalités administratives incluses</strong>" ] },
    parts: { heroTitle: "Catalogue de Pièces", heroSubtitle: "Trouvez la pièce parfaite pour votre véhicule parmi notre large sélection.", heroImage: "https://picsum.photos/seed/parts-hero/1920/1080", contentTitle: "Un large choix de pièces", contentDescription: "Toutes nos pièces sont démontées, testées et garanties.", contentImage: "https://picsum.photos/seed/parts-stock/800/600", features: [ "<strong>Pièces garanties</strong>", "<strong>Testées par nos experts</strong>", "<strong>Prix attractifs</strong>" ] },
    buyback: { heroTitle: "Rachat de Véhicule", heroSubtitle: "Obtenez une offre gratuite pour votre voiture en quelques étapes.", heroImage: "https://picsum.photos/seed/buyback-hero/1920/1080", contentTitle: "Vendez votre véhicule simplement", contentDescription: "Nous rachetons tous types de véhicules, quel que soit leur état.", contentImage: "https://picsum.photos/seed/car-cash/800/600", features: [ "<strong>Estimation gratuite</strong>", "<strong>Paiement immédiat</strong>", "<strong>Pas de contrôle technique requis</strong>" ] },
    windshield: { heroTitle: "Remplacement & Réparation de Pare-Brise", heroSubtitle: "Visibilité et sécurité maximales avec notre service expert.", heroImage: "https://picsum.photos/seed/windshield-bg/1920/1080", contentTitle: "Un service complet pour votre visibilité", contentDescription: "Un impact ou une fissure sur votre pare-brise ? N'attendez pas que les dégâts s'aggravent. Chez Démolition Expert, nous évaluons rapidement les dommages et proposons la meilleure solution.", contentImage: "https://picsum.photos/seed/windshield-repair/800/600", features: [ "<strong>Réparation d'impact</strong>", "<strong>Remplacement de Pare-Brise</strong>", "<strong>Compatible toutes assurances</strong>" ] },
    lift: { heroTitle: "Location de Pont Élévateur", heroSubtitle: "Travaillez sur votre véhicule comme un pro dans notre atelier.", heroImage: "https://picsum.photos/seed/lift-rental/1920/1080", contentTitle: "Un atelier tout équipé", contentDescription: "Louez un pont et profitez de notre outillage professionnel.", contentImage: "https://picsum.photos/seed/garage-workshop/800/600", features: [ "<strong>Ponts professionnels</strong>", "<strong>Outillage disponible</strong>", "<strong>Conseils de pros</strong>" ] }
  },
  advancedSettings: {
    smtp: { host: 'smtp.example.com', port: 587, user: 'user@example.com', pass: '', fromName: "Demolition Expert", fromEmail: "no-reply@casseautopro.fr" },
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

async function getSmtpTransport() {
  try {
    const s = await prisma.settings.findUnique({ where: { key: 'site_settings' } });
    const normalized = normalizeSettings(s?.value ?? DEFAULT_SETTINGS);
    const smtp = normalized?.advancedSettings?.smtp ?? { host: '', port: 0, user: '', pass: '' };
    if (!smtp.host || !smtp.port) throw new Error('smtp_not_configured');
    const transporter = nodemailer.createTransport({
      host: smtp.host,
      port: smtp.port || 587,
      secure: smtp.port === 465,
      auth: smtp.user ? { user: smtp.user, pass: smtp.pass || '' } : undefined
    });
    return transporter;
  } catch (e) {
    console.error('getSmtpTransport error:', e);
    throw new Error('smtp_not_configured');
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

  if (!process.env.DATABASE_URL) {
    return res.status(503).json({ error: 'database_not_configured' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email: String(email).toLowerCase() } });
    if (!user) return res.status(401).json({ error: 'invalid_credentials' });
    const ok = await bcrypt.compare(String(password), user.password);
    if (!ok) return res.status(401).json({ error: 'invalid_credentials' });
    if (user.status === 'pending') return res.status(403).json({ error: 'account_pending' });
    const safeUser: UserSession = { id: user.id, name: user.name, email: user.email, role: user.role as any, status: user.status as any };
    (req.session as any).user = safeUser;
    return res.json(safeUser);
  } catch (err: any) {
    console.error('[login] Error:', err?.message || err);
    console.error('[login] Stack:', err?.stack);
    return res.status(500).json({ error: 'login_failed', detail: err?.message, code: err?.code });
  }
});

app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'missing_credentials' });

  if (!process.env.DATABASE_URL) {
    return res.status(503).json({ error: 'database_not_configured' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email: String(email).toLowerCase() } });
    if (!user) return res.status(401).json({ error: 'invalid_credentials' });
    const ok = await bcrypt.compare(String(password), user.password);
    if (!ok) return res.status(401).json({ error: 'invalid_credentials' });
    if (user.status === 'pending') return res.status(403).json({ error: 'account_pending' });
    const safeUser: UserSession = { id: user.id, name: user.name, email: user.email, role: user.role as any, status: user.status as any };
    (req.session as any).user = safeUser;
    return res.json(safeUser);
  } catch (err: any) {
    console.error('[login] Error:', err?.message || err);
    return res.status(500).json({ error: 'login_failed', detail: err?.message });
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
    const { message, history, settings } = req.body || {};
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
      body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }] }] })
    });

    if (!r.ok) {
      const details = await r.text().catch(() => '');
      return res.json({ text: fallback(), error: 'ai_call_failed', details });
    }

    const raw = await r.json();
    const data: any = raw;
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || fallback();
    return res.json({ text });
  } catch (e: any) {
    return res.json({ text: "Je suis un assistant. L’IA n’est pas disponible pour le moment." });
  }
});

app.get('/api/products', async (req, res) => {
  try {
    const { category, brand, model, limit } = req.query as any;
    const take = limit ? Number(limit) : undefined;

    if (!process.env.DATABASE_URL) {
      return res.status(503).json({ error: 'database_not_configured' });
    }

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
    res.json([]);
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    if (!process.env.DATABASE_URL) {
      return res.status(503).json({ error: 'database_not_configured' });
    }
    const product = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (!product) return res.status(404).json({ error: 'not_found' });
    res.json(product);
  } catch (e) {
    res.json({});
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
    if (!process.env.DATABASE_URL) {
      return res.status(503).json({ error: 'database_not_configured' });
    }
    
    const auctions = await prisma.auction.findMany({ orderBy: { createdAt: 'desc' } });
    const transformed = auctions.map(a => ({
      id: a.id,
      vehicle: {
        name: a.vehicleName,
        brand: a.brand,
        model: a.model,
        year: a.year,
        mileage: a.mileage,
        description: a.description,
        images: Array.isArray(a.images) ? a.images : []
      },
      startingPrice: Number(a.startingPrice),
      currentBid: Number(a.currentBid),
      bidCount: a.bidCount,
      bids: [],
      endDate: a.endDate
    }));
    res.json(transformed);
  } catch (error) {
    console.error("Failed to list auctions:", error);
    // Return mock data as fallback
    res.json([]);
  }
});

app.get('/api/auctions/:id', async (req, res) => {
  try {
    if (!process.env.DATABASE_URL) {
      return res.status(503).json({ error: 'database_not_configured' });
    }
    
    const a = await prisma.auction.findUnique({ where: { id: req.params.id }, include: { bids: { orderBy: { timestamp: 'desc' } } } });
    if (!a) return res.status(404).json({ error: 'not_found' });
    const transformed = {
      id: a.id,
      vehicle: {
        name: a.vehicleName,
        brand: a.brand,
        model: a.model,
        year: a.year,
        mileage: a.mileage,
        description: a.description,
        images: Array.isArray(a.images) ? a.images : []
      },
      startingPrice: Number(a.startingPrice),
      currentBid: Number(a.currentBid),
      bidCount: a.bidCount,
      bids: (a as any).bids?.map((b: any) => ({
        userId: b.userId,
        bidderName: b.bidderName,
        amount: Number(b.amount),
        timestamp: b.timestamp
      })) || [],
      endDate: a.endDate
    };
    res.json(transformed);
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

app.post('/api/auctions', requireAdmin, async (req, res) => {
  try {
    const d = req.body || {};
    const v = d.vehicle || {};
    const images = Array.isArray(v.images) ? v.images : (Array.isArray(d.images) ? d.images : []);
    const created = await prisma.auction.create({ data: {
      vehicleName: v.name ?? d.vehicleName ?? d.name ?? '',
      brand: v.brand ?? d.brand ?? '',
      model: v.model ?? d.model ?? '',
      year: Number(v.year ?? d.year ?? 0),
      mileage: Number(v.mileage ?? d.mileage ?? 0),
      description: v.description ?? d.description ?? '',
      images,
      startingPrice: String(d.startingPrice ?? 0),
      currentBid: String(d.currentBid ?? d.startingPrice ?? 0),
      bidCount: Number(d.bidCount ?? 0),
      endDate: d.endDate ? new Date(d.endDate) : new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
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

app.put('/api/auctions/:id', requireAdmin, async (req, res) => {
  try {
    const d = req.body || {};
    const v = d.vehicle || {};
    const updateData: any = {};
    if (d.vehicleName !== undefined || v.name !== undefined) updateData.vehicleName = v.name ?? d.vehicleName;
    if (d.brand !== undefined || v.brand !== undefined) updateData.brand = v.brand ?? d.brand;
    if (d.model !== undefined || v.model !== undefined) updateData.model = v.model ?? d.model;
    if (d.year !== undefined || v.year !== undefined) updateData.year = Number(v.year ?? d.year);
    if (d.mileage !== undefined || v.mileage !== undefined) updateData.mileage = Number(v.mileage ?? d.mileage);
    if (d.description !== undefined || v.description !== undefined) updateData.description = v.description ?? d.description;
    if (d.images !== undefined || v.images !== undefined) updateData.images = Array.isArray(v.images) ? v.images : (Array.isArray(d.images) ? d.images : []);
    if (d.startingPrice !== undefined) updateData.startingPrice = String(d.startingPrice);
    if (d.currentBid !== undefined) updateData.currentBid = String(d.currentBid);
    if (d.bidCount !== undefined) updateData.bidCount = Number(d.bidCount);
    if (d.endDate !== undefined) updateData.endDate = new Date(d.endDate);
    const updated = await prisma.auction.update({ where: { id: req.params.id }, data: updateData });
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
      if (process.env.STRICT_DB === 'true') {
        return res.status(503).json({ error: 'database_unavailable' });
      }
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

// --- Generic form endpoints sending messages to AdminMessage ---

app.post('/api/scrap-removal', async (req, res) => {
  try {
    const { name, email, phone, address, vehicle, immatriculation, date, commentaire } = req.body || {};

    if (!name || !email || !vehicle) {
      return res.status(400).json({ error: 'missing_required_fields' });
    }

    const msg = await prisma.adminMessage.create({
      data: {
        from: "Enlèvement d'épave",
        senderName: name,
        senderEmail: email,
        subject: `Enlèvement ${vehicle || ''}`,
        content: [
          phone && `Téléphone: ${phone}`,
          address && `Adresse: ${address}`,
          immatriculation && `Immatriculation: ${immatriculation}`,
          date && `Date souhaitée: ${date}`,
          commentaire && `Commentaire: ${commentaire}`,
        ].filter(Boolean).join('\n'),
      }
    });

    return res.status(201).json({ success: true, id: msg.id });
  } catch (error) {
    console.error('Failed to submit scrap removal request:', error);
    return res.status(500).json({ error: 'failed_to_submit_scrap_removal' });
  }
});

app.post('/api/windshield', async (req, res) => {
  try {
    const { name, email, phone, vehicle, year, immatriculation, damageType, message } = req.body || {};

    if (!name || !email || !vehicle) {
      return res.status(400).json({ error: 'missing_required_fields' });
    }

    const msg = await prisma.adminMessage.create({
      data: {
        from: 'Devis Pare-brise',
        senderName: name,
        senderEmail: email,
        subject: `Devis pour ${vehicle || ''}`,
        content: [
          phone && `Téléphone: ${phone}`,
          year && `Année: ${year}`,
          immatriculation && `Immatriculation: ${immatriculation}`,
          damageType && `Type de dommage: ${damageType}`,
          message && `Message: ${message}`,
        ].filter(Boolean).join('\n'),
      }
    });

    return res.status(201).json({ success: true, id: msg.id });
  } catch (error) {
    console.error('Failed to submit windshield request:', error);
    return res.status(500).json({ error: 'failed_to_submit_windshield' });
  }
});

app.post('/api/lift-rental', async (req, res) => {
  try {
    const { name, email, phone, date, time, duration, price } = req.body || {};

    if (!name || !email || !date || !time || !duration) {
      return res.status(400).json({ error: 'missing_required_fields' });
    }

    const msg = await prisma.adminMessage.create({
      data: {
        from: 'Location de Pont',
        senderName: name,
        senderEmail: email,
        subject: `Réservation pour le ${date} à ${time}`,
        content: [
          phone && `Téléphone: ${phone}`,
          `Durée: ${duration}h`,
          price && `Prix estimé: ${price} €`,
        ].filter(Boolean).join('\n'),
      }
    });

    return res.status(201).json({ success: true, id: msg.id });
  } catch (error) {
    console.error('Failed to submit lift rental request:', error);
    return res.status(500).json({ error: 'failed_to_submit_lift_rental' });
  }
});

app.post('/api/buyback', async (req, res) => {
  try {
    const { name, email, phone, brand, model, year, mileage, message } = req.body || {};

    if (!name || !email || !brand || !model) {
      return res.status(400).json({ error: 'missing_required_fields' });
    }

    const msg = await prisma.adminMessage.create({
      data: {
        from: 'Rachat de véhicule',
        senderName: name,
        senderEmail: email,
        subject: `Rachat: ${brand} ${model}`,
        content: [
          phone && `Téléphone: ${phone}`,
          year && `Année: ${year}`,
          mileage && `Kilométrage: ${mileage}`,
          message && `Message: ${message}`,
        ].filter(Boolean).join('\n'),
      }
    });

    // On renvoie un texte d'estimation générique comme dans le mock
    return res.status(201).json({ success: true, estimation: "Notre équipe analyse votre demande et vous contactera avec une estimation détaillée très prochainement.", id: msg.id });
  } catch (error) {
    console.error('Failed to submit buyback request:', error);
    return res.status(500).json({ error: 'failed_to_submit_buyback' });
  }
});

app.post('/api/quote', async (req, res) => {
  try {
    const { product, name, email, message } = req.body || {};

    if (!name || !email || !product) {
      return res.status(400).json({ error: 'missing_required_fields' });
    }

    const subjectProduct = product?.name || product?.oemRef || 'Devis pièce';

    const msg = await prisma.adminMessage.create({
      data: {
        from: 'Devis Pièce',
        senderName: name,
        senderEmail: email,
        subject: `Devis pour ${subjectProduct}`,
        content: [
          product?.oemRef && `Réf OEM: ${product.oemRef}`,
          message && `Message: ${message}`,
        ].filter(Boolean).join('\n'),
      }
    });

    return res.status(201).json({ success: true, id: msg.id });
  } catch (error) {
    console.error('Failed to submit quote request:', error);
    return res.status(500).json({ error: 'failed_to_submit_quote' });
  }
});

// --- Admin messaging ---

app.get('/api/admin/messages', async (_req, res) => {
  try {
    const messages = await prisma.adminMessage.findMany({ orderBy: { receivedAt: 'desc' } });
    return res.json(messages);
  } catch (error) {
    console.error('Failed to fetch admin messages:', error);
    return res.status(500).json({ error: 'failed_to_fetch_admin_messages' });
  }
});

// --- Site settings ---

app.get('/api/settings', async (_req, res) => {
  try {
    if (!process.env.DATABASE_URL) {
      return res.json({ key: 'site_settings', value: DEFAULT_SETTINGS });
    }
    let s = await prisma.settings.findUnique({ where: { key: 'site_settings' } });
    if (!s) {
      s = await prisma.settings.create({ data: { key: 'site_settings', value: DEFAULT_SETTINGS } });
    }
    return res.json(s.value ?? DEFAULT_SETTINGS);
  } catch (e: any) {
    console.error('[GET /api/settings] error:', e?.message);
    // Fallback to default settings if DB is unavailable
    return res.json(DEFAULT_SETTINGS);
  }
});

app.put('/api/settings', requireAdmin, async (req, res) => {
  try {
    if (!process.env.DATABASE_URL) {
      return res.status(503).json({ error: 'database_not_configured' });
    }
    const value = req.body;
    const s = await prisma.settings.upsert({
      where: { key: 'site_settings' },
      update: { value },
      create: { key: 'site_settings', value },
    });
    return res.json(s.value);
  } catch (e: any) {
    console.error('[PUT /api/settings] error:', e?.message);
    return res.status(500).json({ error: 'failed_to_update_settings' });
  }
});

app.get('/api/contact', async (_req, res) => {
  try {
    // Check if we have a database connection
    if (!process.env.DATABASE_URL) {
      if (process.env.STRICT_DB === 'true') {
        return res.status(503).json({ error: 'database_unavailable' });
      }
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
    const mapped = contacts.map((c: any) => ({ id: c.id, name: c.name, email: c.email, source: 'Message entrant' }));
    res.json(mapped);
  } catch (error) {
    console.error('Failed to fetch contacts:', error);
    res.status(500).json({ error: 'failed_to_fetch_contacts' });
  }
});

app.delete('/api/contact/:id', async (req, res) => {
  try {
    if (!process.env.DATABASE_URL) {
      if (process.env.STRICT_DB === 'true') {
        return res.status(503).json({ error: 'database_unavailable' });
      }
      return res.json({ success: true });
    }
    await prisma.contact.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to delete contact:', error);
    res.status(500).json({ error: 'failed_to_delete_contact' });
  }
});

app.post('/api/contacts/delete', async (req, res) => {
  try {
    const ids: string[] = Array.isArray(req.body?.ids) ? req.body.ids : [];
    const emails: string[] = Array.isArray(req.body?.emails) ? req.body.emails : [];
    if (!ids.length && !emails.length) {
      return res.status(400).json({ error: 'no_ids_or_emails' });
    }
    if (!process.env.DATABASE_URL) {
      if (process.env.STRICT_DB === 'true') {
        return res.status(503).json({ error: 'database_unavailable' });
      }
      return res.json({ deleted: ids.length || emails.length });
    }
    let resultCount = 0;
    if (ids.length > 0) {
      const result = await prisma.contact.deleteMany({ where: { id: { in: ids } } });
      resultCount += result.count;
    }
    if (emails.length > 0) {
      const result = await prisma.contact.deleteMany({ where: { email: { in: emails } } });
      resultCount += result.count;
    }
    res.json({ deleted: resultCount });
  } catch (error) {
    console.error('Failed to bulk delete contacts:', error);
    res.status(500).json({ error: 'failed_to_bulk_delete_contacts' });
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
      const created = await prisma.auction.create({ data: {
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
      if (Array.isArray(a.bids)) {
        for (const b of a.bids) {
          await prisma.bid.create({ data: {
            auctionId: created.id,
            userId: b.userId || '',
            bidderName: b.bidderName || 'Anonymous',
            amount: String(b.amount || created.currentBid),
            timestamp: b.timestamp ? new Date(b.timestamp) : new Date(),
          }});
        }
        const nextBidCount = await prisma.bid.count({ where: { auctionId: created.id } });
        const lastBid = await prisma.bid.findFirst({ where: { auctionId: created.id }, orderBy: { timestamp: 'desc' }, select: { amount: true } });
        await prisma.auction.update({ where: { id: created.id }, data: { bidCount: nextBidCount, currentBid: lastBid?.amount || created.currentBid } });
      }
      count++;
    }
    res.json({ imported: count });
  } catch {
    res.status(500).json({ error: 'failed_to_import' });
  }
});

app.get('/api/settings', async (_req, res) => {
  try {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    res.set('Pragma', 'no-cache');
    res.set('Vary', 'Origin');
    try { res.set('X-Instance', process.env.HOSTNAME || require('os').hostname()); } catch {}
    const settings = await prisma.settings.findUnique({ where: { key: 'site_settings' } });
    if (!settings) {
      return res.status(503).json({ error: 'settings_missing' });
    }
    return res.json(normalizeSettings(settings.value));
  } catch (error) {
    console.error("Failed to fetch settings from database:", error);
    return res.status(503).json({ error: 'database_unavailable' });
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

app.post('/api/settings/import', requireAdmin, async (req, res) => {
  try {
    const value = req.body?.settings ?? req.body;
    await prisma.settings.upsert({
      where: { key: 'site_settings' },
      update: { value },
      create: { key: 'site_settings', value }
    });
    res.json({ imported: 1 });
  } catch {
    res.status(500).json({ error: 'failed_to_import_settings' });
  }
});

app.post('/api/products/import', requireAdmin, async (req, res) => {
  try {
    const items = Array.isArray(req.body?.products) ? req.body.products : [];
    if (!items.length) return res.json({ imported: 0 });
    for (const p of items) {
      await prisma.product.create({
        data: {
          name: p.name || '',
          oemRef: p.oemRef || `REF${Date.now()}`,
          brand: p.brand || '',
          model: p.model || '',
          year: Number(p.year || 0),
          category: String(p.category || ''),
          price: String(p.price || 0),
          condition: String(p.condition || ''),
          warranty: String(p.warranty || ''),
          compatibility: p.compatibility || null,
          images: Array.isArray(p.images) ? p.images : [],
          description: p.description || ''
        }
      });
    }
    res.json({ imported: items.length });
  } catch {
    res.status(500).json({ error: 'failed_to_import_products' });
  }
});

app.post('/api/contacts/import', requireAdmin, async (req, res) => {
  try {
    const items = Array.isArray(req.body?.contacts) ? req.body.contacts : [];
    let count = 0;
    for (const c of items) {
      await prisma.contact.create({ data: {
        name: c.name || '',
        email: c.email || '',
        subject: c.subject || '',
        message: c.message || ''
      }});
      count++;
    }
    res.json({ imported: count });
  } catch {
    res.status(500).json({ error: 'failed_to_import_contacts' });
  }
});

app.post('/api/admin/messages/import', requireAdmin, async (req, res) => {
  try {
    const items = Array.isArray(req.body?.messages) ? req.body.messages : [];
    let count = 0;
    for (const m of items) {
      await prisma.adminMessage.create({ data: {
        from: m.from || '',
        senderName: m.senderName || '',
        senderEmail: m.senderEmail || '',
        userId: m.userId || null,
        subject: m.subject || '',
        content: m.content || '',
        isRead: Boolean(m.isRead),
        isArchived: Boolean(m.isArchived),
        status: m.status || 'pending',
        attachment: m.attachment || null
      }});
      count++;
    }
    res.json({ imported: count });
  } catch {
    res.status(500).json({ error: 'failed_to_import_messages' });
  }
});

app.post('/api/users/import', requireAdmin, async (req, res) => {
  try {
    const items = Array.isArray(req.body?.users) ? req.body.users : [];
    let count = 0;
    for (const u of items) {
      const name = u.name || '';
      const email = u.email || '';
      const role = (u.role === 'Admin' || u.role === 'Staff') ? u.role : 'Staff';
      const status = (u.status === 'pending' || u.status === 'approved') ? u.status : 'approved';
      const pwd = u.password || 'password123';
      const hash = await bcrypt.hash(pwd, 10);
      await prisma.user.upsert({
        where: { email },
        update: { name, role, status, password: hash },
        create: { name, email, role, status, password: hash }
      });
      count++;
    }
    res.json({ imported: count });
  } catch {
    res.status(500).json({ error: 'failed_to_import_users' });
  }
});

app.get('/robots.txt', (req, res) => {
  const host = `${req.protocol}://${req.get('host')}`;
  res.type('text/plain').send(`User-agent: *\nAllow: /\nSitemap: ${host}/sitemap.xml`);
});

app.get('/sitemap.xml', async (req, res) => {
  const host = `${req.protocol}://${req.get('host')}`;
  const staticUrls = ['/', '/pieces', '/offres', '/rachat-vehicule', '/enlevement-epave', '/vhu', '/faq', '/pare-brise', '/location-pont', '/reparation', '/entretien', '/pneus', '/contact', '/mentions-legales', '/cgv', '/confidentialite'];
  let dynamicUrls = [] as string[];
  try {
    if (process.env.DATABASE_URL) {
      const auctions = await prisma.auction.findMany({ select: { id: true } });
      dynamicUrls = auctions.map(a => `/offres/${a.id}`);
    }
  } catch {}
  const urls = [...staticUrls, ...dynamicUrls]
    .map(u => `<url><loc>${host}${u}</loc></url>`)
    .join('');
  const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;
  res.type('application/xml').send(xml);
});

// --- 🔧 FIX: Start Server Immediately ---
// Do not wait for DB connection or settings.
// This prevents 502 Bad Gateway errors if DB is slow.
ensureDefaultSettings().catch(err => {
  console.error('Failed to ensure default settings on startup:', err);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`API listening on 0.0.0.0:${PORT} (${NODE_ENV})`);
  console.log('Note: Some features may be limited without a database connection');
});

// --- Admin Messages API ---
app.get('/api/admin/messages', async (req, res) => {
  try {
    // Check if we have a database connection
    if (!process.env.DATABASE_URL) {
      if (process.env.STRICT_DB === 'true') {
        return res.status(503).json({ error: 'database_unavailable' });
      }
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
    const { to, subject, content, attachment, messageId, from, senderName, senderEmail, userId } = req.body || {};

    // If sending an outbound email
    if (to && subject && content) {
      try {
        const transporter = await getSmtpTransport();
        const currentUser = (req.session as any)?.user;
        const adminEmail = currentUser?.email;

        let settingsValue: any = DEFAULT_SETTINGS;
        try {
          const s = await prisma.settings.findUnique({ where: { key: 'site_settings' } });
          settingsValue = s?.value ?? DEFAULT_SETTINGS;
        } catch {}
        const normalized = normalizeSettings(settingsValue);
        const businessEmail = normalized?.businessInfo?.email || 'no-reply@casseautopro.fr';

        const mailOptions: any = {
          from: businessEmail,
          to,
          subject,
          text: content,
          html: `<p>${content.replace(/\n/g, '<br/>')}</p>`
        };
        if (attachment?.name && attachment?.url) {
          mailOptions.attachments = [{ filename: attachment.name, path: attachment.url }];
        }
        if (adminEmail && adminEmail !== to) {
          mailOptions.bcc = adminEmail;
        }

        await transporter.sendMail(mailOptions);

        let saved: any = { id: `sent-${Date.now()}` };
        try {
          if (process.env.DATABASE_URL) {
            saved = await prisma.adminMessage.create({
              data: {
                from: 'Administration',
                senderName: currentUser?.name || 'Admin',
                senderEmail: businessEmail,
                subject,
                content,
                userId: currentUser?.id || null,
                receivedAt: new Date(),
                isRead: true,
                isArchived: false,
                status: 'sent'
              }
            });
          }
        } catch (dbError) {
           console.error('Email sent but failed to save to DB:', dbError);
           // Continue to return success since email was sent
        }

        return res.status(201).json({ success: true, id: saved.id });
      } catch (err: any) {
        console.error('SMTP send failed:', err);
        if (err.message === 'smtp_not_configured') {
             return res.status(503).json({ error: 'smtp_not_configured' });
        }
        return res.status(503).json({ error: 'smtp_send_failed', details: err.message || String(err) });
      }
    }

    // Otherwise, create an inbound admin message
    const inbound = { from, senderName, senderEmail, subject, content, userId };

    if (!inbound.from || !inbound.senderName || !inbound.senderEmail || !inbound.subject || !inbound.content) {
      return res.status(400).json({ error: 'missing_required_fields' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inbound.senderEmail)) {
      return res.status(400).json({ error: 'invalid_email_format' });
    }

    if (!process.env.DATABASE_URL) {
      if (process.env.STRICT_DB === 'true') {
        return res.status(503).json({ error: 'database_unavailable' });
      }
      return res.status(201).json({
        id: `mock-msg-${Date.now()}`,
        ...inbound,
        receivedAt: new Date(),
        isRead: false,
        isArchived: false,
        status: 'pending'
      });
    }

    const message = await prisma.adminMessage.create({
      data: {
        ...inbound,
        receivedAt: new Date()
      }
    });

    res.status(201).json(message);
  } catch (error) {
    console.error('Failed to create/send admin message:', error);
    res.status(500).json({ error: 'failed_to_create_admin_message' });
  }
});

app.put('/api/admin/messages/:id', async (req, res) => {
  try {
    const { isRead, isArchived, status } = req.body || {};
    
    // Check if we have a database connection
    if (!process.env.DATABASE_URL) {
      if (process.env.STRICT_DB === 'true') {
        return res.status(503).json({ error: 'database_unavailable' });
      }
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
      if (process.env.STRICT_DB === 'true') {
        return res.status(503).json({ error: 'database_unavailable' });
      }
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

// --- Admin Users API ---

app.get('/api/admin/users', requireAdmin, async (_req, res) => {
  try {
    if (!process.env.DATABASE_URL) {
      if (process.env.STRICT_DB === 'true') {
        return res.status(503).json({ error: 'database_unavailable' });
      }
      return res.json([]);
    }

    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(users);
  } catch (error) {
    console.error('Failed to list admin users:', error);
    res.status(500).json({ error: 'failed_to_list_users' });
  }
});

app.post('/api/admin/users', requireAdmin, async (req, res) => {
  try {
    const { name, email, password, role } = req.body || {};

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'missing_required_fields' });
    }

    if (!process.env.DATABASE_URL) {
      return res.status(503).json({ error: 'database_unavailable' });
    }

    const hashed = await bcrypt.hash(String(password), 10);
    const user = await prisma.user.create({
      data: {
        name: String(name),
        email: String(email).toLowerCase(),
        password: hashed,
        role: role === 'Admin' ? 'Admin' : 'Staff',
        status: 'approved'
      }
    });
    res.status(201).json(user);
  } catch (error) {
    console.error('Failed to create admin user:', error);
    res.status(500).json({ error: 'failed_to_create_user' });
  }
});

app.put('/api/admin/users/:id', requireAdmin, async (req, res) => {
  try {
    if (!process.env.DATABASE_URL) {
      return res.status(503).json({ error: 'database_unavailable' });
    }

    const { name, email, role, status } = req.body || {};
    const data: any = {};
    if (name !== undefined) data.name = String(name);
    if (email !== undefined) data.email = String(email).toLowerCase();
    if (role !== undefined && (role === 'Admin' || role === 'Staff')) data.role = role;
    if (status !== undefined && (status === 'approved' || status === 'pending')) data.status = status;

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data
    });
    res.json(user);
  } catch (error) {
    console.error('Failed to update admin user:', error);
    res.status(500).json({ error: 'failed_to_update_user' });
  }
});

app.post('/api/admin/users/:id/approve', requireAdmin, async (req, res) => {
  try {
    if (!process.env.DATABASE_URL) {
      return res.status(503).json({ error: 'database_unavailable' });
    }

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { status: 'approved' }
    });
    res.json(user);
  } catch (error) {
    console.error('Failed to approve user:', error);
    res.status(500).json({ error: 'failed_to_approve_user' });
  }
});

app.delete('/api/admin/users/:id', requireAdmin, async (req, res) => {
  try {
    if (!process.env.DATABASE_URL) {
      return res.status(503).json({ error: 'database_unavailable' });
    }

    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to delete user:', error);
    res.status(500).json({ error: 'failed_to_delete_user' });
  }
});

// --- Lift Rental Bookings API ---

app.get('/api/lift-bookings', requireAdmin, async (_req, res) => {
  try {
    if (!process.env.DATABASE_URL) {
      if (process.env.STRICT_DB === 'true') {
        return res.status(503).json({ error: 'database_unavailable' });
      }
      return res.json([]);
    }

    const bookings = await prisma.liftRentalBooking.findMany({
      orderBy: { date: 'desc' }
    });
    res.json(bookings);
  } catch (error) {
    console.error('Failed to list lift bookings:', error);
    res.status(500).json({ error: 'failed_to_list_lift_bookings' });
  }
});

app.put('/api/lift-bookings/:id/status', requireAdmin, async (req, res) => {
  try {
    if (!process.env.DATABASE_URL) {
      return res.status(503).json({ error: 'database_unavailable' });
    }

    const { status } = req.body || {};
    if (!status || !['pending', 'confirmed', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'invalid_status' });
    }

    const booking = await prisma.liftRentalBooking.update({
      where: { id: req.params.id },
      data: { status }
    });
    res.json(booking);
  } catch (error) {
    console.error('Failed to update lift booking status:', error);
    res.status(500).json({ error: 'failed_to_update_lift_booking' });
  }
});

// --- Audit Logs API ---

app.get('/api/audit-logs', requireAdmin, async (_req, res) => {
  try {
    if (!process.env.DATABASE_URL) {
      if (process.env.STRICT_DB === 'true') {
        return res.status(503).json({ error: 'database_unavailable' });
      }
      return res.json([]);
    }

    const logs = await prisma.auditLogEntry.findMany({
      orderBy: { createdAt: 'desc' },
      take: 500
    });
    res.json(logs);
  } catch (error) {
    console.error('Failed to list audit logs:', error);
    res.status(500).json({ error: 'failed_to_list_audit_logs' });
  }
});

// Catch-all 404 for API (must be last)
app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'not_found' });
});
