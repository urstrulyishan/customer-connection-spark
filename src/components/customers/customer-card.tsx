
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Mail, Phone, MoreHorizontal } from "lucide-react";

export interface CustomerData {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: "active" | "inactive" | "new";
  lastContact: string;
  avatar?: string;
  initials: string;
}

interface CustomerCardProps {
  customer: CustomerData;
  className?: string;
  style?: React.CSSProperties;
}

export function CustomerCard({ customer, className, style }: CustomerCardProps) {
  return (
    <div 
      className={cn(
        "group rounded-xl border bg-card p-5 shadow-card transition-all hover:shadow-lg hover:-translate-y-0.5",
        className
      )}
      style={style}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <Avatar className="h-12 w-12 border">
            {customer.avatar ? (
              <img src={customer.avatar} alt={customer.name} />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-muted text-sm font-medium">
                {customer.initials}
              </div>
            )}
          </Avatar>
          
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-medium">{customer.name}</h3>
              <Badge 
                variant={
                  customer.status === "active" 
                    ? "default" 
                    : customer.status === "new" 
                      ? "outline" 
                      : "secondary"
                }
                className={cn(
                  "text-xs px-2",
                  customer.status === "active" && "bg-green-500/10 text-green-600 hover:bg-green-500/20",
                  customer.status === "new" && "border-blue-500 text-blue-500 hover:bg-blue-500/10"
                )}
              >
                {customer.status}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{customer.company}</p>
          </div>
        </div>
        
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="mt-4 space-y-2">
        <div className="flex items-center text-sm">
          <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">{customer.email}</span>
        </div>
        
        <div className="flex items-center text-sm">
          <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">{customer.phone}</span>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Last contact: {customer.lastContact}</span>
        <div className="flex space-x-2">
          <Button size="sm" variant="outline" className="h-8 rounded-lg text-xs">Message</Button>
          <Button size="sm" className="h-8 rounded-lg text-xs">View</Button>
        </div>
      </div>
    </div>
  );
}
