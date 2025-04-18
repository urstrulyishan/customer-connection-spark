
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomerAnalysisData } from "@/types/emotion";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from "recharts";

interface SentimentTrendsProps {
  customerAnalysis: CustomerAnalysisData[];
  isLoading: boolean;
}

export function SentimentTrends({ customerAnalysis, isLoading }: SentimentTrendsProps) {
  // Get daily trends data
  const getDailyTrendsData = () => {
    // Group by date and calculate average sentiment scores
    const dateGroups = new Map<string, CustomerAnalysisData[]>();
    
    customerAnalysis.forEach(analysis => {
      // Parse and format the timestamp to just get the date part
      const date = new Date(analysis.timestamp).toISOString().split('T')[0];
      if (!dateGroups.has(date)) {
        dateGroups.set(date, []);
      }
      dateGroups.get(date)?.push(analysis);
    });
    
    // Calculate averages for each date
    const result = Array.from(dateGroups.entries()).map(([date, items]) => {
      const totalSentiment = items.reduce((sum, item) => sum + item.sentimentScore, 0);
      const avgSentiment = totalSentiment / items.length;
      
      // Count emotions
      const emotions = {
        positive: items.filter(item => item.sentiment === 'positive').length,
        neutral: items.filter(item => item.sentiment === 'neutral').length,
        negative: items.filter(item => item.sentiment === 'negative').length
      };
      
      return {
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        avgSentiment: parseFloat(avgSentiment.toFixed(2)),
        sentimentScore: parseFloat(avgSentiment.toFixed(2)),
        count: items.length,
        ...emotions
      };
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    return result;
  };
  
  // Get customer feedback count by day
  const getFeedbackVolumeData = () => {
    // Count feedback by date
    const dateGroups = new Map<string, number>();
    
    customerAnalysis.forEach(analysis => {
      // Parse and format the timestamp to just get the date part
      const date = new Date(analysis.timestamp).toISOString().split('T')[0];
      dateGroups.set(date, (dateGroups.get(date) || 0) + 1);
    });
    
    // Format for chart
    const result = Array.from(dateGroups.entries()).map(([date, count]) => {
      return {
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        count
      };
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    return result;
  };
  
  // Get weekly emotion trends
  const getWeeklyEmotionTrends = () => {
    // Group by week and count emotions
    const weekGroups = new Map<string, CustomerAnalysisData[]>();
    
    customerAnalysis.forEach(analysis => {
      // Get the week number
      const date = new Date(analysis.timestamp);
      const weekNumber = getWeekNumber(date);
      const weekKey = `${date.getFullYear()}-W${weekNumber}`;
      
      if (!weekGroups.has(weekKey)) {
        weekGroups.set(weekKey, []);
      }
      weekGroups.get(weekKey)?.push(analysis);
    });
    
    // Count emotions by week
    const result = Array.from(weekGroups.entries()).map(([weekKey, items]) => {
      // Count dominant emotions
      const emotionCounts: Record<string, number> = {};
      items.forEach(item => {
        emotionCounts[item.dominantEmotion] = (emotionCounts[item.dominantEmotion] || 0) + 1;
      });
      
      // Get week string for display
      const [year, week] = weekKey.split('-W');
      const weekLabel = `Week ${week}`;
      
      return {
        week: weekLabel,
        count: items.length,
        ...emotionCounts
      };
    }).sort((a, b) => a.week.localeCompare(b.week));
    
    return result;
  };
  
  // Helper to get week number
  const getWeekNumber = (date: Date): number => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };
  
  const sentimentTrendsData = getDailyTrendsData();
  const feedbackVolumeData = getFeedbackVolumeData();
  const weeklyEmotionData = getWeeklyEmotionTrends();
  
  return (
    <div className="grid grid-cols-1 gap-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Sentiment Score Trends</CardTitle>
            <CardDescription>Average sentiment scores over time</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="w-full h-72 rounded-md" />
            ) : sentimentTrendsData.length > 0 ? (
              <div className="w-full h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={sentimentTrendsData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 1]} />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="sentimentScore" 
                      name="Avg. Sentiment Score" 
                      stroke="#3b82f6" 
                      activeDot={{ r: 8 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex items-center justify-center h-72 text-muted-foreground">
                Not enough data to show trends
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Feedback Volume</CardTitle>
            <CardDescription>Number of customer interactions by date</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="w-full h-72 rounded-md" />
            ) : feedbackVolumeData.length > 0 ? (
              <div className="w-full h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={feedbackVolumeData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="count" 
                      name="Interactions" 
                      stroke="#8884d8" 
                      fill="#8884d8" 
                      fillOpacity={0.3} 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex items-center justify-center h-72 text-muted-foreground">
                Not enough data to show volume trends
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Sentiment Distribution Over Time</CardTitle>
          <CardDescription>Daily breakdown of positive, neutral and negative sentiments</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="w-full h-72 rounded-md" />
          ) : sentimentTrendsData.length > 0 ? (
            <div className="w-full h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={sentimentTrendsData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="positive" name="Positive" stackId="a" fill="#10b981" />
                  <Bar dataKey="neutral" name="Neutral" stackId="a" fill="#6b7280" />
                  <Bar dataKey="negative" name="Negative" stackId="a" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex items-center justify-center h-72 text-muted-foreground">
              Not enough data to show sentiment distribution
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Weekly Emotion Trends</CardTitle>
          <CardDescription>Distribution of emotions by week</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="w-full h-96 rounded-md" />
          ) : weeklyEmotionData.length > 0 ? (
            <div className="w-full h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={weeklyEmotionData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="joy" name="Joy" stackId="a" fill="#10b981" />
                  <Bar dataKey="trust" name="Trust" stackId="a" fill="#3b82f6" />
                  <Bar dataKey="surprise" name="Surprise" stackId="a" fill="#a855f7" />
                  <Bar dataKey="neutral" name="Neutral" stackId="a" fill="#6b7280" />
                  <Bar dataKey="sadness" name="Sadness" stackId="a" fill="#6366f1" />
                  <Bar dataKey="fear" name="Fear" stackId="a" fill="#f59e0b" />
                  <Bar dataKey="disgust" name="Disgust" stackId="a" fill="#f97316" />
                  <Bar dataKey="frustration" name="Frustration" stackId="a" fill="#ec4899" />
                  <Bar dataKey="anger" name="Anger" stackId="a" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex items-center justify-center h-96 text-muted-foreground">
              Not enough data to show weekly emotion trends
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
