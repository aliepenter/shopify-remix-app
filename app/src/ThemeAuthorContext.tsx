import React, { createContext, ReactNode, useContext, useState } from "react";

interface ThemeAuthorContextType {
  themeAuthor: string;
  setThemeAuthor: (author: string) => void;
}

const ThemeAuthorContext = createContext<ThemeAuthorContextType | undefined>(undefined);

export const ThemeAuthorProvider = ({ children }: { children: ReactNode }) => {
  // Thiết lập giá trị mặc định cho themeAuthor là "Unknown Author"
  const [themeAuthor, setThemeAuthor] = useState<string>("Unknown Author");

  return (
    <ThemeAuthorContext.Provider value={{ themeAuthor, setThemeAuthor }}>
      {children}
    </ThemeAuthorContext.Provider>
  );
};

export const useThemeAuthor = (): ThemeAuthorContextType => {
  const context = useContext(ThemeAuthorContext);
  if (context === undefined) {
    throw new Error("useThemeAuthor must be used within a ThemeAuthorProvider");

  }
  return context;
};
