import { queryOne } from './db';
import { StoreSettings } from './types';

export interface DeliveryCalculationResult {
  districtId: number;
  districtNameEn: string;
  districtNameBn: string;
  isChattogram: boolean;
  deliveryCharge: number;
  isFreeDelivery: boolean;
  freeDeliveryThreshold: number;
  ruleApplied: string;
}

export async function calculateDeliveryCharge(
  districtId: number,
  subtotal: number = 0
): Promise<DeliveryCalculationResult> {
  const settings = await queryOne<StoreSettings>('SELECT * FROM store_settings WHERE id = 1');
  const district = await queryOne<{
    id: number;
    name_en: string;
    name_bn: string;
    default_delivery_charge: number;
  }>('SELECT id, name_en, name_bn, default_delivery_charge FROM districts WHERE id = ?', [districtId]);

  const districtNameEn = district?.name_en || 'Dhaka';
  const districtNameBn = district?.name_bn || 'ঢাকা';
  const isChattogram = districtId === 1 || districtNameEn.toLowerCase().includes('chattogram');

  const freeThreshold = Number(settings?.free_delivery_threshold || 3000);

  // Check custom delivery rule for this specific district
  const specificRule = await queryOne<{
    delivery_charge: number;
    free_delivery_threshold?: number | null;
    title: string;
  }>('SELECT delivery_charge, free_delivery_threshold, title FROM delivery_rules WHERE district_id = ? AND is_active = 1', [districtId]);

  let charge = 150;
  let ruleTitle = 'Nationwide Standard Delivery';

  if (specificRule) {
    charge = Number(specificRule.delivery_charge);
    ruleTitle = specificRule.title;
  } else if (isChattogram) {
    charge = Number(settings?.default_delivery_chattogram || 80);
    ruleTitle = 'Chattogram City & District Delivery';
  } else {
    charge = Number(settings?.default_delivery_national || 150);
    ruleTitle = 'Nationwide Standard Delivery';
  }

  // Check free delivery threshold
  const isFree = subtotal >= freeThreshold && freeThreshold > 0;
  if (isFree) {
    return {
      districtId,
      districtNameEn,
      districtNameBn,
      isChattogram,
      deliveryCharge: 0,
      isFreeDelivery: true,
      freeDeliveryThreshold: freeThreshold,
      ruleApplied: `${ruleTitle} (Free Delivery on BDT ${freeThreshold}+ orders)`,
    };
  }

  return {
    districtId,
    districtNameEn,
    districtNameBn,
    isChattogram,
    deliveryCharge: charge,
    isFreeDelivery: false,
    freeDeliveryThreshold: freeThreshold,
    ruleApplied: ruleTitle,
  };
}
