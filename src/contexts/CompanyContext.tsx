
import React, { createContext, useContext, useState, useEffect } from "react";
import { Company } from "@/utils/companyDataUtils";

type CompanyContextType = {
  currentCompany: Company | null;
  setCurrentCompany: (company: Company | null) => void;
  isLoading: boolean;
  hasActivePlatformConnections: boolean;
  refreshConnectionStatus: () => void;
};

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export function CompanyProvider({ children }: { children: React.ReactNode }) {
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasActivePlatformConnections, setHasActivePlatformConnections] = useState(false);

  useEffect(() => {
    // Load current company from localStorage on initial load
    const storedCompany = localStorage.getItem("currentCompany");
    if (storedCompany) {
      setCurrentCompany(JSON.parse(storedCompany));
    }
    setIsLoading(false);
  }, []);

  // Check if we have any active platform connections
  const refreshConnectionStatus = () => {
    if (!currentCompany) return;
    
    const companyId = currentCompany.id;
    const connectionsKey = `platformConnections_${companyId}`;
    const connections = localStorage.getItem(connectionsKey);
    
    if (connections) {
      try {
        const parsedConnections = JSON.parse(connections);
        const hasActive = Array.isArray(parsedConnections) && 
          parsedConnections.some(conn => conn.isActive);
        setHasActivePlatformConnections(hasActive);
      } catch (e) {
        console.error("Error parsing platform connections", e);
        setHasActivePlatformConnections(false);
      }
    } else {
      setHasActivePlatformConnections(false);
    }
  };

  // Check connection status when company changes
  useEffect(() => {
    refreshConnectionStatus();
  }, [currentCompany]);

  // Update localStorage when current company changes
  useEffect(() => {
    if (currentCompany) {
      localStorage.setItem("currentCompany", JSON.stringify(currentCompany));
    } else {
      localStorage.removeItem("currentCompany");
    }
  }, [currentCompany]);

  return (
    <CompanyContext.Provider value={{ 
      currentCompany, 
      setCurrentCompany, 
      isLoading,
      hasActivePlatformConnections,
      refreshConnectionStatus
    }}>
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
