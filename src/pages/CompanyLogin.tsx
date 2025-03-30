
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Building, LogIn } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export default function CompanyLogin() {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCompanies, setFilteredCompanies] = useState<any[]>([]);
  const [loginMode, setLoginMode] = useState(false);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
    },
  });

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
          company.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          company.email.toLowerCase().includes(searchTerm.toLowerCase())
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

  const handleDirectLogin = (values: z.infer<typeof loginSchema>) => {
    const foundCompany = companies.find(
      company => company.email.toLowerCase() === values.email.toLowerCase()
    );

    if (foundCompany) {
      handleCompanySelect(foundCompany);
    } else {
      toast.error("No company found with this email address");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-primary/5 to-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Company Login</h1>
          <p className="text-muted-foreground mt-2">
            Select your company or log in directly to access the CRM
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg space-y-4">
          <div className="flex justify-center space-x-4 mb-4">
            <Button 
              variant={loginMode ? "outline" : "default"} 
              onClick={() => setLoginMode(false)}
              className="flex-1"
            >
              Company List
            </Button>
            <Button 
              variant={loginMode ? "default" : "outline"} 
              onClick={() => setLoginMode(true)}
              className="flex-1"
            >
              Direct Login
            </Button>
          </div>

          {loginMode ? (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleDirectLogin)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Email</FormLabel>
                      <FormControl>
                        <div className="flex">
                          <div className="bg-primary/10 flex items-center justify-center w-10 rounded-l-md border border-r-0 border-input">
                            <Building className="h-4 w-4 text-primary" />
                          </div>
                          <Input 
                            className="rounded-l-none" 
                            placeholder="company@example.com" 
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button type="submit" className="w-full">
                  <LogIn className="mr-2 h-4 w-4" /> Login
                </Button>
              </form>
            </Form>
          ) : (
            <>
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
            </>
          )}
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
