const test = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('bcryptjs');
const { parseOrderLines, priceOrder, OrderValidationError } = require('../src/lib/order-pricing');
const { bootstrapAdmin, validateAdminPassword } = require('../src/lib/admin-bootstrap');
const { requireJwtSecret } = require('../src/config/env');

const menu = [
  { id: 1, name_al: 'Espresso', price: '2.00', is_available: 1 },
  { id: 2, name_al: 'Negroni', price: '8.10', is_available: 1 },
  { id: 3, name_al: 'Tiramisu', price: '5.00', is_available: 0 },
];

test('order total comes from database prices, not the client', () => {
  const lines = parseOrderLines([
    { menu_item_id: 1, quantity: 2, price: 0.01, name: 'cheap' },
    { menu_item_id: 2, quantity: 3, price: 0 },
  ]);
  const order = priceOrder(lines, menu);
  assert.equal(order.total, 28.3); // 2 x 2.00 + 3 x 8.10, summed in cents
  assert.deepEqual(order.items.map((i) => [i.name, i.unitPrice]), [['Espresso', 2], ['Negroni', 8.1]]);
});

test('duplicate cart lines are merged', () => {
  const lines = parseOrderLines([{ menu_item_id: 1, quantity: 1 }, { menu_item_id: '1', quantity: 2 }]);
  assert.deepEqual(lines, [{ menuItemId: 1, quantity: 3 }]);
});

test('invalid quantities and ids are rejected', () => {
  for (const items of [
    [],
    'x',
    [{ menu_item_id: 1, quantity: 0 }],
    [{ menu_item_id: 1, quantity: -2 }],
    [{ menu_item_id: 1, quantity: 1.5 }],
    [{ menu_item_id: 'abc', quantity: 1 }],
    [{ menu_item_id: 1, quantity: 51 }],
  ]) {
    assert.throws(() => parseOrderLines(items), OrderValidationError, JSON.stringify(items));
  }
});

test('unknown or unavailable items are rejected', () => {
  assert.throws(() => priceOrder([{ menuItemId: 99, quantity: 1 }], menu), OrderValidationError);
  assert.throws(() => priceOrder([{ menuItemId: 3, quantity: 1 }], menu), OrderValidationError);
});

test('admin passwords must be long and not a published default', () => {
  assert.ok(validateAdminPassword('short'));
  assert.ok(validateAdminPassword('admin123'));
  assert.equal(validateAdminPassword('a-long-unique-passphrase'), null);
});

const fakePool = (rows) => {
  const queries = [];
  return {
    queries,
    async query(sql, params) {
      queries.push([sql, params]);
      if (sql.startsWith('SELECT')) return [rows];
      return [{}];
    },
  };
};
const quietLog = { warn() {}, info() {} };

test('no admin account is created without environment credentials', async () => {
  const pool = fakePool([]);
  const result = await bootstrapAdmin(pool, {}, quietLog);
  assert.equal(result.created, false);
  assert.ok(!pool.queries.some(([sql]) => sql.startsWith('INSERT')));
});

test('first admin is created from environment credentials', async () => {
  const pool = fakePool([]);
  const result = await bootstrapAdmin(pool, { ADMIN_USERNAME: 'owner', ADMIN_PASSWORD: 'a-long-unique-passphrase' }, quietLog);
  assert.equal(result.created, true);
  const [, params] = pool.queries.find(([sql]) => sql.startsWith('INSERT'));
  assert.equal(params[0], 'owner');
  assert.ok(bcrypt.compareSync('a-long-unique-passphrase', params[1]));
});

test('an existing admin on the published default password is rotated', async () => {
  const pool = fakePool([{ id: 7, username: 'admin', password: bcrypt.hashSync('admin123', 4) }]);
  const result = await bootstrapAdmin(pool, { ADMIN_USERNAME: 'admin', ADMIN_PASSWORD: 'a-long-unique-passphrase' }, quietLog);
  assert.equal(result.rotated, 1);
  const [, params] = pool.queries.find(([sql]) => sql.startsWith('UPDATE'));
  assert.equal(params[1], 7);
  assert.ok(bcrypt.compareSync('a-long-unique-passphrase', params[0]));
});

test('a weak ADMIN_PASSWORD stops startup', async () => {
  await assert.rejects(bootstrapAdmin(fakePool([]), { ADMIN_USERNAME: 'a', ADMIN_PASSWORD: 'admin123' }, quietLog));
});

test('JWT_SECRET is required and must be long enough', () => {
  const original = process.env.JWT_SECRET;
  try {
    delete process.env.JWT_SECRET;
    assert.throws(requireJwtSecret);
    process.env.JWT_SECRET = 'too-short';
    assert.throws(requireJwtSecret);
    process.env.JWT_SECRET = 'x'.repeat(48);
    assert.equal(requireJwtSecret(), 'x'.repeat(48));
  } finally {
    if (original === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = original;
  }
});
