
import { LucideIcon } from "lucide-react";

export interface LeadData {
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

export interface LeadInsights {
  qualityScore: number;
  predictedConversions: number;
  recommendations: { leadId: string; action: string }[];
  sourceDistribution: Record<string, number>;
  scoreDistribution: Record<string, number>;
}
