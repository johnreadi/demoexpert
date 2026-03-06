/**
 * Configuration spécifique pour o2Switch
 * Version JavaScript pure (compatible avec environnement o2Switch)
 */

// Configuration o2Switch
const isO2Switch = typeof process !== 'undefined' && process.env && process.env.CPANEL_USER !== undefined;

const config = {
  // Port o2Switch (généralement 3001)
  port: (typeof process !== 'undefined' && process.env && process.env.PORT)
    ? parseInt(process.env.PORT, 10) || 3001
    : 3001,

  // Base de données
  database: {
    host: (typeof process !== 'undefined' && process.env && process.env.DB_HOST) || 'localhost',
    port: (typeof process !== 'undefined' && process.env && process.env.DB_PORT)
      ? parseInt(process.env.DB_PORT, 10) || 3306
      : 3306,
    name: (typeof process !== 'undefined' && process.env && process.env.DB_NAME) || 'demolition_expert',
    user: (typeof process !== 'undefined' && process.env && process.env.DB_USER) || 'demolition_user',
    password: (typeof process !== 'undefined' && process.env && process.env.DB_PASSWORD) || ''
  },

  // JWT
  jwt: {
    secret: (typeof process !== 'undefined' && process.env && process.env.JWT_SECRET) || 'your_jwt_secret_here',
    expiresIn: (typeof process !== 'undefined' && process.env && process.env.JWT_EXPIRES_IN) || '24h'
  },

  // CORS - Configuration spécifique o2Switch
  cors: {
    origin: function (origin, callback) {
      // Autoriser les requêtes sans origin (mobile apps, etc.)
      if (!origin) return callback(null, true);

      const allowedOrigins = [
        (typeof process !== 'undefined' && process.env && process.env.FRONTEND_URL) || 'http://localhost:3000',
        'https://localhost:3000',
        'http://127.0.0.1:3000',
        'https://127.0.0.1:3000'
      ];

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  },

  // Rate limiting - Optimisé pour o2Switch
  rateLimit: {
    windowMs: (typeof process !== 'undefined' && process.env && process.env.RATE_LIMIT_WINDOW_MS)
      ? parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10)
      : 600000, // 10 minutes
    max: (typeof process !== 'undefined' && process.env && process.env.RATE_LIMIT_MAX_REQUESTS)
      ? parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10)
      : 50, // 50 requêtes par fenêtre
    message: {
      success: false,
      error: 'Trop de requêtes. Veuillez réessayer dans quelques minutes.',
      retryAfter: '10 minutes'
    },
    skip: (req) => {
      // Ne pas limiter les health checks
      return req && req.path === '/api/health';
    }
  },

  // Sécurité - Headers optimisés pour o2Switch
  helmet: {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:", "https://picsum.photos"],
        connectSrc: ["'self'", "https:"]
      }
    },
    crossOriginEmbedderPolicy: false
  },

  // Uploads - Configuration o2Switch
  uploads: {
    dest: (typeof __dirname !== 'undefined' ? __dirname : '.') + '/uploads',
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB max par fichier
      files: 10 // 10 fichiers max
    },
    allowedTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp'
    ]
  },

  // Logs - Configuration pour o2Switch
  logs: {
    level: (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'production') ? 'warn' : 'info',
    format: 'combined',
    directory: (typeof __dirname !== 'undefined' ? __dirname : '.') + '/logs'
  },

  // Optimisations pour l'environnement mutualisé o2Switch
  optimizations: {
    // Limiter la mémoire utilisée
    maxMemory: '256m',

    // Pool de connexions MySQL réduit
    dbPool: {
      min: 0,
      max: 5, // Réduit pour l'environnement mutualisé
      acquire: 30000,
      idle: 10000
    },

    // Cache des templates
    viewCache: true,

    // Compression
    compression: true,

    // Trust proxy (nécessaire derrière le reverse proxy o2Switch)
    trustProxy: true
  }
};

// Configuration CORS spécifique o2Switch
const corsOptions = {
  origin: config.cors.origin,
  credentials: config.cors.credentials,
  methods: config.cors.methods,
  allowedHeaders: config.cors.allowedHeaders,
  optionsSuccessStatus: 200 // Support legacy browsers
};

// Middleware de sécurité adapté à o2Switch
const helmetConfig = {
  ...config.helmet,
  // Désactiver certaines protections qui peuvent causer des problèmes
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  xssFilter: true,
  // Frameguard désactivé pour les iframes si nécessaire
  frameguard: false
};

export {
  config,
  corsOptions,
  helmetConfig,
  isO2Switch
};

export default config;
