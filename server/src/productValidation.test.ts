import assert from 'node:assert/strict';
import test from 'node:test';
import { validateProductInput } from './productValidation';

const validProduct = {
  name: 'Alternateur',
  brand: 'Renault',
  model: 'Clio',
  year: 2020,
  category: 'Mécanique',
  price: 75.5,
  condition: 'Occasion',
  warranty: '3 mois',
  compatibility: '',
  images: ['https://example.com/image.jpg'],
  description: 'Pièce testée',
};

test('normalise une pièce valide', () => {
  const result = validateProductInput({ ...validProduct, name: '  Alternateur  ' });
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.data.name, 'Alternateur');
    assert.equal(result.data.compatibility, null);
    assert.equal(result.data.price, 75.5);
  }
});

test('retourne les champs obligatoires manquants', () => {
  const result = validateProductInput({ ...validProduct, description: '' });
  assert.deepEqual(result, { ok: false, error: 'missing_fields: description' });
});

test('refuse une année et un prix invalides', () => {
  assert.deepEqual(validateProductInput({ ...validProduct, year: 1800 }), { ok: false, error: 'invalid_year' });
  assert.deepEqual(validateProductInput({ ...validProduct, price: -1 }), { ok: false, error: 'invalid_price' });
});

test('refuse une catégorie, un état ou des images invalides', () => {
  assert.deepEqual(validateProductInput({ ...validProduct, category: 'Inconnue' }), { ok: false, error: 'invalid_category' });
  assert.deepEqual(validateProductInput({ ...validProduct, condition: 'Cassée' }), { ok: false, error: 'invalid_condition' });
  assert.deepEqual(validateProductInput({ ...validProduct, images: [42] }), { ok: false, error: 'invalid_images' });
});

test('valide uniquement les champs présents pendant une modification', () => {
  assert.deepEqual(validateProductInput({ price: 20 }, true), { ok: true, data: { price: 20 } });
  assert.deepEqual(validateProductInput({ name: '' }, true), { ok: false, error: 'missing_fields: name' });
});
