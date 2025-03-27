
import { PageContainer, SectionContainer } from "@/components/ui/container";
import { MainLayout } from "@/layouts/main-layout";
import { MetricCard } from "@/components/dashboard/metric-card";
import { CustomerActivity } from "@/components/dashboard/customer-activity";
import { CustomerCard, CustomerData } from "@/components/customers/customer-card";
import { Users, DollarSign, Clock, BarChart } from "lucide-react";

// Sample data
const recentCustomers: CustomerData[] = [
  {
    id: "1",
    name: "Emma Thompson",
    email: "emma@example.com",
    phone: "(555) 123-4567",
    company: "Acme Inc.",
    status: "active",
    lastContact: "Today",
    initials: "ET"
  },
  {
    id: "2",
    name: "Michael Chen",
    email: "michael@example.com",
    phone: "(555) 234-5678",
    company: "GlobalTech",
    status: "new",
    lastContact: "Yesterday",
    initials: "MC"
  },
  {
    id: "3",
    name: "Sarah Williams",
    email: "sarah@example.com",
    phone: "(555) 345-6789",
    company: "Innovate LLC",
    status: "active",
    lastContact: "3 days ago",
    initials: "SW"
  }
];

export default function Index() {
  return (
    <MainLayout>
      <PageContainer>
        <div className="flex flex-col space-y-2 mb-6">
          <h1 className="font-semibold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, here's an overview of your CRM.</p>
        </div>
        
        <SectionContainer className="py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Total Customers"
              value="1,482"
              icon={Users}
              change={{ value: 12, trend: "up" }}
              className="animate-fade-in"
            />
            <MetricCard
              title="Sales This Month"
              value="$48,590"
              icon={DollarSign}
              change={{ value: 8, trend: "up" }}
              className="animate-fade-in animate-delay-100"
            />
            <MetricCard
              title="Pending Tasks"
              value="24"
              icon={Clock}
              change={{ value: -3, trend: "down" }}
              className="animate-fade-in animate-delay-200"
            />
            <MetricCard
              title="Conversion Rate"
              value="18.2%"
              icon={BarChart}
              change={{ value: 2, trend: "up" }}
              className="animate-fade-in animate-delay-300"
            />
          </div>
        </SectionContainer>
        
        <SectionContainer className="py-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <h2 className="text-lg font-medium mb-4">Recent Customers</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recentCustomers.map((customer, index) => (
                  <CustomerCard 
                    key={customer.id} 
                    customer={customer} 
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  />
                ))}
              </div>
            </div>
            <div className="lg:col-span-1">
              <CustomerActivity />
            </div>
          </div>
        </SectionContainer>
      </PageContainer>
    </MainLayout>
  );
}
