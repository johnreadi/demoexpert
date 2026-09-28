const REQUIRED_PRODUCT_FIELDS = ['name', 'brand', 'model', 'category', 'condition', 'warranty', 'description'] as const;
const PRODUCT_CATEGORIES = new Set(['Mécanique', 'Électricité', 'Carrosserie', 'Autre']);
const PRODUCT_CONDITIONS = new Set(['Neuf', 'Bon état', 'Occasion']);

export type ProductValidationResult =
  | { ok: true; data: Record<string, unknown> }
  | { ok: false; error: string };

const trimmedString = (value: unknown) => String(value ?? '').trim();

export function validateProductInput(input: unknown, partial = false): ProductValidationResult {
  const source = input && typeof input === 'object' && !Array.isArray(input)
    ? input as Record<string, unknown>
    : {};

  const missing = REQUIRED_PRODUCT_FIELDS.filter(field =>
    (!partial || field in source) && !trimmedString(source[field])
  );
  if (!partial) {
    for (const field of REQUIRED_PRODUCT_FIELDS) {
      if (!(field in source) && !missing.includes(field)) missing.push(field);
    }
  }
  if (missing.length) return { ok: false, error: `missing_fields: ${missing.join(', ')}` };

  const data: Record<string, unknown> = {};
  for (const field of REQUIRED_PRODUCT_FIELDS) {
    if (field in source) data[field] = trimmedString(source[field]);
  }

  if ('year' in source || !partial) {
    const year = Number(source.year);
    if (!Number.isInteger(year) || year < 1900 || year > 2100) return { ok: false, error: 'invalid_year' };
    data.year = year;
  }

  if ('price' in source || !partial) {
    const price = Number(source.price);
    if (!Number.isFinite(price) || price < 0) return { ok: false, error: 'invalid_price' };
    data.price = price;
  }

  if ('category' in data && !PRODUCT_CATEGORIES.has(String(data.category))) {
    return { ok: false, error: 'invalid_category' };
  }
  if ('condition' in data && !PRODUCT_CONDITIONS.has(String(data.condition))) {
    return { ok: false, error: 'invalid_condition' };
  }

  if ('oemRef' in source) data.oemRef = trimmedString(source.oemRef);
  if ('compatibility' in source) data.compatibility = trimmedString(source.compatibility) || null;
  if ('images' in source) {
    if (!Array.isArray(source.images) || source.images.some(image => typeof image !== 'string')) {
      return { ok: false, error: 'invalid_images' };
    }
    data.images = source.images;
  }

  return { ok: true, data };
}
