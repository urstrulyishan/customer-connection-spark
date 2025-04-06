
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { CheckCircle, Clock, MessageSquare, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import { useCompany } from "@/contexts/CompanyContext";
import { Badge } from "@/components/ui/badge";
import { getSentimentColor } from "@/utils/sentimentAnalysisUtils";

interface SentimentResult {
  sentiment: 'positive' | 'negative' | 'neutral';
  score: number;
  confidence: number;
}

interface ActivityItem {
  id: string;
  type: "message" | "task" | "meeting" | "purchase" | "login" | "logout";
  customerId?: string;
  customerName: string;
  customerEmail?: string;
  timestamp: string;
  details?: string;
  feedback?: string;
  sentiment?: SentimentResult;
  customer?: {
    name: string;
    avatar?: string;
    initials: string;
  };
  time?: string;
  description?: string;
}

const sampleActivities: ActivityItem[] = [
  {
    id: "1",
    type: "message",
    customer: {
      name: "Ravi Verma",
      initials: "RV",
    },
    time: "10 min ago",
    description: "Sent a follow-up email about the new proposal."
  },
  {
    id: "2",
    type: "task",
    customer: {
      name: "Ananya Gupta",
      initials: "AG",
    },
    time: "1 hour ago",
    description: "Completed onboarding for premium plan."
  },
  {
    id: "3",
    type: "meeting",
    customer: {
      name: "Neha Kapoor",
      initials: "NK",
    },
    time: "2 hours ago",
    description: "Scheduled a product demo for next Tuesday."
  },
  {
    id: "4",
    type: "message",
    customer: {
      name: "Rajesh Kumar",
      initials: "RK",
    },
    time: "Yesterday",
    description: "Requested more information about pricing."
  },
];

function getActivityIcon(type: ActivityItem["type"]) {
  switch (type) {
    case "message":
      return <MessageSquare className="h-3 w-3" />;
    case "task":
      return <CheckCircle className="h-3 w-3" />;
    case "meeting":
      return <Clock className="h-3 w-3" />;
    case "purchase":
      return <ShoppingBag className="h-3 w-3" />;
    case "login":
    case "logout":
      return <Clock className="h-3 w-3" />;
    default:
      return null;
  }
}

function getActivityColor(type: ActivityItem["type"]) {
  switch (type) {
    case "message":
      return "bg-blue-500";
    case "task":
      return "bg-green-500";
    case "meeting":
      return "bg-purple-500";
    case "purchase":
      return "bg-amber-500";
    case "login":
      return "bg-cyan-500";
    case "logout":
      return "bg-slate-500";
    default:
      return "bg-gray-500";
  }
}

function getRelativeTime(timestamp: string): string {
  const now = new Date();
  const date = new Date(timestamp);
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return "just now";
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  } else if (diffInSeconds < 172800) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString();
  }
}

export function CustomerActivity() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const { currentCompany } = useCompany();
  
  useEffect(() => {
    const loadActivities = () => {
      if (!currentCompany?.id) return;
      
      const activitiesKey = `customer_activities_${currentCompany.id}`;
      const storedActivities = localStorage.getItem(activitiesKey);
      
      if (storedActivities) {
        const parsedActivities: ActivityItem[] = JSON.parse(storedActivities);
        // Transform the stored activities to match the component's format
        const formattedActivities = parsedActivities.map(activity => ({
          ...activity,
          customer: {
            name: activity.customerName,
            initials: activity.customerName.split(' ').map(name => name.charAt(0)).join('')
          },
          time: getRelativeTime(activity.timestamp),
          description: activity.details || `${activity.type} activity`
        }));
        
        setActivities(formattedActivities.length > 0 ? formattedActivities : sampleActivities);
      } else {
        setActivities(sampleActivities);
      }
    };
    
    // Load initially
    loadActivities();
    
    // Set up event listener for storage changes
    const handleStorageChange = () => {
      loadActivities();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Poll for changes every 2 seconds as a fallback
    const interval = setInterval(loadActivities, 2000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [currentCompany]);
  
  return (
    <div className="rounded-xl border bg-card p-5 shadow-card h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-medium">Recent Activity</h3>
        <button className="text-xs text-primary font-medium">View all</button>
      </div>
      
      <div className="space-y-4">
        {activities.slice(0, 4).map((activity, index) => (
          <div 
            key={activity.id}
            className={cn(
              "flex items-start space-x-3 pb-4 animate-fade-in",
              index !== activities.length - 1 && "border-b border-border"
            )}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <Avatar className="h-8 w-8 border">
              {activity.customer?.avatar ? (
                <img src={activity.customer.avatar} alt={activity.customer.name} />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-muted text-xs font-medium">
                  {activity.customer?.initials}
                </div>
              )}
            </Avatar>
            
            <div className="flex-1 space-y-1">
              <div className="flex items-center text-sm">
                <span className="font-medium">{activity.customer?.name}</span>
                <span className="ml-auto text-xs text-muted-foreground">{activity.time}</span>
              </div>
              
              <p className="text-xs text-muted-foreground">{activity.description}</p>
              
              {activity.feedback && (
                <div className="mt-1 text-xs text-muted-foreground italic">
                  "{activity.feedback}"
                  
                  {activity.sentiment && (
                    <Badge 
                      variant="outline" 
                      className={`ml-2 ${getSentimentColor(activity.sentiment.sentiment)}`}
                    >
                      {activity.sentiment.sentiment}
                    </Badge>
                  )}
                </div>
              )}
              
              <div className="flex items-center space-x-1">
                <div className={cn("rounded-full p-1 flex items-center justify-center", getActivityColor(activity.type))}>
                  {getActivityIcon(activity.type)}
                </div>
                <span className="text-xs capitalize">{activity.type}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
