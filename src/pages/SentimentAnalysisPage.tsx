
import { PageContainer, SectionContainer } from "@/components/ui/container";
import { MainLayout } from "@/layouts/main-layout";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { analyzeSentiment, SentimentResult, getSentimentColor } from "@/utils/sentimentAnalysisUtils";
import { ChartContainer } from "@/components/ui/chart";
import { BarChart, Bar, PieChart, Pie, Cell, Tooltip, Legend, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, BarChart3, PieChart as PieChartIcon, TrendingUp } from "lucide-react";
import { useCompany } from "@/contexts/CompanyContext";
import { useNavigate } from "react-router-dom";
import { SentimentSummary } from "@/components/sentiment/sentiment-summary";
import { SentimentTrends } from "@/components/sentiment/sentiment-trends";
import { WordCloudChart } from "@/components/sentiment/word-cloud-chart";

export default function SentimentAnalysisPage() {
  const [feedbackData, setFeedbackData] = useState<any[]>([]);
  const [sentimentSummary, setSentimentSummary] = useState({
    positive: 0,
    negative: 0,
    neutral: 0,
    total: 0,
    averageScore: 0
  });
  const [loading, setLoading] = useState(true);
  const { currentCompany } = useCompany();
  const navigate = useNavigate();

  // Colors for charts
  const COLORS = ["#22c55e", "#ef4444", "#3b82f6"];

  useEffect(() => {
    // Function to load feedback data from purchases
    const loadFeedbackData = () => {
      setLoading(true);
      
      if (!currentCompany?.id) {
        const storedCompany = localStorage.getItem("currentCompany");
        if (!storedCompany) {
          setLoading(false);
          return;
        }
      }
      
      const companyId = currentCompany?.id || JSON.parse(localStorage.getItem("currentCompany") || "{}").id;
      const purchasesKey = `purchases_${companyId}`;
      const activitiesKey = `customer_activities_${companyId}`;
      
      // Get purchases with feedback
      const storedPurchases = localStorage.getItem(purchasesKey);
      const purchases = storedPurchases ? JSON.parse(storedPurchases) : [];
      
      // Get customer activities with feedback
      const storedActivities = localStorage.getItem(activitiesKey);
      const activities = storedActivities ? JSON.parse(storedActivities) : [];
      
      // Combine all feedback data with its source
      const combinedFeedback = [
        ...purchases
          .filter((p: any) => p.feedback)
          .map((p: any) => ({
            id: p.id,
            text: p.feedback,
            source: 'purchase',
            customer: p.customer,
            date: p.date,
            sentiment: p.sentiment || analyzeSentiment(p.feedback)
          })),
        ...activities
          .filter((a: any) => a.feedback)
          .map((a: any) => ({
            id: a.id,
            text: a.feedback,
            source: a.type,
            customer: a.customerName,
            date: a.timestamp,
            sentiment: a.sentiment || analyzeSentiment(a.feedback)
          }))
      ];
      
      // Process the data
      setFeedbackData(combinedFeedback);
      
      // Calculate sentiment summary
      if (combinedFeedback.length > 0) {
        const positive = combinedFeedback.filter(item => item.sentiment.sentiment === 'positive').length;
        const negative = combinedFeedback.filter(item => item.sentiment.sentiment === 'negative').length;
        const neutral = combinedFeedback.filter(item => item.sentiment.sentiment === 'neutral').length;
        const total = combinedFeedback.length;
        
        const totalScore = combinedFeedback.reduce((sum, item) => sum + item.sentiment.score, 0);
        const averageScore = totalScore / total;
        
        setSentimentSummary({
          positive,
          negative,
          neutral,
          total,
          averageScore
        });
      }
      
      setLoading(false);
    };
    
    // Load data initially
    loadFeedbackData();
    
    // Set up storage event listener
    const handleStorageChange = () => {
      loadFeedbackData();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Cleanup
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [currentCompany]);

  const sentimentData = [
    { name: "Positive", value: sentimentSummary.positive },
    { name: "Negative", value: sentimentSummary.negative },
    { name: "Neutral", value: sentimentSummary.neutral }
  ];

  // Sample source distribution
  const sourceData = feedbackData.reduce((acc: Record<string, number>, curr) => {
    acc[curr.source] = (acc[curr.source] || 0) + 1;
    return acc;
  }, {});
  
  const sourceChartData = Object.entries(sourceData).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value
  }));

  if (loading) {
    return (
      <MainLayout>
        <PageContainer>
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-1/4 bg-muted rounded"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="h-40 bg-muted rounded"></div>
              <div className="h-40 bg-muted rounded"></div>
              <div className="h-40 bg-muted rounded"></div>
            </div>
            <div className="h-80 bg-muted rounded"></div>
          </div>
        </PageContainer>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <PageContainer>
        <div className="flex flex-col space-y-2 mb-6">
          <h1 className="font-semibold">Sentiment Analysis Dashboard</h1>
          <p className="text-muted-foreground">Analyze customer sentiment across interactions and purchases.</p>
        </div>

        {feedbackData.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No Feedback Data Available</CardTitle>
              <CardDescription>
                Customer feedback data is required to generate sentiment analysis.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-center text-muted-foreground mb-6">
                Try the IshanTech demo to generate sample feedback data for sentiment analysis.
              </p>
              <Button onClick={() => navigate('/ishantech-demo')}>Go to IshanTech Demo</Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <SectionContainer>
              <SentimentSummary 
                positive={sentimentSummary.positive}
                negative={sentimentSummary.negative}
                neutral={sentimentSummary.neutral}
                total={sentimentSummary.total}
                averageScore={sentimentSummary.averageScore}
              />
            </SectionContainer>

            <SectionContainer className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Sentiment Distribution</CardTitle>
                    <PieChartIcon className="h-4 w-4 text-primary" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px]">
                    <ChartContainer config={{}}>
                      <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                        <Pie
                          data={sentimentData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {sentimentData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ChartContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Feedback Source</CardTitle>
                    <BarChart3 className="h-4 w-4 text-primary" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px]">
                    <ChartContainer config={{}}>
                      <BarChart data={sourceChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#8884d8" />
                      </BarChart>
                    </ChartContainer>
                  </div>
                </CardContent>
              </Card>
            </SectionContainer>

            <SectionContainer className="mt-6">
              <SentimentTrends feedbackData={feedbackData} />
            </SectionContainer>

            <SectionContainer className="mt-6">
              <WordCloudChart feedbackData={feedbackData} />
            </SectionContainer>

            <SectionContainer className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Recent Feedback</CardTitle>
                  <CardDescription>Most recent customer feedback with sentiment analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-[400px] overflow-y-auto">
                    {feedbackData.slice(0, 10).map((item) => (
                      <div key={item.id} className="border rounded-lg p-3">
                        <div className="flex justify-between mb-1">
                          <span className="font-medium">{item.customer}</span>
                          <Badge className={getSentimentColor(item.sentiment.sentiment)}>
                            {item.sentiment.sentiment.charAt(0).toUpperCase() + item.sentiment.sentiment.slice(1)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground italic my-1">"{item.text}"</p>
                        <div className="flex justify-between text-xs text-muted-foreground mt-2">
                          <span>Source: {item.source.charAt(0).toUpperCase() + item.source.slice(1)}</span>
                          <span>{new Date(item.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </SectionContainer>
          </>
        )}
      </PageContainer>
    </MainLayout>
  );
}
