
import { PageContainer, SectionContainer } from "@/components/ui/container";
import { MainLayout } from "@/layouts/main-layout";
import { CustomerCard, CustomerData } from "@/components/customers/customer-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Filter, Plus, Search } from "lucide-react";
import { useState } from "react";

// Updated sample data with the required names
const customers: CustomerData[] = [
  {
    id: "1",
    name: "Ishan Prakash",
    email: "ishan@ishantech.com",
    phone: "(555) 123-4567",
    company: "IshanTech",
    status: "active",
    lastContact: "Today",
    initials: "IP"
  },
  {
    id: "2",
    name: "Prakhar Gupta",
    email: "prakhar@example.com",
    phone: "(555) 234-5678",
    company: "Synergy Corp",
    status: "new",
    lastContact: "Yesterday",
    initials: "PG"
  },
  {
    id: "3",
    name: "Abhinaya Singh",
    email: "abhinaya@innovate.com",
    phone: "(555) 345-6789",
    company: "Innovate LLC",
    status: "active",
    lastContact: "3 days ago",
    initials: "AS"
  },
  {
    id: "4",
    name: "Divyanshi Sharma",
    email: "divyanshi@matrix.com",
    phone: "(555) 456-7890",
    company: "Matrix Corp",
    status: "inactive",
    lastContact: "1 week ago",
    initials: "DS"
  }
];

export default function CustomersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  
  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.company.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <MainLayout>
      <PageContainer>
        <div className="flex flex-col space-y-2 mb-6">
          <h1 className="text-2xl font-bold text-center mb-4">Customer Relationship Model</h1>
          <p className="text-muted-foreground">Manage your customer relationships.</p>
        </div>
        
        <SectionContainer className="py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search customers..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-9">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
              <Button size="sm" className="h-9">
                <Plus className="mr-2 h-4 w-4" />
                Add Customer
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCustomers.map((customer, index) => (
              <CustomerCard 
                key={customer.id} 
                customer={customer}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              />
            ))}
            
            {filteredCustomers.length === 0 && (
              <div className="col-span-full py-12 text-center">
                <p className="text-muted-foreground">No customers found. Try a different search.</p>
              </div>
            )}
          </div>
        </SectionContainer>
      </PageContainer>
    </MainLayout>
  );
}
