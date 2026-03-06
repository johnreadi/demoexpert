import pool from '../config/database.js';
import type {
  User, Product, Auction, Bid, LiftRentalBooking, AdminMessage,
  Contact, AuditLogEntry, SiteSettings, BlogPost, QuoteRequest,
  ScrapRemovalRequest, BuybackRequest, WindshieldRequest, PartCategory
} from '../types/index.js';

export class UserModel {
  static async findById(id: string): Promise<User | null> {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );
    return (rows as User[])[0] || null;
  }

  static async findByEmail(email: string): Promise<User | null> {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return (rows as User[])[0] || null;
  }

  static async create(userData: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password, role, status) VALUES (?, ?, ?, ?, ?)',
      [userData.name, userData.email, userData.password, userData.role, userData.status]
    );
    const insertId = (result as any).insertId;
    return await this.findById(insertId);
  }

  static async update(id: string, userData: Partial<Omit<User, 'id' | 'created_at'>>): Promise<User | null> {
    const fields = Object.keys(userData);
    const values = Object.values(userData);

    if (fields.length === 0) return null;

    const setClause = fields.map(field => `${field} = ?`).join(', ');
    values.push(id);

    await pool.execute(
      `UPDATE users SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      values
    );

    return await this.findById(id);
  }

  static async delete(id: string): Promise<boolean> {
    const [result] = await pool.execute('DELETE FROM users WHERE id = ?', [id]);
    return (result as any).affectedRows > 0;
  }

  static async findAll(filters?: { role?: string; status?: string }): Promise<User[]> {
    let query = 'SELECT * FROM users';
    const params: any[] = [];

    if (filters) {
      const conditions: string[] = [];
      if (filters.role) {
        conditions.push('role = ?');
        params.push(filters.role);
      }
      if (filters.status) {
        conditions.push('status = ?');
        params.push(filters.status);
      }

      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }
    }

    query += ' ORDER BY created_at DESC';

    const [rows] = await pool.execute(query, params);
    return rows as User[];
  }
}

export class ProductModel {
  static async findById(id: string): Promise<Product | null> {
    const [rows] = await pool.execute(
      'SELECT * FROM products WHERE id = ?',
      [id]
    );
    return (rows as Product[])[0] || null;
  }

  static async findAll(filters?: {
    category?: string;
    brand?: string;
    model?: string;
    isActive?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<Product[]> {
    let query = 'SELECT * FROM products WHERE 1=1';
    const params: any[] = [];

    if (filters) {
      if (filters.category) {
        query += ' AND category_id = ?';
        params.push(filters.category);
      }
      if (filters.brand) {
        query += ' AND brand LIKE ?';
        params.push(`%${filters.brand}%`);
      }
      if (filters.model) {
        query += ' AND model LIKE ?';
        params.push(`%${filters.model}%`);
      }
      if (filters.isActive !== undefined) {
        query += ' AND is_active = ?';
        params.push(filters.isActive);
      }
    }

    query += ' ORDER BY created_at DESC';

    if (filters?.limit) {
      query += ' LIMIT ?';
      params.push(filters.limit);
      if (filters.offset) {
        query += ' OFFSET ?';
        params.push(filters.offset);
      }
    }

    const [rows] = await pool.execute(query, params);
    return rows as Product[];
  }

  static async create(productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> {
    const [result] = await pool.execute(
      'INSERT INTO products (name, oem_ref, brand, model, year, category_id, price, condition, warranty, compatibility, description, stock_quantity, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        productData.name,
        productData.oem_ref,
        productData.brand,
        productData.model,
        productData.year,
        productData.category_id,
        productData.price,
        productData.condition,
        productData.warranty,
        productData.compatibility,
        productData.description,
        productData.stock_quantity,
        productData.is_active
      ]
    );
    const insertId = (result as any).insertId;
    return await this.findById(insertId);
  }

  static async update(id: string, productData: Partial<Omit<Product, 'id' | 'created_at'>>): Promise<Product | null> {
    const fields = Object.keys(productData);
    const values = Object.values(productData);

    if (fields.length === 0) return null;

    const setClause = fields.map(field => `${field} = ?`).join(', ');
    values.push(id);

    await pool.execute(
      `UPDATE products SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      values
    );

    return await this.findById(id);
  }

  static async delete(id: string): Promise<boolean> {
    const [result] = await pool.execute('DELETE FROM products WHERE id = ?', [id]);
    return (result as any).affectedRows > 0;
  }

  static async getImages(productId: string): Promise<any[]> {
    const [rows] = await pool.execute(
      'SELECT * FROM product_images WHERE product_id = ? ORDER BY sort_order, created_at',
      [productId]
    );
    return rows as any[];
  }

  static async addImage(productId: string, imageUrl: string, isPrimary: boolean = false): Promise<any> {
    // Si c'est l'image principale, retirer le statut principal des autres images
    if (isPrimary) {
      await pool.execute(
        'UPDATE product_images SET is_primary = FALSE WHERE product_id = ?',
        [productId]
      );
    }

    const [result] = await pool.execute(
      'INSERT INTO product_images (product_id, image_url, is_primary) VALUES (?, ?, ?)',
      [productId, imageUrl, isPrimary]
    );

    const insertId = (result as any).insertId;
    const [rows] = await pool.execute('SELECT * FROM product_images WHERE id = ?', [insertId]);
    return (rows as any[])[0];
  }
}

export class AuctionModel {
  static async findById(id: string): Promise<Auction | null> {
    const [rows] = await pool.execute(
      'SELECT * FROM auctions WHERE id = ?',
      [id]
    );
    return (rows as Auction[])[0] || null;
  }

  static async findAll(filters?: { isActive?: boolean; limit?: number }): Promise<Auction[]> {
    let query = 'SELECT * FROM auctions WHERE 1=1';
    const params: any[] = [];

    if (filters?.isActive !== undefined) {
      query += ' AND is_active = ?';
      params.push(filters.isActive);
    }

    query += ' ORDER BY end_date ASC';

    if (filters?.limit) {
      query += ' LIMIT ?';
      params.push(filters.limit);
    }

    const [rows] = await pool.execute(query, params);
    return rows as Auction[];
  }

  static async create(auctionData: Omit<Auction, 'id' | 'created_at' | 'updated_at' | 'current_bid' | 'bid_count'>): Promise<Auction> {
    const [result] = await pool.execute(
      'INSERT INTO auctions (vehicle_name, vehicle_brand, vehicle_model, vehicle_year, vehicle_mileage, vehicle_description, starting_price, end_date, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        auctionData.vehicle_name,
        auctionData.vehicle_brand,
        auctionData.vehicle_model,
        auctionData.vehicle_year,
        auctionData.vehicle_mileage,
        auctionData.vehicle_description,
        auctionData.starting_price,
        auctionData.end_date,
        auctionData.is_active
      ]
    );
    const insertId = (result as any).insertId;
    return await this.findById(insertId);
  }

  static async update(id: string, auctionData: Partial<Omit<Auction, 'id' | 'created_at'>>): Promise<Auction | null> {
    const fields = Object.keys(auctionData);
    const values = Object.values(auctionData);

    if (fields.length === 0) return null;

    const setClause = fields.map(field => `${field} = ?`).join(', ');
    values.push(id);

    await pool.execute(
      `UPDATE auctions SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      values
    );

    return await this.findById(id);
  }

  static async delete(id: string): Promise<boolean> {
    const [result] = await pool.execute('DELETE FROM auctions WHERE id = ?', [id]);
    return (result as any).affectedRows > 0;
  }

  static async getBids(auctionId: string): Promise<Bid[]> {
    const [rows] = await pool.execute(
      'SELECT * FROM bids WHERE auction_id = ? ORDER BY timestamp DESC',
      [auctionId]
    );
    return rows as Bid[];
  }

  static async addBid(auctionId: string, userId: string, bidderName: string, amount: number): Promise<Bid> {
    const [result] = await pool.execute(
      'INSERT INTO bids (auction_id, user_id, bidder_name, amount) VALUES (?, ?, ?, ?)',
      [auctionId, userId, bidderName, amount]
    );

    const insertId = (result as any).insertId;
    const [rows] = await pool.execute('SELECT * FROM bids WHERE id = ?', [insertId]);
    return (rows as Bid[])[0];
  }

  static async updateBidStats(auctionId: string, currentBid: number, bidCount: number): Promise<void> {
    await pool.execute(
      'UPDATE auctions SET current_bid = ?, bid_count = ? WHERE id = ?',
      [currentBid, bidCount, auctionId]
    );
  }
}

export class SettingsModel {
  static async getAll(): Promise<SiteSettings[]> {
    const [rows] = await pool.execute('SELECT * FROM site_settings ORDER BY setting_key');
    return rows as SiteSettings[];
  }

  static async getByKey(key: string): Promise<SiteSettings | null> {
    const [rows] = await pool.execute(
      'SELECT * FROM site_settings WHERE setting_key = ?',
      [key]
    );
    return (rows as SiteSettings[])[0] || null;
  }

  static async set(key: string, value: any): Promise<SiteSettings> {
    const [result] = await pool.execute(
      'INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?, updated_at = CURRENT_TIMESTAMP',
      [key, JSON.stringify(value), JSON.stringify(value)]
    );

    return await this.getByKey(key);
  }

  static async delete(key: string): Promise<boolean> {
    const [result] = await pool.execute('DELETE FROM site_settings WHERE setting_key = ?', [key]);
    return (result as any).affectedRows > 0;
  }
}

export class ContactModel {
  static async create(contactData: Omit<Contact, 'id' | 'created_at'>): Promise<Contact> {
    const [result] = await pool.execute(
      'INSERT INTO contacts (name, email, source) VALUES (?, ?, ?)',
      [contactData.name, contactData.email, contactData.source]
    );

    const insertId = (result as any).insertId;
    const [rows] = await pool.execute('SELECT * FROM contacts WHERE id = ?', [insertId]);
    return (rows as Contact[])[0];
  }

  static async findAll(): Promise<Contact[]> {
    const [rows] = await pool.execute('SELECT * FROM contacts ORDER BY created_at DESC');
    return rows as Contact[];
  }
}

export class AuditLogModel {
  static async create(logData: Omit<AuditLogEntry, 'id' | 'timestamp'>): Promise<AuditLogEntry> {
    const [result] = await pool.execute(
      'INSERT INTO audit_logs (user_id, user_name, action, details, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?)',
      [logData.user_id, logData.user_name, logData.action, logData.details, logData.ip_address, logData.user_agent]
    );

    const insertId = (result as any).insertId;
    const [rows] = await pool.execute('SELECT * FROM audit_logs WHERE id = ?', [insertId]);
    return (rows as AuditLogEntry[])[0];
  }

  static async findAll(limit: number = 100): Promise<AuditLogEntry[]> {
    const [rows] = await pool.execute(
      'SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT ?',
      [limit]
    );
    return rows as AuditLogEntry[];
  }
}
