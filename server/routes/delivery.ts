import { Router, Request, Response } from 'express';
import { getDistricts, calculateDeliveryCharge } from '../storeRepo';

const router = Router();

// GET /api/delivery/districts
router.get('/districts', (_req: Request, res: Response) => {
  res.json({ success: true, districts: getDistricts() });
});

// GET /api/delivery/calculate?districtId=1&subtotal=2500
router.get('/calculate', (req: Request, res: Response) => {
  const districtId = Number(req.query.districtId) || 1;
  const subtotal = Number(req.query.subtotal) || 0;
  const charge = calculateDeliveryCharge(districtId, subtotal);
  res.json({
    success: true,
    districtId,
    deliveryCharge: charge,
    isFree: charge === 0,
  });
});

export default router;
