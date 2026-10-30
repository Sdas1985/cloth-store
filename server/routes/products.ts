import { Router, Request, Response } from 'express';
import { getProducts, getProductBySlug } from '../storeRepo';

const router = Router();

// GET /api/products
router.get('/', async (req: Request, res: Response) => {
  try {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      sortBy,
      featured,
      bestseller,
      newArrival,
      page,
      limit,
    } = req.query;

    const result = await getProducts({
      search: search ? String(search) : undefined,
      categorySlug: category ? String(category) : undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      sortBy: sortBy as any,
      featured: featured === 'true' ? true : featured === 'false' ? false : undefined,
      bestseller: bestseller === 'true' ? true : bestseller === 'false' ? false : undefined,
      newArrival: newArrival === 'true' ? true : newArrival === 'false' ? false : undefined,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 12,
    });

    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/products/:slug
router.get('/:slug', async (req: Request, res: Response) => {
  try {
    const slug = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug;
    const product = await getProductBySlug(slug);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    res.json({ success: true, product });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
