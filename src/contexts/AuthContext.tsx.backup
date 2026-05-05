import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface Student {
  name: string;
  unit: string;
  treats: number;
  badges: string[];
}

export interface Family {
  code: string;
  familyName: string;
  students: Student[];
}

interface AuthContextType {
  family: Family | null;
  login: (code: string, familiesData: Family[]) => boolean;
  logout: () => void;
  isLoggedIn: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [family, setFamily] = useState<Family | null>(() => {
    const saved = sessionStorage.getItem("mpe_family");
    return saved ? JSON.parse(saved) : null;
  });

  const login = (code: string, familiesData: any[]): boolean => {
  const rows = familiesData.filter(
    (f) => f.code.toUpperCase() === code.toUpperCase().trim()
  );
  if (rows.length > 0) {
    const family: Family = {
      code: rows[0].code,
      familyName: rows[0].familyName,
      students: rows.map((r) => ({
        name: r.students,
        unit: r.unit || "",
        treats: 0,
        badges: []
      }))
    };
    setFamily(family);
    sessionStorage.setItem("mpe_family", JSON.stringify(family));
    return true;
  }
  return false;
};

  const logout = () => {
    setFamily(null);
    sessionStorage.removeItem("mpe_family");
  };

  return (
    <AuthContext.Provider value={{ family, login, logout, isLoggedIn: !!family }}>
      {children}
    </AuthContext.Provider>
  );
};
