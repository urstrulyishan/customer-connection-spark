
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { CheckCircle, Clock, MessageSquare } from "lucide-react";

interface ActivityItem {
  id: string;
  type: "message" | "task" | "meeting";
  customer: {
    name: string;
    avatar?: string;
    initials: string;
  };
  time: string;
  description: string;
}

const activities: ActivityItem[] = [
  {
    id: "1",
    type: "message",
    customer: {
      name: "Emma Thompson",
      initials: "ET",
    },
    time: "10 min ago",
    description: "Sent a follow-up email about the new proposal."
  },
  {
    id: "2",
    type: "task",
    customer: {
      name: "Michael Chen",
      initials: "MC",
    },
    time: "1 hour ago",
    description: "Completed onboarding for premium plan."
  },
  {
    id: "3",
    type: "meeting",
    customer: {
      name: "Sarah Williams",
      initials: "SW",
    },
    time: "2 hours ago",
    description: "Scheduled a product demo for next Tuesday."
  },
  {
    id: "4",
    type: "message",
    customer: {
      name: "David Rodriguez",
      initials: "DR",
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
    default:
      return "bg-gray-500";
  }
}

export function CustomerActivity() {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-card h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-medium">Recent Activity</h3>
        <button className="text-xs text-primary font-medium">View all</button>
      </div>
      
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div 
            key={activity.id}
            className={cn(
              "flex items-start space-x-3 pb-4 animate-fade-in",
              index !== activities.length - 1 && "border-b border-border"
            )}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <Avatar className="h-8 w-8 border">
              {activity.customer.avatar ? (
                <img src={activity.customer.avatar} alt={activity.customer.name} />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-muted text-xs font-medium">
                  {activity.customer.initials}
                </div>
              )}
            </Avatar>
            
            <div className="flex-1 space-y-1">
              <div className="flex items-center text-sm">
                <span className="font-medium">{activity.customer.name}</span>
                <span className="ml-auto text-xs text-muted-foreground">{activity.time}</span>
              </div>
              
              <p className="text-xs text-muted-foreground">{activity.description}</p>
              
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
