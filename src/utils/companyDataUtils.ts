
/**
 * Utility functions for managing company-specific data
 */

export type Company = {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  employees: string;
  registrationDate: string;
};

// Platform integration types
export type PlatformIntegration = {
  id: string;
  name: string;
  type: "api" | "webhook" | "database" | "email" | "ecommerce";
  url: string;
  apiKey?: string;
  isActive: boolean;
  lastSync?: string;
}

/**
 * Get the current company from localStorage
 */
export function getCurrentCompany(): Company | null {
  const companyJson = localStorage.getItem("currentCompany");
  if (!companyJson) return null;
  
  try {
    return JSON.parse(companyJson);
  } catch (e) {
    console.error("Error parsing current company data", e);
    return null;
  }
}

/**
 * Save data specific to a company
 */
export function saveCompanyData<T>(key: string, data: T): void {
  const company = getCurrentCompany();
  if (!company) return;
  
  const companySpecificKey = `${key}_${company.id}`;
  localStorage.setItem(companySpecificKey, JSON.stringify(data));
}

/**
 * Get data specific to a company
 */
export function getCompanyData<T>(key: string, defaultValue: T): T {
  const company = getCurrentCompany();
  if (!company) return defaultValue;
  
  const companySpecificKey = `${key}_${company.id}`;
  const data = localStorage.getItem(companySpecificKey);
  
  if (!data) return defaultValue;
  
  try {
    return JSON.parse(data) as T;
  } catch (e) {
    console.error(`Error parsing ${key} data`, e);
    return defaultValue;
  }
}

/**
 * Sync data between two platforms
 * This is a mock implementation that simulates data syncing
 */
export function syncPlatformData(sourceUrl: string, destinationUrl: string, apiKey?: string): Promise<boolean> {
  // In a real implementation, this would make API calls to external services
  return new Promise((resolve) => {
    console.log(`Syncing data from ${sourceUrl} to ${destinationUrl}`);
    // Simulate API delay
    setTimeout(() => {
      resolve(true);
    }, 1500);
  });
}

/**
 * Check if a platform connection is valid
 * This is a mock implementation that simulates connection validation
 */
export function validatePlatformConnection(url: string, apiKey?: string): Promise<{isValid: boolean, message: string}> {
  return new Promise((resolve) => {
    console.log(`Validating connection to ${url}`);
    // Simulate API delay
    setTimeout(() => {
      // Randomly succeed or fail for demo purposes
      const isValid = Math.random() > 0.2; // 80% success rate
      
      if (isValid) {
        resolve({
          isValid: true,
          message: "Connection successful"
        });
      } else {
        resolve({
          isValid: false,
          message: "Could not connect to the platform. Please check your URL and API key."
        });
      }
    }, 1000);
  });
}

/**
 * Get available data types from a platform
 * This is a mock implementation that simulates fetching available data types
 */
export function getPlatformDataTypes(url: string, apiKey?: string): Promise<string[]> {
  return new Promise((resolve) => {
    // Simulate API delay
    setTimeout(() => {
      resolve([
        "customers",
        "leads",
        "sales",
        "products",
        "interactions"
      ]);
    }, 800);
  });
}
