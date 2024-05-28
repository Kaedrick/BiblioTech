import React, { useState } from 'react';

const FilterPanel =  ({ filters, onFilterChange }:  {filters: string[], onFilterChange: (filters: string[]) => void }) => {
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const toggleFilter = (filter: any) => {
    const index = activeFilters.indexOf(filter);
    if (index === -1) {
      setActiveFilters([...activeFilters, filter]);
    } else {
      setActiveFilters(activeFilters.filter((f) => f !== filter));
    }
    onFilterChange(activeFilters);
  };

  return (
    <div className="filter-panel">
      <h2>Filtres</h2>
      <div className="filter-buttons">
        {filters.map((filter) => (
          <button
            key={filter}
            className={activeFilters.includes(filter) ? 'active' : ''}
            onClick={() => toggleFilter(filter)}
          >
            {filter}
          </button>
        ))}
      </div>
      <div className="selected-filters">
        {activeFilters.length > 0 && (
          <>
            <h3>Filtres sélectionnés :</h3>
            <ul>
              {activeFilters.map((filter) => (
                <li key={filter}>{filter}</li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
};

export default FilterPanel;