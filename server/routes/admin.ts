import { Router, Request, Response } from 'express';
import {
  findAdminByUsername,
  getAllOrders,
  updateOrderStatus,
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getStoreSettings,
  updateStoreSettings,
} from '../storeRepo';
import bcrypt from 'bcryptjs';

const router = Router();

// POST /api/admin/auth/login
router.post('/auth/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, error: 'ইউজারনেম ও পাসওয়ার্ড প্রদান করুন।' });
    }

    const admin = await findAdminByUsername(username);
    if (!admin) {
      return res.status(401).json({ success: false, error: 'ভুল ইউজারনেম অথবা পাসওয়ার্ড।' });
    }

    const isMatch = await bcrypt.compare(password, admin.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'ভুল ইউজারনেম অথবা পাসওয়ার্ড।' });
    }

    // Set cookie or session token simulation
    res.setHeader('Set-Cookie', `roxy_admin_session=active_${admin.id}; Path=/; HttpOnly; SameSite=Lax`);
    res.json({
      success: true,
      user: {
        id: admin.id,
        username: admin.username,
        name: admin.name,
        role: admin.role,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/admin/auth/me
router.get('/auth/me', async (req: Request, res: Response) => {
  const admin = await findAdminByUsername('admin');
  if (admin) {
    return res.json({
      authenticated: true,
      user: { id: admin.id, username: admin.username, name: admin.name, role: admin.role },
    });
  }
  res.json({ authenticated: false });
});

// POST /api/admin/auth/logout
router.post('/auth/logout', (_req: Request, res: Response) => {
  res.setHeader('Set-Cookie', 'roxy_admin_session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT');
  res.json({ success: true });
});

// GET /api/admin/orders
router.get('/orders', async (_req: Request, res: Response) => {
  try {
    const orders = await getAllOrders();
    res.json({ success: true, orders });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/admin/orders/:id
router.put('/orders/:id', async (req: Request, res: Response) => {
  try {
    const { status, note } = req.body;
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const updated = await updateOrderStatus(id, status, note);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    res.json({ success: true, order: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/admin/products
router.get('/products', async (_req: Request, res: Response) => {
  try {
    const result = await getProducts({ limit: 100 });
    res.json({ success: true, products: result.products });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/admin/products
router.post('/products', async (req: Request, res: Response) => {
  try {
    const product = await createProduct(req.body);
    res.json({ success: true, product });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/admin/products/:id
router.put('/products/:id', async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const updated = await updateProduct(Number(id), req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    res.json({ success: true, product: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/admin/products/:id
router.delete('/products/:id', async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    await deleteProduct(Number(id));
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/admin/settings
router.get('/settings', async (_req: Request, res: Response) => {
  try {
    const settings = await getStoreSettings();
    res.json({ success: true, settings });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/admin/settings
router.put('/settings', async (req: Request, res: Response) => {
  try {
    const updated = await updateStoreSettings(req.body);
    res.json({ success: true, settings: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
