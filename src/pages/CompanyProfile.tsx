
import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { Building, Mail, Phone, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { PageContainer, SectionContainer } from "@/components/ui/container";
import { MainLayout } from "@/layouts/main-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { useCompany } from "@/contexts/CompanyContext";

const formSchema = z.object({
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  contactName: z.string().min(2, "Contact name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  employees: z.string().min(1, "Number of employees is required"),
});

export default function CompanyProfile() {
  const { currentCompany, setCurrentCompany } = useCompany();
  const navigate = useNavigate();

  // Redirect if no company is selected
  React.useEffect(() => {
    if (!currentCompany && !localStorage.getItem("currentCompany")) {
      navigate("/company-login");
    }
  }, [currentCompany, navigate]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: currentCompany?.companyName || "",
      contactName: currentCompany?.contactName || "",
      email: currentCompany?.email || "",
      phone: currentCompany?.phone || "",
      employees: currentCompany?.employees || "",
    },
  });

  // Update form when currentCompany changes
  React.useEffect(() => {
    if (currentCompany) {
      form.reset({
        companyName: currentCompany.companyName,
        contactName: currentCompany.contactName,
        email: currentCompany.email,
        phone: currentCompany.phone,
        employees: currentCompany.employees,
      });
    }
  }, [currentCompany, form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!currentCompany) return;

    // Update company in localStorage
    const companies = JSON.parse(localStorage.getItem("companies") || "[]");
    const updatedCompanies = companies.map((company: any) => 
      company.id === currentCompany.id ? { ...company, ...values } : company
    );
    
    localStorage.setItem("companies", JSON.stringify(updatedCompanies));
    
    // Update current company
    const updatedCompany = { ...currentCompany, ...values };
    setCurrentCompany(updatedCompany);
    
    toast.success("Company information updated successfully!");
  }

  function handleLogout() {
    localStorage.removeItem("currentCompany");
    setCurrentCompany(null);
    navigate("/company-login");
    toast.info("Logged out successfully");
  }

  if (!currentCompany) return null;

  return (
    <MainLayout>
      <PageContainer>
        <div className="flex flex-col space-y-2 mb-6">
          <h1 className="font-semibold">Company Profile</h1>
          <p className="text-muted-foreground">View and edit your company details</p>
        </div>
        
        <SectionContainer className="py-6">
          <div className="max-w-2xl mx-auto">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name</FormLabel>
                      <FormControl>
                        <div className="flex">
                          <div className="bg-primary/10 flex items-center justify-center w-10 rounded-l-md border border-r-0 border-input">
                            <Building className="h-4 w-4 text-primary" />
                          </div>
                          <Input className="rounded-l-none" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="contactName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Person Name</FormLabel>
                      <FormControl>
                        <div className="flex">
                          <div className="bg-primary/10 flex items-center justify-center w-10 rounded-l-md border border-r-0 border-input">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                          <Input className="rounded-l-none" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Email</FormLabel>
                      <FormControl>
                        <div className="flex">
                          <div className="bg-primary/10 flex items-center justify-center w-10 rounded-l-md border border-r-0 border-input">
                            <Mail className="h-4 w-4 text-primary" />
                          </div>
                          <Input className="rounded-l-none" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <div className="flex">
                          <div className="bg-primary/10 flex items-center justify-center w-10 rounded-l-md border border-r-0 border-input">
                            <Phone className="h-4 w-4 text-primary" />
                          </div>
                          <Input className="rounded-l-none" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="employees"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Employees</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2 justify-between">
                  <Button type="submit">Save Changes</Button>
                  <Button type="button" variant="outline" onClick={handleLogout}>Logout</Button>
                </div>
              </form>
            </Form>
            
            <div className="mt-10 pt-6 border-t">
              <h3 className="text-base font-medium mb-4">Company Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">Registration Date</p>
                  <p>{new Date(currentCompany.registrationDate).toLocaleDateString()}</p>
                </div>
                <div className="border rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">Company ID</p>
                  <p>{currentCompany.id}</p>
                </div>
              </div>
            </div>
          </div>
        </SectionContainer>
      </PageContainer>
    </MainLayout>
  );
}
