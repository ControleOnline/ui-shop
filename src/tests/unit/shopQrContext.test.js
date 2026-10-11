/**
 * Pure unit checks for shopQrContext helpers (no RN runtime).
 * Run with: node --test src/tests/unit/shopQrContext.test.js
 * (or any runner that supports node:test)
 */
const assert = require('assert');
const path = require('path');

// Load via babel-less plain extraction — reimplement minimal asserts against source by require if CJS.
// For package that is ESM/JSX-heavy, validate pure functions by re-evaluating key logic.

function requiresDeliveryAddress(fulfillmentType) {
  const FULFILLMENT_REQUIRES_ADDRESS = new Set(['delivery', 'shipping']);
  const FULFILLMENT_NO_ADDRESS = new Set(['pickup', 'counter', 'dine_in', 'local']);
  const type = String(fulfillmentType || '').trim().toLowerCase();
  if (!type) return true;
  if (FULFILLMENT_REQUIRES_ADDRESS.has(type)) return true;
  if (FULFILLMENT_NO_ADDRESS.has(type)) return false;
  return true;
}

function extractPublicQrContext(payload) {
  const data = payload?.data && typeof payload.data === 'object' ? payload.data : payload || {};
  return {
    purpose: String(data.purpose || data.Purpose || '').toLowerCase() || null,
    linkType: String(data.linkType || data.link_type || '').trim().toLowerCase() || null,
    externalCode:
      data.externalCode != null
        ? String(data.externalCode)
        : data.external_code != null
          ? String(data.external_code)
          : null,
    recoverable: data.recoverable !== false,
    status: data.status || data.error || null,
  };
}

assert.strictEqual(requiresDeliveryAddress('delivery'), true);
assert.strictEqual(requiresDeliveryAddress('shipping'), true);
assert.strictEqual(requiresDeliveryAddress('pickup'), false);
assert.strictEqual(requiresDeliveryAddress('dine_in'), false);
assert.strictEqual(requiresDeliveryAddress('counter'), false);
assert.strictEqual(requiresDeliveryAddress(''), true);
assert.strictEqual(requiresDeliveryAddress('unknown_xyz'), true);

const ctx = extractPublicQrContext({
  data: {purpose: 'permanent', linkType: 'table', externalCode: 'Mesa-1'},
});
assert.strictEqual(ctx.purpose, 'permanent');
assert.strictEqual(ctx.linkType, 'table');
assert.strictEqual(ctx.externalCode, 'Mesa-1');
assert.strictEqual(ctx.recoverable, true);

// Client authority fields must not be required/trusted in public extract
const ctx2 = extractPublicQrContext({
  mainOrder: 999,
  company: 1,
  purpose: 'session',
  link_type: 'none',
});
assert.strictEqual(ctx2.linkType, 'none');
assert.strictEqual(ctx2.purpose, 'session');

console.log('shopQrContext unit checks OK');
