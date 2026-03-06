import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/index.js';
import { SettingsModel } from '../models/index.js';
import { AuditLogModel } from '../models/index.js';
import type { ApiResponse, LoginRequest, RegisterRequest, AuthResponse, User } from '../types/index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_here';
const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '12');

export class AuthController {
  static async login(req: Request<{}, ApiResponse<AuthResponse>, LoginRequest>, res: Response<ApiResponse<AuthResponse>>) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: 'Email et mot de passe requis'
        });
      }

      const user = await UserModel.findByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Email ou mot de passe incorrect'
        });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          error: 'Email ou mot de passe incorrect'
        });
      }

      // Vérifier le statut de l'utilisateur
      if (user.status !== 'approved') {
        return res.status(403).json({
          success: false,
          error: 'Compte en attente de validation'
        });
      }

      // Générer le token JWT
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      );

      // Log de l'activité
      await AuditLogModel.create({
        user_id: user.id,
        user_name: user.name,
        action: 'USER_LOGIN',
        details: `Connexion réussie pour ${user.email}`,
        ip_address: req.ip,
        user_agent: req.get('User-Agent')
      });

      const { password: _, ...userWithoutPassword } = user;

      res.json({
        success: true,
        data: {
          user: userWithoutPassword,
          token
        }
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur serveur lors de la connexion'
      });
    }
  }

  static async register(req: Request<{}, ApiResponse<{ success: boolean }>, RegisterRequest>, res: Response<ApiResponse<{ success: boolean }>>) {
    try {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({
          success: false,
          error: 'Tous les champs sont requis'
        });
      }

      // Vérifier si l'utilisateur existe déjà
      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          error: 'Un utilisateur avec cet email existe déjà'
        });
      }

      // Hasher le mot de passe
      const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

      // Créer l'utilisateur
      const newUser = await UserModel.create({
        name,
        email,
        password: hashedPassword,
        role: 'Staff',
        status: 'pending'
      });

      // Log de l'activité
      await AuditLogModel.create({
        user_id: newUser.id,
        user_name: newUser.name,
        action: 'USER_REGISTER',
        details: `Nouvelle inscription: ${email}`,
        ip_address: req.ip,
        user_agent: req.get('User-Agent')
      });

      res.status(201).json({
        success: true,
        message: 'Inscription réussie. Votre compte est en attente de validation.',
        data: { success: true }
      });

    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur serveur lors de l\'inscription'
      });
    }
  }

  static async getProfile(req: Request, res: Response<ApiResponse<User>>) {
    try {
      const userId = (req as any).userId;
      const user = await UserModel.findById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'Utilisateur non trouvé'
        });
      }

      const { password: _, ...userWithoutPassword } = user;

      res.json({
        success: true,
        data: userWithoutPassword
      });

    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur serveur lors de la récupération du profil'
      });
    }
  }

  static async updateProfile(req: Request<{}, ApiResponse<User>, { name: string; email: string }>, res: Response<ApiResponse<User>>) {
    try {
      const userId = (req as any).userId;
      const { name, email } = req.body;

      if (!name || !email) {
        return res.status(400).json({
          success: false,
          error: 'Nom et email requis'
        });
      }

      // Vérifier si l'email est déjà utilisé par un autre utilisateur
      const existingUser = await UserModel.findByEmail(email);
      if (existingUser && existingUser.id !== userId) {
        return res.status(409).json({
          success: false,
          error: 'Cet email est déjà utilisé'
        });
      }

      const updatedUser = await UserModel.update(userId, { name, email });

      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          error: 'Utilisateur non trouvé'
        });
      }

      // Log de l'activité
      await AuditLogModel.create({
        user_id: userId,
        user_name: updatedUser.name,
        action: 'USER_UPDATE_PROFILE',
        details: `Mise à jour du profil: ${email}`,
        ip_address: req.ip,
        user_agent: req.get('User-Agent')
      });

      const { password: _, ...userWithoutPassword } = updatedUser;

      res.json({
        success: true,
        message: 'Profil mis à jour avec succès',
        data: userWithoutPassword
      });

    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur serveur lors de la mise à jour du profil'
      });
    }
  }

  static async changePassword(req: Request<{}, ApiResponse<{ success: boolean }>, { currentPassword: string; newPassword: string }>, res: Response<ApiResponse<{ success: boolean }>>) {
    try {
      const userId = (req as any).userId;
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          error: 'Mot de passe actuel et nouveau mot de passe requis'
        });
      }

      const user = await UserModel.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'Utilisateur non trouvé'
        });
      }

      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          success: false,
          error: 'Mot de passe actuel incorrect'
        });
      }

      const hashedNewPassword = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
      await UserModel.update(userId, { password: hashedNewPassword });

      // Log de l'activité
      await AuditLogModel.create({
        user_id: userId,
        user_name: user.name,
        action: 'USER_CHANGE_PASSWORD',
        details: 'Mot de passe changé',
        ip_address: req.ip,
        user_agent: req.get('User-Agent')
      });

      res.json({
        success: true,
        message: 'Mot de passe changé avec succès'
      });

    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur serveur lors du changement de mot de passe'
      });
    }
  }
}

export class SettingsController {
  static async getAllSettings(req: Request, res: Response<ApiResponse<any>>) {
    try {
      const settings = await SettingsModel.getAll();

      // Convertir les valeurs JSON en objets
      const formattedSettings = settings.reduce((acc, setting) => {
        acc[setting.setting_key] = JSON.parse(setting.setting_value);
        return acc;
      }, {});

      res.json({
        success: true,
        data: formattedSettings
      });

    } catch (error) {
      console.error('Get settings error:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur serveur lors de la récupération des paramètres'
      });
    }
  }

  static async getSetting(req: Request<{ key: string }>, res: Response<ApiResponse<any>>) {
    try {
      const { key } = req.params;
      const setting = await SettingsModel.getByKey(key);

      if (!setting) {
        return res.status(404).json({
          success: false,
          error: 'Paramètre non trouvé'
        });
      }

      res.json({
        success: true,
        data: JSON.parse(setting.setting_value)
      });

    } catch (error) {
      console.error('Get setting error:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur serveur lors de la récupération du paramètre'
      });
    }
  }

  static async updateSetting(req: Request<{ key: string }, ApiResponse<any>, any>, res: Response<ApiResponse<any>>) {
    try {
      const { key } = req.params;
      const { value } = req.body;

      if (value === undefined) {
        return res.status(400).json({
          success: false,
          error: 'Valeur requise'
        });
      }

      const updatedSetting = await SettingsModel.set(key, value);

      // Log de l'activité
      const userId = (req as any).userId;
      const user = await UserModel.findById(userId);
      await AuditLogModel.create({
        user_id: userId,
        user_name: user?.name || 'Unknown',
        action: 'SETTINGS_UPDATE',
        details: `Paramètre mis à jour: ${key}`,
        ip_address: req.ip,
        user_agent: req.get('User-Agent')
      });

      res.json({
        success: true,
        message: 'Paramètre mis à jour avec succès',
        data: JSON.parse(updatedSetting.setting_value)
      });

    } catch (error) {
      console.error('Update setting error:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur serveur lors de la mise à jour du paramètre'
      });
    }
  }
}
