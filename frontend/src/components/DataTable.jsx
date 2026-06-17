import './DataTable.css';

function DataTable({ columns, data, onSort, sortConfig, onRowClick, emptyMessage }) {
  const handleSort = (key) => {
    if (!onSort) return;
    const column = columns.find((c) => c.key === key);
    if (!column || !column.sortable) return;
    onSort(key);
  };

  const getSortIcon = (key) => {
    if (!sortConfig || sortConfig.sortBy !== key) {
      return <span className="sort-icon sort-icon-inactive">⇅</span>;
    }
    return (
      <span className="sort-icon sort-icon-active">
        {sortConfig.order === 'asc' ? '▲' : '▼'}
      </span>
    );
  };

  if (!data || data.length === 0) {
    return (
      <div className="data-table-wrapper glass-card">
        <div className="empty-state">
          <div className="empty-state-icon">📭</div>
          <div className="empty-state-text">{emptyMessage || 'No data found'}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="data-table-wrapper glass-card">
      <div className="data-table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`data-table-th ${col.sortable ? 'sortable' : ''} ${
                    sortConfig?.sortBy === col.key ? 'sorted' : ''
                  }`}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <span className="th-content">
                    {col.label}
                    {col.sortable && getSortIcon(col.key)}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr
                key={row.id || index}
                className={`data-table-row ${onRowClick ? 'clickable' : ''}`}
                onClick={() => onRowClick && onRowClick(row)}
                style={{ animationDelay: `${index * 0.03}s` }}
              >
                {columns.map((col) => (
                  <td key={col.key} className="data-table-td">
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DataTable;
