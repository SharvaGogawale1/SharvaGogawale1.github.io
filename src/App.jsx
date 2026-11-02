import React from 'react';
import SiteNav from './components/SiteNav';
import MarginDoodles from './components/MarginDoodles';
import { sections } from './config/sections';
import { site } from './config/site';

function App() {
  return (
    <div className="app-container relative min-h-screen" style={{ backgroundColor: 'var(--theme-bg-primary, #f9fafb)' }}>
      <MarginDoodles />
      <main className="relative z-10 mx-auto w-full max-w-4xl px-4 sm:px-6 pt-8 sm:pt-12 pb-8">
        <SiteNav />
        {sections.map((section, index) => {
          const Component = section.component;
          const isAbout = section.id === 'about';
          return (
            <div
              key={section.id}
              className={
                index > 0
                  ? 'pt-12 pb-4 border-t border-gray-200 dark:border-gray-700'
                  : 'pb-4'
              }
            >
              <Component title={isAbout ? undefined : section.label} />
            </div>
          );
        })}
        <footer className="mt-4 pt-3 text-center text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700">
          &copy; {new Date().getFullYear()} {site.name}. Design adapted from{' '}
          <a
            href="https://nbalepur.github.io/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            Nishant Balepur
          </a>
          .
        </footer>
      </main>
    </div>
  );
}

export default App;
