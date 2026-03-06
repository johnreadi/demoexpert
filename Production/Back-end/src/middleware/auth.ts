import jwt from 'jsonwebtoken';
import { UserModel } from '../models/index.js';
import type { Request, Response, NextFunction } from 'express';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_here';

export interface AuthenticatedRequest extends Request {
  userId?: string;
  userRole?: string;
  userEmail?: string;
}

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Token d\'authentification requis'
      });
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;

    if (!decoded.userId) {
      res.status(401).json({
        success: false,
        error: 'Token invalide'
      });
      return;
    }

    // Vérifier que l'utilisateur existe toujours
    const user = await UserModel.findById(decoded.userId);
    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Utilisateur non trouvé'
      });
      return;
    }

    // Ajouter les informations de l'utilisateur à la requête
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    req.userEmail = decoded.email;

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        error: 'Token invalide'
      });
    } else if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        error: 'Token expiré'
      });
    } else {
      console.error('Auth middleware error:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur serveur lors de l\'authentification'
      });
    }
  }
};

export const requireAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.userRole || req.userRole !== 'Admin') {
    res.status(403).json({
      success: false,
      error: 'Accès administrateur requis'
    });
    return;
  }
  next();
};

export const requireStaff = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.userRole || (req.userRole !== 'Admin' && req.userRole !== 'Staff')) {
    res.status(403).json({
      success: false,
      error: 'Accès staff ou administrateur requis'
    });
    return;
  }
  next();
};
