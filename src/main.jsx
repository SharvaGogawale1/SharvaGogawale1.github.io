import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { ThemeProvider } from './contexts/ThemeContext.jsx'
import { FilterProvider } from './contexts/FilterContext.jsx'
import { ActiveSectionProvider } from './contexts/ActiveSectionContext.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <FilterProvider>
        <ActiveSectionProvider>
          <App />
        </ActiveSectionProvider>
      </FilterProvider>
    </ThemeProvider>
  </React.StrictMode>,
)

