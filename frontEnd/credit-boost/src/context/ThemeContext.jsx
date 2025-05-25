import React, { createContext, useContext, useEffect, useState } from 'react';

// Create the theme context
const ThemeContext = createContext({
  theme: 'light',
  setTheme: () => null,
});

/**
 * Theme Provider Component
 * 
 * Provides theme context and handles theme switching functionality
 */
export const ThemeProvider = ({ children }) => {
  // Use state to track the current theme
  const [theme, setTheme] = useState(() => {
    // Check for saved theme in localStorage
    const savedTheme = localStorage.getItem('theme');
    
    // Check for system preference if no saved theme
    if (!savedTheme) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    
    return savedTheme;
  });

  // Update the HTML class and localStorage when theme changes
  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove both classes and add the current theme
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    
    // Save to localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      // Only change if user hasn't explicitly set a preference
      if (!localStorage.getItem('theme')) {
        setTheme(mediaQuery.matches ? 'dark' : 'light');
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Provide the theme context to children
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook for using the theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;