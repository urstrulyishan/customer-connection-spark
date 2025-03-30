
import { useEffect, useState } from "react";
import { PageContainer, SectionContainer } from "@/components/ui/container";
import { MainLayout } from "@/layouts/main-layout";
import { MetricCard } from "@/components/dashboard/metric-card";
import { CustomerActivity } from "@/components/dashboard/customer-activity";
import { CustomerCard, CustomerData } from "@/components/customers/customer-card";
import { Users, DollarSign, Clock, BarChart, Link2, Brain } from "lucide-react";
import { useCompany } from "@/contexts/CompanyContext";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { getCompanyData } from "@/utils/companyDataUtils";
import { LeadData } from "@/types/leads";
import { analyzeLeadQuality, getPredictedConversions } from "@/utils/aiAnalysisUtils";

export default function Index() {
  const { currentCompany, hasActivePlatformConnections } = useCompany();
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<CustomerData[]>([]);
  const [leads, setLeads] = useState<LeadData[]>([]);
  const [aiAnalytics, setAiAnalytics] = useState({
    leadScore: 0,
    predictedConversions: 0
  });

  // Sample data - in a real app this would come from a database
  const sampleCustomers: CustomerData[] = [
    {
      id: "1",
      name: "Arjun Patel",
      email: "arjun@example.com",
      phone: "(555) 123-4567",
      company: "Acme Inc.",
      status: "active",
      lastContact: "Today",
      initials: "AP"
    },
    {
      id: "2",
      name: "Priya Singh",
      email: "priya@example.com",
      phone: "(555) 234-5678",
      company: "GlobalTech",
      status: "new",
      lastContact: "Yesterday",
      initials: "PS"
    },
    {
      id: "3",
      name: "Vikram Sharma",
      email: "vikram@example.com",
      phone: "(555) 345-6789",
      company: "Innovate LLC",
      status: "active",
      lastContact: "3 days ago",
      initials: "VS"
    }
  ];

  // Sample leads data
  const sampleLeads: LeadData[] = [
    {
      id: "1",
      name: "Siddharth Malhotra",
      email: "siddharth@matrix.com",
      company: "Matrix Corp",
      status: "new",
      score: "hot",
      source: "Website",
      date: "Today",
      initials: "SM"
    },
    {
      id: "2",
      name: "Kavita Bajaj",
      email: "kavita@enterprise.com",
      company: "Enterprise Solutions",
      status: "contacted",
      score: "warm",
      source: "Referral",
      date: "Yesterday",
      initials: "KB"
    },
    {
      id: "3",
      name: "Mohan Desai",
      email: "mohan@innovative.com",
      company: "Innovative Tech",
      status: "qualified",
      score: "hot",
      source: "LinkedIn",
      date: "2 days ago",
      initials: "MD"
    }
  ];

  useEffect(() => {
    // If no company is selected, redirect to login
    if (!currentCompany && !localStorage.getItem("currentCompany")) {
      navigate("/company-login");
      return;
    }

    // Load company-specific data from localStorage or use sample data
    const companyId = currentCompany?.id || JSON.parse(localStorage.getItem("currentCompany") || "{}").id;
    
    // Load customers
    const storedCustomers = localStorage.getItem(`customers_${companyId}`);
    if (storedCustomers) {
      setCustomers(JSON.parse(storedCustomers));
    } else {
      // Use sample data for new companies
      setCustomers(sampleCustomers);
      localStorage.setItem(`customers_${companyId}`, JSON.stringify(sampleCustomers));
    }
    
    // Load leads
    const storedLeads = localStorage.getItem(`leads_${companyId}`);
    if (storedLeads) {
      const parsedLeads = JSON.parse(storedLeads);
      setLeads(parsedLeads);
      
      // Calculate AI metrics
      setAiAnalytics({
        leadScore: analyzeLeadQuality(parsedLeads),
        predictedConversions: getPredictedConversions(parsedLeads)
      });
    } else {
      // Use sample data for new companies
      setLeads(sampleLeads);
      localStorage.setItem(`leads_${companyId}`, JSON.stringify(sampleLeads));
      
      // Calculate AI metrics from sample data
      setAiAnalytics({
        leadScore: analyzeLeadQuality(sampleLeads),
        predictedConversions: getPredictedConversions(sampleLeads)
      });
    }
  }, [currentCompany, navigate]);

  // If not logged in yet, show nothing until redirect happens
  if (!currentCompany && !localStorage.getItem("currentCompany")) {
    return null;
  }

  return (
    <MainLayout>
      <PageContainer>
        <div className="flex flex-col space-y-2 mb-6">
          <h1 className="font-semibold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back to {currentCompany?.companyName || "your"} CRM dashboard.
          </p>
        </div>
        
        {!hasActivePlatformConnections && (
          <Alert className="mb-6">
            <Link2 className="h-4 w-4" />
            <AlertTitle>Connect your platforms</AlertTitle>
            <AlertDescription className="flex items-center justify-between">
              <span>Connect your existing systems to sync customer data and enhance your CRM experience.</span>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => navigate("/platform-connections")}
              >
                Connect Platforms
              </Button>
            </AlertDescription>
          </Alert>
        )}
        
        <SectionContainer className="py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Total Customers"
              value={customers.length.toString()}
              icon={Users}
              change={{ value: 12, trend: "up" }}
              className="animate-fade-in"
            />
            <MetricCard
              title="Sales This Month"
              value="₹48,590"
              icon={DollarSign}
              change={{ value: 8, trend: "up" }}
              className="animate-fade-in animate-delay-100"
            />
            <MetricCard
              title="Lead Quality Score"
              value={`${aiAnalytics.leadScore}%`}
              icon={Brain}
              change={{ value: 5, trend: "up" }}
              className="animate-fade-in animate-delay-200"
            />
            <MetricCard
              title="Predicted Conversions"
              value={aiAnalytics.predictedConversions.toString()}
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
                {customers.slice(0, 3).map((customer, index) => (
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
