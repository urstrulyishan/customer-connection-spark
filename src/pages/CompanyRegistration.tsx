
import React from "react";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { Building, Mail, Phone, User } from "lucide-react";

import { PageContainer, SectionContainer } from "@/components/ui/container";
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

const formSchema = z.object({
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  contactName: z.string().min(2, "Contact name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  employees: z.string().min(1, "Number of employees is required"),
});

export default function CompanyRegistration() {
  const navigate = useNavigate();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: "",
      contactName: "",
      email: "",
      phone: "",
      employees: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    // In a real app, we would send this data to a server
    console.log(values);
    
    // Store company data in localStorage for now
    const companies = JSON.parse(localStorage.getItem("companies") || "[]");
    const newCompany = {
      id: Date.now().toString(),
      ...values,
      registrationDate: new Date().toISOString(),
    };
    
    companies.push(newCompany);
    localStorage.setItem("companies", JSON.stringify(companies));
    
    // Set the current company
    localStorage.setItem("currentCompany", JSON.stringify(newCompany));
    
    toast.success("Company registered successfully!");
    navigate("/");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-primary/5 to-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Register Your Company</h1>
          <p className="text-muted-foreground mt-2">
            Join our CRM platform to manage your customers efficiently
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                        <Input className="rounded-l-none" placeholder="Tata Consultancy" {...field} />
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
                        <Input className="rounded-l-none" placeholder="Rahul Sharma" {...field} />
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
                        <Input className="rounded-l-none" placeholder="contact@example.com" {...field} />
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
                        <Input className="rounded-l-none" placeholder="+91 98765 43210" {...field} />
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
                      <Input type="number" placeholder="10" min="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit" className="w-full">Register Company</Button>
            </form>
          </Form>
        </div>
        
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Already registered?{" "}
            <Button variant="link" className="p-0" onClick={() => navigate("/company-login")}>
              Login here
            </Button>
          </p>
        </div>
      </div>
    </div>
  );
}
