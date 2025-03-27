
import React, { createContext, useContext, useState, useEffect } from "react";

type Company = {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  employees: string;
  registrationDate: string;
};

type CompanyContextType = {
  currentCompany: Company | null;
  setCurrentCompany: (company: Company | null) => void;
  isLoading: boolean;
};

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export function CompanyProvider({ children }: { children: React.ReactNode }) {
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load current company from localStorage on initial load
    const storedCompany = localStorage.getItem("currentCompany");
    if (storedCompany) {
      setCurrentCompany(JSON.parse(storedCompany));
    }
    setIsLoading(false);
  }, []);

  // Update localStorage when current company changes
  useEffect(() => {
    if (currentCompany) {
      localStorage.setItem("currentCompany", JSON.stringify(currentCompany));
    } else {
      localStorage.removeItem("currentCompany");
    }
  }, [currentCompany]);

  return (
    <CompanyContext.Provider value={{ currentCompany, setCurrentCompany, isLoading }}>
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompany() {
  const context = useContext(CompanyContext);
  if (context === undefined) {
    throw new Error("useCompany must be used within a CompanyProvider");
  }
  return context;
}
