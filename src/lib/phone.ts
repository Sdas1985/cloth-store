/**
 * Bangladeshi Phone Number Normalization and Validation
 */

export interface PhoneValidationResult {
  isValid: boolean;
  normalized: string; // Canonical format: 01XXXXXXXXX
  formatted: string;  // Formatted: +880 1XXX-XXXXXX
  operator?: string;
  error?: string;
}

const OPERATOR_PREFIXES: Record<string, string> = {
  '013': 'Grameenphone',
  '017': 'Grameenphone',
  '014': 'Banglalink',
  '019': 'Banglalink',
  '016': 'Robi / Airtel',
  '018': 'Robi',
  '015': 'Teletalk',
};

/**
 * Normalizes input string by stripping all non-digits, country code +88 / 88.
 * Returns 11-digit canonical Bangladeshi number: 01XXXXXXXXX
 */
export function normalizeBangladeshiPhone(input: string): string {
  if (!input) return '';

  // Remove whitespace, dashes, parens, plus, dots
  let cleaned = input.trim().replace(/[\s\-\(\)\+\.]/g, '');

  // Convert Bengali numerals to Western numerals if entered in Bengali digits
  const bengaliNumerals: Record<string, string> = {
    '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
    '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9',
  };
  cleaned = cleaned.replace(/[০-৯]/g, (digit) => bengaliNumerals[digit] || digit);

  // If starts with 880, strip the 88
  if (cleaned.startsWith('880') && cleaned.length >= 13) {
    cleaned = cleaned.substring(2);
  } else if (cleaned.startsWith('00880') && cleaned.length >= 15) {
    cleaned = cleaned.substring(4);
  }

  // If someone entered 1XXXXXXXXX (10 digits, missing initial 0)
  if (cleaned.length === 10 && cleaned.startsWith('1')) {
    cleaned = '0' + cleaned;
  }

  return cleaned;
}

export function validateBangladeshiPhone(input: string): PhoneValidationResult {
  const normalized = normalizeBangladeshiPhone(input);

  // Valid BD number regex: starts with 01, followed by 3, 4, 5, 6, 7, 8, 9, then 8 digits (total 11 digits)
  const bdPhoneRegex = /^01[3-9]\d{8}$/;

  if (!normalized) {
    return {
      isValid: false,
      normalized: '',
      formatted: '',
      error: 'মোবাইল নম্বর দেওয়া আবশ্যক (Mobile number is required)',
    };
  }

  if (!bdPhoneRegex.test(normalized)) {
    return {
      isValid: false,
      normalized,
      formatted: normalized,
      error: 'সঠিক ১১ ডিজিটের বাংলাদেশি মোবাইল নম্বর দিন (e.g. 017XXXXXXXX)',
    };
  }

  const prefix = normalized.substring(0, 3);
  const operator = OPERATOR_PREFIXES[prefix] || 'Mobile Operator';
  const formatted = `+880 ${normalized.substring(1, 4)}-${normalized.substring(4, 7)}${normalized.substring(7)}`;

  return {
    isValid: true,
    normalized,
    formatted,
    operator,
  };
}
