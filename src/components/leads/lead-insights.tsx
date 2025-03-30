
import { useState, useEffect } from "react";
import { LeadData, LeadInsights } from "@/types/leads";
import { getLeadsInsights } from "@/utils/aiAnalysisUtils";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Brain, Calendar, ChevronRight, Mail, PieChart as PieChartIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LeadInsightsProps {
  leads: LeadData[];
}

export function LeadInsights({ leads }: LeadInsightsProps) {
  const [insights, setInsights] = useState<LeadInsights | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate AI processing with a short delay
    setLoading(true);
    const timer = setTimeout(() => {
      const computedInsights = getLeadsInsights(leads);
      setInsights(computedInsights);
      setLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [leads]);

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 w-1/3 bg-muted rounded"></div>
          <div className="h-4 w-2/3 bg-muted rounded"></div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-28 w-full bg-muted rounded"></div>
          <div className="h-28 w-full bg-muted rounded"></div>
        </CardContent>
      </Card>
    );
  }

  if (!insights) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Lead Insights</CardTitle>
          <CardDescription>No data available for analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Add leads to generate AI insights.</p>
        </CardContent>
      </Card>
    );
  }

  // Prepare chart data
  const COLORS = ["#3b82f6", "#f97316", "#ef4444"];
  const sourceData = Object.entries(insights.sourceDistribution).map(([name, value]) => ({ name, value }));
  const scoreData = Object.entries(insights.scoreDistribution).map(([name, value]) => ({ name, value }));

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium">Lead Insights</CardTitle>
          <Brain className="h-5 w-5 text-primary" />
        </div>
        <CardDescription>AI-powered analysis of your leads data</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium">Lead Quality Score</h4>
            <span 
              className={cn(
                "text-sm font-medium",
                insights.qualityScore >= 70 ? "text-green-500" : 
                insights.qualityScore >= 50 ? "text-yellow-500" : "text-red-500"
              )}
            >
              {insights.qualityScore}/100
            </span>
          </div>
          <Progress 
            value={insights.qualityScore} 
            className={cn(
              insights.qualityScore >= 70 ? "text-green-500" : 
              insights.qualityScore >= 50 ? "text-yellow-500" : "text-red-500"
            )} 
          />
          <p className="text-xs text-muted-foreground mt-1">
            Based on lead scores, statuses and quality indicators
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col h-full">
            <h4 className="text-sm font-medium mb-2">Lead Source Distribution</h4>
            <div className="h-[150px]">
              <ChartContainer config={{}}>
                <PieChart margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                  <Pie
                    data={sourceData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {sourceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip>
                    <ChartTooltipContent />
                  </ChartTooltip>
                </PieChart>
              </ChartContainer>
            </div>
            <div className="mt-2 flex flex-wrap gap-2 justify-center">
              {sourceData.map((entry, index) => (
                <div key={`legend-${index}`} className="flex items-center text-xs">
                  <div 
                    className="w-2 h-2 mr-1 rounded-full" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }} 
                  />
                  <span>{entry.name}: {entry.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-medium">Key Predictions</h4>
            <div className="flex items-center text-sm space-x-2 p-2 bg-secondary/30 rounded-md">
              <PieChartIcon className="h-4 w-4 text-primary" />
              <span>Predicted conversions: <strong>{insights.predictedConversions}</strong></span>
            </div>
            
            <h4 className="text-sm font-medium pt-2">Lead Temperature</h4>
            <div className="flex gap-2">
              {scoreData.map((score, index) => (
                <Badge 
                  key={index} 
                  variant="outline" 
                  className={cn(
                    "flex items-center gap-1",
                    score.name === "hot" ? "text-red-500 border-red-200" : 
                    score.name === "warm" ? "text-yellow-500 border-yellow-200" : 
                    "text-blue-500 border-blue-200"
                  )}
                >
                  {score.name}: {score.value}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {insights.recommendations.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">AI Recommended Actions</h4>
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {insights.recommendations.slice(0, 3).map((rec, idx) => (
                <div 
                  key={idx} 
                  className="flex items-center justify-between p-2 text-sm border rounded-md"
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{rec.action}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button variant="ghost" size="sm" className="w-full text-xs">
          View Detailed Analysis
        </Button>
      </CardFooter>
    </Card>
  );
}
