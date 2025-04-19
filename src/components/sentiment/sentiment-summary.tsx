import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomerAnalysisData, Emotion } from "@/types/emotion";
import { EmotionFeedbackCard } from "./emotion-feedback-card";
import { Skeleton } from "@/components/ui/skeleton";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { getAllFeedback, getAllAnalyzedTexts } from '@/utils/emotionAnalysisUtils';
import { format } from 'date-fns';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface SentimentSummaryProps {
  customerAnalysis: CustomerAnalysisData[];
  isLoading: boolean;
  onFeedback: (
    customer: CustomerAnalysisData,
    correctedEmotion?: Emotion,
    correctedSentiment?: 'positive' | 'negative' | 'neutral'
  ) => void;
}

export function SentimentSummary({ customerAnalysis, isLoading, onFeedback }: SentimentSummaryProps) {
  const [showAllCommentsDialog, setShowAllCommentsDialog] = useState(false);
  const [showAllFeedbackDialog, setShowAllFeedbackDialog] = useState(false);
  
  const sentimentCounts = {
    positive: customerAnalysis.filter(c => c.sentiment === 'positive').length,
    neutral: customerAnalysis.filter(c => c.sentiment === 'neutral').length,
    negative: customerAnalysis.filter(c => c.sentiment === 'negative').length,
  };
  
  const pieData = [
    { name: 'Positive', value: sentimentCounts.positive, color: '#10b981' },
    { name: 'Neutral', value: sentimentCounts.neutral, color: '#6b7280' },
    { name: 'Negative', value: sentimentCounts.negative, color: '#ef4444' },
  ];
  
  const priorityCounts = {
    high: customerAnalysis.filter(c => c.priorityCategory === 'high').length,
    medium: customerAnalysis.filter(c => c.priorityCategory === 'medium').length,
    low: customerAnalysis.filter(c => c.priorityCategory === 'low').length,
  };
  
  const priorityPieData = [
    { name: 'High', value: priorityCounts.high, color: '#ef4444' },
    { name: 'Medium', value: priorityCounts.medium, color: '#f59e0b' },
    { name: 'Low', value: priorityCounts.low, color: '#10b981' },
  ];
  
  // Add new dialog for all feedback
  const renderAllFeedbackDialog = () => {
    return (
      <Dialog open={showAllFeedbackDialog} onOpenChange={setShowAllFeedbackDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>All Customer Feedback</DialogTitle>
            <DialogDescription>
              Showing all customer feedback with sentiment analysis results
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="h-[500px] mt-4">
            <div className="space-y-4">
              {customerAnalysis.map(customer => (
                <EmotionFeedbackCard
                  key={`${customer.customerId}-${customer.timestamp}`}
                  customer={customer}
                  onFeedback={onFeedback}
                />
              ))}
              
              {customerAnalysis.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No customer feedback available.
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    );
  };

  const renderFeedbackStatus = () => {
    if (isLoading) {
      return (
        <div className="space-y-2">
          <Skeleton className="w-full h-4 rounded-md" />
          <Skeleton className="w-full h-4 rounded-md" />
          <Skeleton className="w-3/4 h-4 rounded-md" />
        </div>
      );
    }

    try {
      const allFeedback = getAllFeedback();
      const totalFeedback = allFeedback.length;
      const correctPredictions = allFeedback.filter((f: any) => f.wasCorrect).length;
      const accuracy = totalFeedback > 0 ? (correctPredictions / totalFeedback * 100).toFixed(1) : 'N/A';
      
      if (totalFeedback === 0) {
        return (
          <p className="text-sm text-muted-foreground">
            No feedback has been provided yet. Help improve the model by providing feedback on the predictions.
          </p>
        );
      }
      
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm">
              <span className="font-medium">Total feedback entries:</span> {totalFeedback}
            </p>
            <p className="text-sm">
              <span className="font-medium">Correct predictions:</span> {correctPredictions}
            </p>
            <p className="text-sm">
              <span className="font-medium">Current accuracy:</span> {accuracy}%
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-medium">Recent Feedback</h4>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowAllCommentsDialog(true)}
              >
                View All
              </Button>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {allFeedback.slice(0, 5).map((feedback: any, index: number) => (
                <div key={index} className="text-sm p-2 bg-muted rounded-md">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      {feedback.originalText && (
                        <p className="text-xs italic text-muted-foreground">"{feedback.originalText.substring(0, 50)}{feedback.originalText.length > 50 ? '...' : ''}"</p>
                      )}
                      {feedback.correctedEmotion && (
                        <p>
                          <span className="font-medium">Corrected emotion:</span>{' '}
                          {feedback.correctedEmotion}
                        </p>
                      )}
                      {feedback.correctedSentiment && (
                        <p>
                          <span className="font-medium">Corrected sentiment:</span>{' '}
                          {feedback.correctedSentiment}
                        </p>
                      )}
                      {feedback.notes && (
                        <p className="text-xs text-muted-foreground">
                          {feedback.notes}
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(feedback.timestamp), 'MMM d, yyyy HH:mm')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground mt-2">
            The model learns from your feedback to improve prediction accuracy over time.
          </p>
        </div>
      );
    } catch (error) {
      return (
        <p className="text-sm text-muted-foreground">
          Error loading feedback data. Please try again.
        </p>
      );
    }
  };
  
  // All Comments Dialog
  const renderAllCommentsDialog = () => {
    const allTexts = getAllAnalyzedTexts();
    
    return (
      <Dialog open={showAllCommentsDialog} onOpenChange={setShowAllCommentsDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>All Analyzed Comments</DialogTitle>
            <DialogDescription>
              Showing all previously analyzed comments and their sentiment analysis results
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="h-[500px] mt-4">
            <div className="space-y-3 pr-4">
              {allTexts.map((item, index) => (
                <Card key={index} className="p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-2">
                        <Badge className={
                          item.sentiment === 'positive' ? 'bg-green-100 text-green-800' : 
                          item.sentiment === 'negative' ? 'bg-red-100 text-red-800' : 
                          'bg-gray-100 text-gray-800'
                        }>
                          {item.sentiment}
                        </Badge>
                        <Badge className="bg-blue-100 text-blue-800">
                          {item.emotion}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(item.timestamp), 'MMM d, yyyy HH:mm')}
                      </span>
                    </div>
                    <p className="text-sm">
                      {item.text}
                    </p>
                  </div>
                </Card>
              ))}
              
              {allTexts.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No analyzed comments available.
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    );
  };
  
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Sentiment Distribution</CardTitle>
              <CardDescription>Overall sentiment across all customer interactions</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="w-full h-64 flex items-center justify-center">
                  <Skeleton className="w-full h-full rounded-md" />
                </div>
              ) : (
                <div className="w-full h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Priority Distribution</CardTitle>
              <CardDescription>Customer prioritization based on sentiment & interactions</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="w-full h-64 flex items-center justify-center">
                  <Skeleton className="w-full h-full rounded-md" />
                </div>
              ) : (
                <div className="w-full h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={priorityPieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {priorityPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Recent Customer Feedback</CardTitle>
                <CardDescription>Most recent customer interactions with sentiment analysis</CardDescription>
              </div>
              <Button 
                variant="outline"
                size="sm"
                onClick={() => setShowAllFeedbackDialog(true)}
              >
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="w-full h-32 rounded-md" />
                ))}
              </div>
            ) : customerAnalysis.length > 0 ? (
              <div className="space-y-4">
                {customerAnalysis.slice(0, 3).map(customer => (
                  <EmotionFeedbackCard
                    key={`${customer.customerId}-${customer.timestamp}`}
                    customer={customer}
                    onFeedback={onFeedback}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No customer feedback data available.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Key Insights</CardTitle>
            <CardDescription>AI-generated insights from sentiment data</CardDescription>
          </CardHeader>
          <CardContent>
            {
              isLoading ? (
              <div className="space-y-2">
                <Skeleton className="w-full h-4 rounded-md" />
                <Skeleton className="w-full h-4 rounded-md" />
                <Skeleton className="w-full h-4 rounded-md" />
                <Skeleton className="w-3/4 h-4 rounded-md" />
              </div>
            ) : customerAnalysis.length > 0 ? (
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-1">Sentiment Overview</h4>
                  <p className="text-sm text-muted-foreground">
                    {sentimentCounts.positive > sentimentCounts.negative 
                      ? `Overall positive sentiment (${sentimentCounts.positive} positive vs ${sentimentCounts.negative} negative).` 
                      : `Attention needed: ${sentimentCounts.negative} negative interactions detected.`}
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-1">Priority Breakdown</h4>
                  <p className="text-sm text-muted-foreground">
                    {priorityCounts.high > 0 
                      ? `${priorityCounts.high} high-priority customers require immediate attention.`
                      : `No high-priority customers detected. ${priorityCounts.medium} medium and ${priorityCounts.low} low priority customers.`}
                  </p>
                </div>
                
                {(() => {
                  const emotions = customerAnalysis.map(c => c.dominantEmotion);
                  const emotionCounts: Record<string, number> = {};
                  emotions.forEach(e => {
                    emotionCounts[e] = (emotionCounts[e] || 0) + 1;
                  });
                  
                  const topEmotion = Object.entries(emotionCounts).sort((a, b) => b[1] - a[1])[0];
                  
                  if (topEmotion) {
                    return (
                      <div>
                        <h4 className="font-medium mb-1">Dominant Emotion</h4>
                        <p className="text-sm text-muted-foreground">
                          {`${topEmotion[0].charAt(0).toUpperCase() + topEmotion[0].slice(1)} is the most common emotion (${topEmotion[1]} instances).`}
                        </p>
                      </div>
                    );
                  }
                  return null;
                })()}
                
                {(() => {
                  const languages = customerAnalysis.map(c => c.language);
                  const uniqueLanguages = [...new Set(languages)];
                  
                  if (uniqueLanguages.length > 1) {
                    const languageNames: Record<string, string> = {
                      'en': 'English',
                      'es': 'Spanish',
                      'hi': 'Hindi',
                      'other': 'other languages'
                    };
                    
                    return (
                      <div>
                        <h4 className="font-medium mb-1">Multilingual Insights</h4>
                        <p className="text-sm text-muted-foreground">
                          {`Customer feedback in ${uniqueLanguages.length} languages: ${uniqueLanguages.map(l => languageNames[l] || l).join(', ')}.`}
                        </p>
                      </div>
                    );
                  }
                  return null;
                })()}
                
                {/* Action items */}
                <div>
                  <h4 className="font-medium mb-1">Recommended Actions</h4>
                  <ul className="text-sm text-muted-foreground list-disc list-inside">
                    {priorityCounts.high > 0 && (
                      <li>Address {priorityCounts.high} high-priority customers immediately</li>
                    )}
                    {customerAnalysis.filter(c => c.dominantEmotion === 'anger').length > 0 && (
                      <li>Manage {customerAnalysis.filter(c => c.dominantEmotion === 'anger').length} customers expressing anger</li>
                    )}
                    {customerAnalysis.filter(c => c.dominantEmotion === 'frustration').length > 0 && (
                      <li>Clarify issues for {customerAnalysis.filter(c => c.dominantEmotion === 'frustration').length} frustrated customers</li>
                    )}
                    {customerAnalysis.filter(c => c.language !== 'en').length > 0 && (
                      <li>Support {customerAnalysis.filter(c => c.language !== 'en').length} non-English speaking customers</li>
                    )}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No data available for insights.
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Feedback Status</CardTitle>
            <CardDescription>Model improvement through human feedback</CardDescription>
          </CardHeader>
          <CardContent>
            {renderFeedbackStatus()}
          </CardContent>
        </Card>
      </div>
      
      {/* Dialog to show all previous comments */}
      {renderAllCommentsDialog()}
      {renderAllFeedbackDialog()}
    </div>
  );
}
