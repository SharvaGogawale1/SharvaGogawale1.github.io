import React from 'react';
import { useActiveSection } from '../contexts/ActiveSectionContext';
import { useTheme } from '../contexts/ThemeContext';
import { sections } from '../config/sections';

const inactiveClass = 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white';

function SiteNav() {
  const { activeSection, setActiveSection } = useActiveSection();
  const { isDark, toggleDarkMode } = useTheme();

  const handleClick = (sectionId) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      window.history.pushState(null, '', `#${sectionId}`);
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <nav
      className="paper-grain sticky top-0 z-50 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 mb-8 border-b backdrop-blur-sm"
      style={{
        backgroundColor: 'color-mix(in srgb, var(--theme-bg-primary, #f9fafb) 92%, transparent)',
        borderBottomColor: 'var(--theme-border, #e5e7eb)',
      }}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm">
          {sections.map((section) => {
            const isActive = activeSection === section.id;
            return (
              <button
                key={section.id}
                type="button"
                onClick={() => handleClick(section.id)}
                className={`bg-transparent border-0 p-0 cursor-pointer transition-colors ${
                  isActive ? 'text-gray-900 dark:text-white font-medium' : inactiveClass
                }`}
              >
                {section.label}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={toggleDarkMode}
          className={`flex-shrink-0 bg-transparent border-0 p-0 cursor-pointer transition-colors ${inactiveClass}`}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>
      </div>
    </nav>
  );
}

export default SiteNav;
