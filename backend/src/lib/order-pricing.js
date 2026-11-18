const MAX_LINES = 50;
const MAX_QUANTITY = 50;

class OrderValidationError extends Error {}

/**
 * Normalise the client's cart to [{ menuItemId, quantity }], merging
 * duplicate lines. Prices and names sent by the client are ignored.
 */
function parseOrderLines(items) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new OrderValidationError('At least one item is required');
  }
  if (items.length > MAX_LINES) {
    throw new OrderValidationError(`An order can contain at most ${MAX_LINES} different items`);
  }
  const quantities = new Map();
  for (const item of items) {
    const id = Number(item?.menu_item_id);
    const quantity = Number(item?.quantity);
    if (!Number.isInteger(id) || id <= 0) throw new OrderValidationError('Invalid menu item');
    if (!Number.isInteger(quantity) || quantity < 1) throw new OrderValidationError('Invalid quantity');
    const merged = (quantities.get(id) || 0) + quantity;
    if (merged > MAX_QUANTITY) throw new OrderValidationError(`At most ${MAX_QUANTITY} of one item per order`);
    quantities.set(id, merged);
  }
  return [...quantities].map(([menuItemId, quantity]) => ({ menuItemId, quantity }));
}

const toCents = (price) => Math.round(Number(price) * 100);

/**
 * Price the order from database records. `menuRows` are the matching
 * menu_items rows; every requested item must exist and be available.
 * Money is summed in integer cents to avoid floating-point drift.
 */
function priceOrder(lines, menuRows) {
  const byId = new Map(menuRows.map((row) => [Number(row.id), row]));
  let totalCents = 0;
  const priced = lines.map(({ menuItemId, quantity }) => {
    const row = byId.get(menuItemId);
    if (!row || !Number(row.is_available)) {
      throw new OrderValidationError('One or more items are no longer available');
    }
    const unitCents = toCents(row.price);
    totalCents += unitCents * quantity;
    return { menuItemId, quantity, name: row.name_al, unitPrice: unitCents / 100 };
  });
  return { items: priced, total: totalCents / 100 };
}

module.exports = { parseOrderLines, priceOrder, OrderValidationError, MAX_QUANTITY, MAX_LINES };
