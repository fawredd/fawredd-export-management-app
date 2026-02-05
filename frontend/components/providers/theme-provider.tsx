'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

// Define the available themes
export const THEMES = ['light', 'dark'];
const ThemeContext = createContext<{ theme: string; setTheme: (theme: string) => void } | undefined>(undefined);

export function ThemeProvider({ children, initialTheme }: { children: ReactNode, initialTheme: string }) {
  // Initialize with a safe default, then update from localStorage on mount
  const [theme, setTheme] = useState(initialTheme);
  const [mounted, setMounted] = useState(false);

  // Load theme from localStorage on mount (client-side only)
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || initialTheme;
    setTheme(savedTheme);
    setMounted(true);
  }, [initialTheme]);

  // Apply theme to document root
  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    // Remove all theme classes first
    root.classList.remove(...THEMES);
    // Add the current active theme class
    root.classList.add(theme);
    // Save to localStorage
    localStorage.setItem('theme', theme);
  }, [theme, mounted]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {/* Display content with theme-aware utilities */}
      <main className="min-h-screen relative container bg-background text-foreground" suppressHydrationWarning>
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
