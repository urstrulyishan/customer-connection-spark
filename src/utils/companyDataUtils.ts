
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
