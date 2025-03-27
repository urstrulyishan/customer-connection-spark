
import { PageContainer, SectionContainer } from "@/components/ui/container";
import { MainLayout } from "@/layouts/main-layout";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Filter, Plus, Search, ThermometerSnowflake, LucideIcon, Flame, ArrowRight } from "lucide-react";
import { useState } from "react";

interface LeadData {
  id: string;
  name: string;
  email: string;
  company: string;
  status: "new" | "contacted" | "qualified" | "proposal" | "closed";
  score: "cold" | "warm" | "hot";
  source: string;
  date: string;
  avatar?: string;
  initials: string;
}

// Sample data
const leads: LeadData[] = [
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
  },
  {
    id: "4",
    name: "Sunita Agarwal",
    email: "sunita@futuretech.com",
    company: "Future Technologies",
    status: "proposal",
    score: "hot",
    source: "Conference",
    date: "3 days ago",
    initials: "SA"
  },
  {
    id: "5",
    name: "Jayant Narayan",
    email: "jayant@digitalex.com",
    company: "Digital Express",
    status: "new",
    score: "cold",
    source: "Email Campaign",
    date: "1 week ago",
    initials: "JN"
  },
  {
    id: "6",
    name: "Pooja Bhatia",
    email: "pooja@techwave.com",
    company: "TechWave Inc.",
    status: "contacted",
    score: "warm",
    source: "Advertisement",
    date: "5 days ago",
    initials: "PB"
  }
];

function getStatusColor(status: LeadData["status"]) {
  switch (status) {
    case "new":
      return "bg-blue-500/10 text-blue-600 hover:bg-blue-500/20";
    case "contacted":
      return "bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20";
    case "qualified":
      return "bg-purple-500/10 text-purple-600 hover:bg-purple-500/20";
    case "proposal":
      return "bg-green-500/10 text-green-600 hover:bg-green-500/20";
    case "closed":
      return "bg-gray-500/10 text-gray-600 hover:bg-gray-500/20";
    default:
      return "bg-gray-500/10 text-gray-600 hover:bg-gray-500/20";
  }
}

function getScoreIcon(score: LeadData["score"]): LucideIcon {
  switch (score) {
    case "cold":
      return ThermometerSnowflake;
    case "warm":
      return ArrowRight;
    case "hot":
      return Flame;
    default:
      return ArrowRight;
  }
}

function getScoreColor(score: LeadData["score"]) {
  switch (score) {
    case "cold":
      return "text-blue-500";
    case "warm":
      return "text-yellow-500";
    case "hot":
      return "text-red-500";
    default:
      return "text-gray-500";
  }
}

export default function LeadsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  
  const filteredLeads = leads.filter(lead => 
    lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lead.company.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <MainLayout>
      <PageContainer>
        <div className="flex flex-col space-y-2 mb-6">
          <h1 className="font-semibold">Leads</h1>
          <p className="text-muted-foreground">Track and manage your potential customers.</p>
        </div>
        
        <SectionContainer className="py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search leads..."
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
                Add Lead
              </Button>
            </div>
          </div>
          
          <div className="overflow-hidden rounded-xl border shadow-card">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted/30">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Company
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Score
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Source
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {filteredLeads.map((lead, index) => {
                  const ScoreIcon = getScoreIcon(lead.score);
                  
                  return (
                    <tr 
                      key={lead.id}
                      className="hover:bg-muted/20 transition-colors animate-fade-in"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Avatar className="h-8 w-8 mr-3">
                            {lead.avatar ? (
                              <img src={lead.avatar} alt={lead.name} />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-muted text-xs font-medium">
                                {lead.initials}
                              </div>
                            )}
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">{lead.name}</span>
                            <span className="text-xs text-muted-foreground">{lead.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {lead.company}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant="secondary" className={cn("text-xs capitalize", getStatusColor(lead.status))}>
                          {lead.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <ScoreIcon className={cn("h-4 w-4 mr-1", getScoreColor(lead.score))} />
                          <span className="text-sm capitalize">{lead.score}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {lead.source}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {lead.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <Button variant="ghost" size="sm" className="h-8 px-2">View</Button>
                        <Button variant="ghost" size="sm" className="h-8 px-2">Edit</Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            {filteredLeads.length === 0 && (
              <div className="py-12 text-center">
                <p className="text-muted-foreground">No leads found. Try a different search.</p>
              </div>
            )}
          </div>
        </SectionContainer>
      </PageContainer>
    </MainLayout>
  );
}
