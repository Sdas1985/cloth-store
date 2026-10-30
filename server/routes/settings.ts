import { Router, Request, Response } from 'express';
import { getStoreSettings, updateStoreSettings } from '../storeRepo';

const router = Router();

// GET /api/settings
router.get('/', async (_req: Request, res: Response) => {
  try {
    const settings = await getStoreSettings();
    res.json({ success: true, settings });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/settings (Protected/admin)
router.put('/', async (req: Request, res: Response) => {
  try {
    const updated = await updateStoreSettings(req.body);
    res.json({ success: true, settings: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
