
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Building } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function CompanyLogin() {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCompanies, setFilteredCompanies] = useState<any[]>([]);

  useEffect(() => {
    // Load registered companies from localStorage
    const storedCompanies = JSON.parse(localStorage.getItem("companies") || "[]");
    setCompanies(storedCompanies);
    setFilteredCompanies(storedCompanies);
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredCompanies(companies);
    } else {
      setFilteredCompanies(
        companies.filter(company => 
          company.companyName.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
  }, [searchTerm, companies]);

  const handleCompanySelect = (company: any) => {
    // Set current company
    localStorage.setItem("currentCompany", JSON.stringify(company));
    toast.success(`Logged in as ${company.companyName}`);
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-primary/5 to-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Company Login</h1>
          <p className="text-muted-foreground mt-2">
            Select your company to access the CRM
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg space-y-4">
          <div className="relative">
            <Input 
              placeholder="Search company..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="max-h-80 overflow-y-auto space-y-2">
            {filteredCompanies.length > 0 ? (
              filteredCompanies.map(company => (
                <div 
                  key={company.id}
                  onClick={() => handleCompanySelect(company)}
                  className="p-3 border rounded-lg flex items-center cursor-pointer hover:bg-accent transition-colors"
                >
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                    <Building className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">{company.companyName}</h3>
                    <p className="text-sm text-muted-foreground">{company.email}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6">
                <p className="text-muted-foreground">No companies found</p>
                <Button 
                  variant="link" 
                  onClick={() => navigate("/company-registration")}
                  className="mt-2"
                >
                  Register a new company
                </Button>
              </div>
            )}
          </div>
        </div>
        
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            New to the platform?{" "}
            <Button variant="link" className="p-0" onClick={() => navigate("/company-registration")}>
              Register here
            </Button>
          </p>
        </div>
      </div>
    </div>
  );
}
