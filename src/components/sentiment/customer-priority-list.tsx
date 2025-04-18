
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CustomerAnalysisData, Emotion } from "@/types/emotion";
import { EmotionFeedbackCard } from "./emotion-feedback-card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from "recharts";

interface CustomerPriorityListProps {
  customerAnalysis: CustomerAnalysisData[];
  isLoading: boolean;
  onFeedback: (
    customer: CustomerAnalysisData,
    correctedEmotion?: Emotion,
    correctedSentiment?: 'positive' | 'negative' | 'neutral'
  ) => void;
}

export function CustomerPriorityList({ customerAnalysis, isLoading, onFeedback }: CustomerPriorityListProps) {
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  
  const filteredCustomers = priorityFilter === 'all'
    ? customerAnalysis
    : customerAnalysis.filter(c => c.priorityCategory === priorityFilter);
  
  // Get priority category counts for chart
  const priorityCounts = {
    high: customerAnalysis.filter(c => c.priorityCategory === 'high').length,
    medium: customerAnalysis.filter(c => c.priorityCategory === 'medium').length,
    low: customerAnalysis.filter(c => c.priorityCategory === 'low').length,
  };
  
  const priorityData = [
    { category: 'High', count: priorityCounts.high, color: '#ef4444' },
    { category: 'Medium', count: priorityCounts.medium, color: '#f59e0b' },
    { category: 'Low', count: priorityCounts.low, color: '#10b981' },
  ];
  
  // Get emotion breakdown for each priority category
  const getEmotionsByPriority = () => {
    const result = [] as any[];
    
    ['high', 'medium', 'low'].forEach(priority => {
      const customersInCategory = customerAnalysis.filter(c => c.priorityCategory === priority);
      
      const emotions = ['anger', 'frustration', 'sadness', 'fear', 'disgust', 'surprise', 'neutral', 'trust', 'joy'];
      const emotionCounts = {} as Record<string, number>;
      
      emotions.forEach(emotion => {
        emotionCounts[emotion] = customersInCategory.filter(c => c.dominantEmotion === emotion).length;
      });
      
      result.push({
        priority,
        ...emotionCounts
      });
    });
    
    return result;
  };
  
  const priorityEmotionData = getEmotionsByPriority();
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Customer Priority Categories</CardTitle>
            <CardDescription>Distribution of customers by priority level</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="w-full h-80 rounded-md" />
            ) : (
              <div className="w-full h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={priorityData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" name="Number of Customers" fill="#8884d8">
                      {priorityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Emotions by Priority Level</CardTitle>
            <CardDescription>Distribution of emotions within each priority category</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="w-full h-80 rounded-md" />
            ) : (
              <div className="w-full h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={priorityEmotionData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="priority" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="anger" stackId="a" name="Anger" fill="#ef4444" />
                    <Bar dataKey="frustration" stackId="a" name="Frustration" fill="#ec4899" />
                    <Bar dataKey="sadness" stackId="a" name="Sadness" fill="#6366f1" />
                    <Bar dataKey="fear" stackId="a" name="Fear" fill="#f59e0b" />
                    <Bar dataKey="disgust" stackId="a" name="Disgust" fill="#f97316" />
                    <Bar dataKey="surprise" stackId="a" name="Surprise" fill="#a855f7" />
                    <Bar dataKey="neutral" stackId="a" name="Neutral" fill="#6b7280" />
                    <Bar dataKey="trust" stackId="a" name="Trust" fill="#3b82f6" />
                    <Bar dataKey="joy" stackId="a" name="Joy" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div>
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Customers by Priority</CardTitle>
            <CardDescription>Detailed list of customers sorted by priority</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" value={priorityFilter} onValueChange={(v) => setPriorityFilter(v as any)}>
              <TabsList className="grid grid-cols-4 mb-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="high">High</TabsTrigger>
                <TabsTrigger value="medium">Medium</TabsTrigger>
                <TabsTrigger value="low">Low</TabsTrigger>
              </TabsList>
              
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="w-full h-32 rounded-md" />
                  ))}
                </div>
              ) : filteredCustomers.length > 0 ? (
                <div className="space-y-4 max-h-[800px] overflow-y-auto pr-1">
                  {filteredCustomers.map(customer => (
                    <EmotionFeedbackCard
                      key={`${customer.customerId}-${customer.timestamp}`}
                      customer={customer}
                      onFeedback={onFeedback}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No customers in this priority category.
                </div>
              )}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
