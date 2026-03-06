import express from 'express';
import { ProductModel } from '../models/index.js';
import { UserModel } from '../models/index.js';
import { AuditLogModel } from '../models/index.js';
import type { ApiResponse, Product } from '../types/index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Récupérer tous les produits avec filtres optionnels
router.get('/', async (req, res) => {
  try {
    const { category, brand, model, limit, offset } = req.query;

    const filters: any = {};
    if (category) filters.category = category;
    if (brand) filters.brand = brand;
    if (model) filters.model = model;
    if (limit) filters.limit = parseInt(limit as string);
    if (offset) filters.offset = parseInt(offset as string);

    const products = await ProductModel.findAll(filters);

    res.json({
      success: true,
      data: products
    } as ApiResponse<Product[]>);

  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur lors de la récupération des produits'
    } as ApiResponse);
  }
});

// Récupérer un produit par ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const product = await ProductModel.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Produit non trouvé'
      } as ApiResponse);
    }

    // Récupérer les images du produit
    const images = await ProductModel.getImages(id);
    (product as any).images = images;

    res.json({
      success: true,
      data: product
    } as ApiResponse<Product>);

  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur lors de la récupération du produit'
    } as ApiResponse);
  }
});

// Créer un nouveau produit (admin uniquement)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const user = await UserModel.findById(userId);

    if (!user || user.role !== 'Admin') {
      return res.status(403).json({
        success: false,
        error: 'Accès non autorisé'
      } as ApiResponse);
    }

    const productData = req.body;
    const newProduct = await ProductModel.create(productData);

    // Log de l'activité
    await AuditLogModel.create({
      user_id: userId,
      user_name: user.name,
      action: 'PRODUCT_CREATE',
      details: `Nouveau produit créé: ${newProduct.name}`,
      ip_address: req.ip,
      user_agent: req.get('User-Agent')
    });

    res.status(201).json({
      success: true,
      message: 'Produit créé avec succès',
      data: newProduct
    } as ApiResponse<Product>);

  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur lors de la création du produit'
    } as ApiResponse);
  }
});

// Mettre à jour un produit (admin uniquement)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const user = await UserModel.findById(userId);

    if (!user || user.role !== 'Admin') {
      return res.status(403).json({
        success: false,
        error: 'Accès non autorisé'
      } as ApiResponse);
    }

    const { id } = req.params;
    const productData = req.body;
    const updatedProduct = await ProductModel.update(id, productData);

    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        error: 'Produit non trouvé'
      } as ApiResponse);
    }

    // Log de l'activité
    await AuditLogModel.create({
      user_id: userId,
      user_name: user.name,
      action: 'PRODUCT_UPDATE',
      details: `Produit mis à jour: ${updatedProduct.name}`,
      ip_address: req.ip,
      user_agent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'Produit mis à jour avec succès',
      data: updatedProduct
    } as ApiResponse<Product>);

  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur lors de la mise à jour du produit'
    } as ApiResponse);
  }
});

// Supprimer un produit (admin uniquement)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const user = await UserModel.findById(userId);

    if (!user || user.role !== 'Admin') {
      return res.status(403).json({
        success: false,
        error: 'Accès non autorisé'
      } as ApiResponse);
    }

    const { id } = req.params;
    const product = await ProductModel.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Produit non trouvé'
      } as ApiResponse);
    }

    const deleted = await ProductModel.delete(id);

    if (!deleted) {
      return res.status(500).json({
        success: false,
        error: 'Erreur lors de la suppression du produit'
      } as ApiResponse);
    }

    // Log de l'activité
    await AuditLogModel.create({
      user_id: userId,
      user_name: user.name,
      action: 'PRODUCT_DELETE',
      details: `Produit supprimé: ${product.name}`,
      ip_address: req.ip,
      user_agent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'Produit supprimé avec succès'
    } as ApiResponse);

  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur lors de la suppression du produit'
    } as ApiResponse);
  }
});

// Ajouter une image à un produit (admin uniquement)
router.post('/:id/images', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const user = await UserModel.findById(userId);

    if (!user || user.role !== 'Admin') {
      return res.status(403).json({
        success: false,
        error: 'Accès non autorisé'
      } as ApiResponse);
    }

    const { id } = req.params;
    const { imageUrl, isPrimary } = req.body;

    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        error: 'URL de l\'image requise'
      } as ApiResponse);
    }

    const product = await ProductModel.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Produit non trouvé'
      } as ApiResponse);
    }

    const image = await ProductModel.addImage(id, imageUrl, isPrimary || false);

    // Log de l'activité
    await AuditLogModel.create({
      user_id: userId,
      user_name: user.name,
      action: 'PRODUCT_ADD_IMAGE',
      details: `Image ajoutée au produit: ${product.name}`,
      ip_address: req.ip,
      user_agent: req.get('User-Agent')
    });

    res.status(201).json({
      success: true,
      message: 'Image ajoutée avec succès',
      data: image
    } as ApiResponse);

  } catch (error) {
    console.error('Add product image error:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur lors de l\'ajout de l\'image'
    } as ApiResponse);
  }
});

export default router;
