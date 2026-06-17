import './FilterBar.css';

function FilterBar({ filters, values, onChange }) {
  const handleChange = (key, value) => {
    onChange({ ...values, [key]: value });
  };

  return (
    <div className="filter-bar">
      {filters.map((filter) => (
        <div key={filter.key} className="filter-item">
          <label className="filter-label">{filter.label}</label>
          {filter.type === 'select' ? (
            <div className="filter-input-wrapper">
              <select
                className="form-select filter-select"
                value={values[filter.key] || ''}
                onChange={(e) => handleChange(filter.key, e.target.value)}
              >
                <option value="">All</option>
                {filter.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="filter-input-wrapper">
              <svg className="filter-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                className="form-input filter-input"
                placeholder={`Search ${filter.label.toLowerCase()}...`}
                value={values[filter.key] || ''}
                onChange={(e) => handleChange(filter.key, e.target.value)}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default FilterBar;
