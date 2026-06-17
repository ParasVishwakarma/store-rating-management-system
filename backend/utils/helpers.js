/**
 * Build a dynamic WHERE clause from filter parameters.
 * @param {Object} filters - key-value pairs, e.g. { name: 'Tech', email: 'gmail' }
 * @param {string[]} allowedFields - fields that may be filtered on
 * @returns {{ clause: string, values: any[] }}
 */
function buildWhereClause(filters, allowedFields) {
  const conditions = [];
  const values = [];

  for (const field of allowedFields) {
    if (filters[field] !== undefined && filters[field] !== '') {
      conditions.push(`${field} LIKE ?`);
      values.push(`%${filters[field]}%`);
    }
  }

  const clause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  return { clause, values };
}

/**
 * Build an ORDER BY clause from sort parameters.
 * @param {string} sortBy - column to sort on
 * @param {string} order - 'asc' or 'desc'
 * @param {string[]} allowedSortFields - columns allowed for sorting
 * @param {string} defaultSort - default sort column
 * @returns {string}
 */
function buildOrderByClause(sortBy, order, allowedSortFields, defaultSort = 'id') {
  const safeOrder = order && order.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
  const safeSort = allowedSortFields.includes(sortBy) ? sortBy : defaultSort;
  return `ORDER BY ${safeSort} ${safeOrder}`;
}

module.exports = {
  buildWhereClause,
  buildOrderByClause
};
