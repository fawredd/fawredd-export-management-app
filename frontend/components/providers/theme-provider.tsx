'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

// Define the available themes
export const THEMES = ['light', 'dark'];
const ThemeContext = createContext<{ theme: string; setTheme: (theme: string) => void } | undefined>(undefined);

export function ThemeProvider({ children, initialTheme }:{children: React.ReactNode, initialTheme: string}) {
  // Use 'useState' to manage the active theme
  const [theme, setTheme] = useState(initialTheme);

  // Use 'useEffect' to apply the class to the <html> tag
  useEffect(() => {
    const root = document.documentElement;
    // Remove all theme classes first
    root.classList.remove(...THEMES); 
    // Add the current active theme class
    root.classList.add(theme);
  }, [theme]); // Reruns whenever the theme state changes

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {/* Display content with theme-aware utilities */}
      <main className="min-h-screen relative container bg-background text-foreground">
        {children}
      </main>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
} 
