import React, { createContext, useContext, useRef } from 'react';

const FilterContext = createContext();

export function FilterProvider({ children }) {
  const filterFunctionRef = useRef(null);

  const registerFilterFunction = (fn) => {
    filterFunctionRef.current = fn;
  };

  const applyFilter = (pivotAspect, tab, title = null) => {
    if (filterFunctionRef.current) {
      filterFunctionRef.current(pivotAspect, tab, title);
    }
  };
  
  const filterByPaperTitle = (title) => {
    if (filterFunctionRef.current) {
      filterFunctionRef.current(null, null, title);
    }
  };

  const filterByAuthor = (authorName) => {
    if (filterFunctionRef.current) {
      filterFunctionRef.current(null, null, null, authorName);
    }
  };

  return (
    <FilterContext.Provider value={{ applyFilter, registerFilterFunction, filterByPaperTitle, filterByAuthor }}>
      {children}
    </FilterContext.Provider>
  );
}

export function useFilter() {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilter must be used within FilterProvider');
  }
  return context;
}

