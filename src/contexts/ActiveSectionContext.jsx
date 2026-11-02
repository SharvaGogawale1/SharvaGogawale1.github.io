import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { sections } from '../config/sections';

const ActiveSectionContext = createContext();

export function ActiveSectionProvider({ children }) {
  const [activeSection, setActiveSection] = useState(null);
  const manualOverrideRef = useRef(null);
  const manualOverrideTimeoutRef = useRef(null);

  // Function to manually set active section (for sidebar clicks)
  const setActiveSectionManually = useCallback((sectionId) => {
    manualOverrideRef.current = sectionId;
    setActiveSection(sectionId);
    
    // Clear manual override after scroll completes (about 1 second for smooth scroll)
    if (manualOverrideTimeoutRef.current) {
      clearTimeout(manualOverrideTimeoutRef.current);
    }
    manualOverrideTimeoutRef.current = setTimeout(() => {
      manualOverrideRef.current = null;
    }, 1000);
  }, []);

  useEffect(() => {
    const calculateIntersectionRatio = (element) => {
      const rect = element.getBoundingClientRect();
      const viewportTop = 0;
      const viewportBottom = window.innerHeight;
      
      const sectionTop = rect.top;
      const sectionBottom = rect.bottom;
      const sectionHeight = rect.height;

      if (sectionHeight === 0) return 0;

      // Calculate the visible portion
      const visibleTop = Math.max(sectionTop, viewportTop);
      const visibleBottom = Math.min(sectionBottom, viewportBottom);
      const visibleHeight = Math.max(0, visibleBottom - visibleTop);

      // Calculate the proportion of the section that is visible
      return visibleHeight / sectionHeight;
    };

    const updateActiveSection = () => {
      // Don't override if manually set (within timeout period)
      if (manualOverrideRef.current) {
        return;
      }

      // Calculate intersection ratio for each section and find the one with highest proportion
      let activeSectionId = null;
      let highestRatio = -1;

      sections.forEach((section) => {
        const sectionElement = document.getElementById(section.id);
        if (sectionElement) {
          const ratio = calculateIntersectionRatio(sectionElement);
          if (ratio > highestRatio) {
            highestRatio = ratio;
            activeSectionId = section.id;
          }
        }
      });

      if (activeSectionId) {
        setActiveSection(activeSectionId);
      }
    };

    // Throttle scroll events using requestAnimationFrame
    let rafId = null;
    const handleScroll = () => {
      if (rafId === null) {
        rafId = requestAnimationFrame(() => {
          updateActiveSection();
          rafId = null;
        });
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Handle hash URL on initial load
    const handleHashNavigation = () => {
      const hash = window.location.hash.slice(1); // Remove the # symbol
      if (hash) {
        const section = sections.find(s => s.id === hash);
        if (section) {
          setTimeout(() => {
            const element = document.getElementById(hash);
            if (element) {
              element.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start',
                inline: 'nearest'
              });
              setActiveSection(hash);
            }
          }, 100);
        }
      }
    };

    // Set initial active section
    const setInitialSection = () => {
      updateActiveSection();
    };

    // Handle hash navigation first, then set initial section
    handleHashNavigation();
    
    // Set initial section after a brief delay to ensure DOM is ready
    const timeoutId = setTimeout(setInitialSection, 200);

    return () => {
      clearTimeout(timeoutId);
      if (manualOverrideTimeoutRef.current) {
        clearTimeout(manualOverrideTimeoutRef.current);
      }
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <ActiveSectionContext.Provider value={{ activeSection, setActiveSection: setActiveSectionManually }}>
      {children}
    </ActiveSectionContext.Provider>
  );
}

export function useActiveSection() {
  const context = useContext(ActiveSectionContext);
  if (!context) {
    throw new Error('useActiveSection must be used within ActiveSectionProvider');
  }
  return context;
}

