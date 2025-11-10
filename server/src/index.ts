import express from 'express';
import session from 'express-session';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';

const app = express();

// Config
const PORT = Number(process.env.PORT || 8080);
const NODE_ENV = process.env.NODE_ENV || 'development';
const SESSION_SECRET = process.env.SESSION_SECRET || 'dev_session_secret_change_me';
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';
const TRUST_PROXY = process.env.TRUST_PROXY ? Number(process.env.TRUST_PROXY) : 0;
const COOKIE_SECURE = process.env.COOKIE_SECURE === 'true';
const COOKIE_SAME_SITE = (process.env.COOKIE_SAME_SITE as 'lax'|'strict'|'none') || 'lax';

app.set('trust proxy', TRUST_PROXY);

// Middlewares
app.use(helmet());
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
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
  },
}));

type UserSession = { id: string; name: string; email: string; role: 'Admin'|'Staff'; status: 'approved'|'pending' };

// Healthcheck
app.get('/healthz', (_req, res) => {
  res.status(200).json({ status: 'ok', env: NODE_ENV });
});

// Auth API
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

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ error: 'logout_failed' });
    res.clearCookie('connect.sid');
    return res.json({ success: true });
  });
});

// Products API
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

app.post('/api/products', async (req, res) => {
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

// 404 fallback for API
app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'not_found' });
});

app.listen(PORT, '0.0.0.0', () => {
  // eslint-disable-next-line no-console
  console.log(`API listening on 0.0.0.0:${PORT} (${NODE_ENV})`);
});
