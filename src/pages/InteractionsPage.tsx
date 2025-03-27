
import { PageContainer, SectionContainer } from "@/components/ui/container";
import { MainLayout } from "@/layouts/main-layout";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Calendar, Filter, MessageSquare, Phone, Plus, Search, Video } from "lucide-react";
import { useState } from "react";

interface InteractionData {
  id: string;
  type: "call" | "email" | "meeting" | "message";
  customer: {
    name: string;
    avatar?: string;
    initials: string;
  };
  date: string;
  time: string;
  duration?: string;
  summary: string;
  notes?: string;
}

// Sample data
const interactions: InteractionData[] = [
  {
    id: "1",
    type: "call",
    customer: {
      name: "Emma Thompson",
      initials: "ET"
    },
    date: "Today",
    time: "10:30 AM",
    duration: "15 min",
    summary: "Discussed new feature requirements",
    notes: "Emma was interested in the new analytics dashboard. Follow up next week with a demo."
  },
  {
    id: "2",
    type: "email",
    customer: {
      name: "Michael Chen",
      initials: "MC"
    },
    date: "Yesterday",
    time: "2:45 PM",
    summary: "Sent onboarding materials",
    notes: "Michael requested additional documentation about the API integration."
  },
  {
    id: "3",
    type: "meeting",
    customer: {
      name: "Sarah Williams",
      initials: "SW"
    },
    date: "May 15, 2023",
    time: "11:00 AM",
    duration: "45 min",
    summary: "Product demo and Q&A session",
    notes: "Sarah and her team were impressed with the new UI. They want to schedule a follow-up to discuss pricing."
  },
  {
    id: "4",
    type: "message",
    customer: {
      name: "David Rodriguez",
      initials: "DR"
    },
    date: "May 14, 2023",
    time: "9:15 AM",
    summary: "Quick question about billing",
    notes: "David asked about changing his billing cycle. I directed him to the account settings page."
  },
  {
    id: "5",
    type: "call",
    customer: {
      name: "Jennifer Lee",
      initials: "JL"
    },
    date: "May 12, 2023",
    time: "3:30 PM",
    duration: "10 min",
    summary: "Follow-up on support ticket",
    notes: "Jennifer confirmed that the issue was resolved. She's satisfied with the support response time."
  },
  {
    id: "6",
    type: "meeting",
    customer: {
      name: "Robert Kim",
      initials: "RK"
    },
    date: "May 10, 2023",
    time: "1:00 PM",
    duration: "30 min",
    summary: "Quarterly review meeting",
    notes: "Robert mentioned that his team is growing and they might need to upgrade their subscription soon."
  }
];

function getInteractionIcon(type: InteractionData["type"]) {
  switch (type) {
    case "call":
      return <Phone className="h-4 w-4" />;
    case "email":
      return <MessageSquare className="h-4 w-4" />;
    case "meeting":
      return <Video className="h-4 w-4" />;
    case "message":
      return <MessageSquare className="h-4 w-4" />;
    default:
      return null;
  }
}

function getInteractionColor(type: InteractionData["type"]) {
  switch (type) {
    case "call":
      return "bg-green-500/10 text-green-600 hover:bg-green-500/20";
    case "email":
      return "bg-blue-500/10 text-blue-600 hover:bg-blue-500/20";
    case "meeting":
      return "bg-purple-500/10 text-purple-600 hover:bg-purple-500/20";
    case "message":
      return "bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20";
    default:
      return "bg-gray-500/10 text-gray-600 hover:bg-gray-500/20";
  }
}

export default function InteractionsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  
  const filteredInteractions = interactions.filter(interaction => 
    interaction.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    interaction.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
    interaction.notes?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <MainLayout>
      <PageContainer>
        <div className="flex flex-col space-y-2 mb-6">
          <h1 className="font-semibold">Interactions</h1>
          <p className="text-muted-foreground">Track all communications with your customers.</p>
        </div>
        
        <SectionContainer className="py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search interactions..."
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
                Add Interaction
              </Button>
            </div>
          </div>
          
          <div className="space-y-4">
            {filteredInteractions.map((interaction, index) => (
              <div 
                key={interaction.id}
                className="rounded-xl border bg-card p-5 shadow-card transition-all hover:shadow-lg animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10 border">
                      {interaction.customer.avatar ? (
                        <img src={interaction.customer.avatar} alt={interaction.customer.name} />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-muted text-xs font-medium">
                          {interaction.customer.initials}
                        </div>
                      )}
                    </Avatar>
                    
                    <div>
                      <h3 className="text-sm font-medium">{interaction.customer.name}</h3>
                      <p className="text-xs text-muted-foreground">{interaction.summary}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                    <Badge 
                      variant="secondary"
                      className={cn("text-xs flex items-center gap-1 capitalize", getInteractionColor(interaction.type))}
                    >
                      {getInteractionIcon(interaction.type)}
                      {interaction.type}
                      {interaction.duration && ` - ${interaction.duration}`}
                    </Badge>
                    
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Calendar className="mr-1 h-3.5 w-3.5" />
                      {interaction.date} at {interaction.time}
                    </div>
                    
                    <Button variant="ghost" size="sm" className="ml-auto h-8">View Details</Button>
                  </div>
                </div>
                
                {interaction.notes && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">Notes: </span>
                      {interaction.notes}
                    </p>
                  </div>
                )}
              </div>
            ))}
            
            {filteredInteractions.length === 0 && (
              <div className="py-12 text-center rounded-xl border bg-card">
                <p className="text-muted-foreground">No interactions found. Try a different search.</p>
              </div>
            )}
          </div>
        </SectionContainer>
      </PageContainer>
    </MainLayout>
  );
}
