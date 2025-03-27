
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: {
    value: number;
    trend: "up" | "down" | "neutral";
  };
  className?: string;
}

export function MetricCard({ title, value, icon: Icon, change, className }: MetricCardProps) {
  const MotionIcon = motion(Icon);
  
  return (
    <div 
      className={cn(
        "group relative overflow-hidden rounded-xl border bg-card p-5 shadow-card transition-all hover:shadow-lg hover:-translate-y-0.5",
        className
      )}
    >
      <div className="flex flex-col space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">{title}</span>
          <div className="rounded-full bg-primary/10 p-2 text-primary">
            <MotionIcon 
              className="h-4 w-4" 
              whileHover={{ scale: 1.2 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
        
        <div className="flex items-end justify-between">
          <div className="flex flex-col">
            <span className="text-2xl font-semibold tracking-tight">{value}</span>
            
            {change && (
              <div className="flex items-center space-x-1 text-xs">
                <span
                  className={cn(
                    "font-medium",
                    change.trend === "up" && "text-green-500",
                    change.trend === "down" && "text-red-500",
                    change.trend === "neutral" && "text-muted-foreground"
                  )}
                >
                  {change.value > 0 && "+"}
                  {change.value}%
                </span>
                <span className="text-muted-foreground">vs. last month</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="absolute -right-2 -top-2 h-24 w-24 rounded-full bg-primary/5 opacity-0 transition-opacity group-hover:opacity-100" />
    </div>
  );
}
