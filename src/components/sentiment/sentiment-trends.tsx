
import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp } from "lucide-react";

interface SentimentTrendsProps {
  feedbackData: any[];
}

export function SentimentTrends({ feedbackData }: SentimentTrendsProps) {
  // Process data to create trend over time
  const trendsData = useMemo(() => {
    // Group by date
    const groupedByDate = feedbackData.reduce((acc: Record<string, any[]>, curr) => {
      // Format the date to YYYY-MM-DD
      const date = new Date(curr.date);
      const dateStr = date.toISOString().split('T')[0];
      
      if (!acc[dateStr]) {
        acc[dateStr] = [];
      }
      
      acc[dateStr].push(curr);
      return acc;
    }, {});
    
    // Calculate average sentiment score for each date
    const result = Object.entries(groupedByDate)
      .map(([date, items]) => {
        const positiveCount = items.filter(item => item.sentiment.sentiment === 'positive').length;
        const negativeCount = items.filter(item => item.sentiment.sentiment === 'negative').length;
        const neutralCount = items.filter(item => item.sentiment.sentiment === 'neutral').length;
        const total = items.length;
        
        const avgScore = items.reduce((sum, item) => sum + item.sentiment.score, 0) / total;
        
        return {
          date,
          avgScore: parseFloat(avgScore.toFixed(2)),
          positive: positiveCount,
          negative: negativeCount,
          neutral: neutralCount,
          total
        };
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    return result;
  }, [feedbackData]);

  // Formatting date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (trendsData.length < 2) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sentiment Trends</CardTitle>
          <CardDescription>Not enough data to show trends over time</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <TrendingUp className="h-12 w-12 mx-auto mb-3" />
            <p>At least two data points are needed to show trends</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Sentiment Trends Over Time</CardTitle>
            <CardDescription>How customer sentiment has changed over time</CardDescription>
          </div>
          <TrendingUp className="h-5 w-5 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ChartContainer config={{}}>
            <LineChart
              data={trendsData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDate}
              />
              <YAxis 
                domain={[-1, 1]} 
                tickFormatter={(value) => value.toFixed(1)}
              />
              <Tooltip 
                formatter={(value: any) => [value.toFixed(2), 'Avg Score']}
                labelFormatter={(label) => formatDate(label as string)}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="avgScore" 
                name="Sentiment Score" 
                stroke="#8884d8" 
                activeDot={{ r: 8 }} 
              />
            </LineChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}
