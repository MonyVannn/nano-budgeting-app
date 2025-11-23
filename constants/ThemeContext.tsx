import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import { DarkTheme, LightTheme } from "./Colors";

type Theme = typeof DarkTheme | typeof LightTheme;
type ThemeMode = "dark" | "light";

interface ThemeContextType {
  theme: Theme;
  themeMode: ThemeMode;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = "@budgeting_app_theme";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeMode, setThemeMode] = useState<ThemeMode>("dark");
  const [theme, setThemeState] = useState<Theme>(DarkTheme);

  // Load saved theme on mount
  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme === "light" || savedTheme === "dark") {
        setThemeMode(savedTheme);
        setThemeState(savedTheme === "light" ? LightTheme : DarkTheme);
      }
    } catch (error) {
      console.error("Failed to load theme:", error);
    }
  };

  const setTheme = async (mode: ThemeMode) => {
    try {
      setThemeMode(mode);
      setThemeState(mode === "light" ? LightTheme : DarkTheme);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch (error) {
      console.error("Failed to save theme:", error);
    }
  };

  const toggleTheme = () => {
    const newMode = themeMode === "dark" ? "light" : "dark";
    setTheme(newMode);
  };

  return (
    <ThemeContext.Provider value={{ theme, themeMode, toggleTheme, setTheme }}>
      {children}
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
