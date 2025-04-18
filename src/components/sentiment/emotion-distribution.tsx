import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell } from "recharts";
import { CustomerAnalysisData, Emotion } from "@/types/emotion";
import { Skeleton } from "@/components/ui/skeleton";

interface EmotionDistributionProps {
  customerAnalysis: CustomerAnalysisData[];
  isLoading: boolean;
}

export function EmotionDistribution({ customerAnalysis, isLoading }: EmotionDistributionProps) {
  // Calculate emotion distribution
  const getEmotionDistribution = () => {
    const emotions = customerAnalysis.map(c => c.dominantEmotion);
    const emotionCounts: Record<string, number> = {
      'joy': 0,
      'trust': 0,
      'surprise': 0,
      'neutral': 0,
      'sadness': 0,
      'fear': 0,
      'disgust': 0,
      'anger': 0,
      'frustration': 0
    };
    
    emotions.forEach(e => {
      emotionCounts[e] = (emotionCounts[e] || 0) + 1;
    });
    
    return Object.entries(emotionCounts).map(([emotion, count]) => ({
      emotion: emotion.charAt(0).toUpperCase() + emotion.slice(1),
      count,
      color: getEmotionColor(emotion as Emotion)
    }));
  };
  
  const getEmotionColor = (emotion: Emotion): string => {
    const colorMap: Record<Emotion, string> = {
      'joy': '#10b981',
      'trust': '#3b82f6',
      'surprise': '#a855f7',
      'neutral': '#6b7280',
      'sadness': '#6366f1',
      'fear': '#f59e0b',
      'disgust': '#f97316',
      'anger': '#ef4444',
      'frustration': '#ec4899'
    };
    
    return colorMap[emotion] || '#6b7280';
  };
  
  // Get customer examples for each emotion
  const getCustomerExamples = () => {
    const examples: Record<string, CustomerAnalysisData[]> = {};
    
    customerAnalysis.forEach(customer => {
      const emotion = customer.dominantEmotion;
      if (!examples[emotion]) {
        examples[emotion] = [];
      }
      
      if (examples[emotion].length < 3) {
        examples[emotion].push(customer);
      }
    });
    
    return examples;
  };
  
  const emotionData = getEmotionDistribution();
  const customerExamples = getCustomerExamples();
  
  // Get word frequencies across messages with a specific emotion
  const getWordFrequencies = (emotion: Emotion, maxWords = 15) => {
    const customersWithEmotion = customerAnalysis.filter(c => c.dominantEmotion === emotion);
    const messages = customersWithEmotion.map(c => c.lastMessage);
    
    // Simple word frequency counter
    const wordFrequencies: Record<string, number> = {};
    const stopWords = new Set(['i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 'herself', 'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves', 'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'a', 'an', 'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until', 'while', 'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don', 'should', 'now']);
    
    messages.forEach(message => {
      if (message) {
        const words = message.toLowerCase().match(/\b(\w+)\b/g) || [];
        words.forEach(word => {
          if (!stopWords.has(word) && word.length > 2) {
            wordFrequencies[word] = (wordFrequencies[word] || 0) + 1;
          }
        });
      }
    });
    
    // Sort by frequency and take top N
    return Object.entries(wordFrequencies)
      .sort((a, b) => b[1] - a[1])
      .slice(0, maxWords)
      .map(([word, count]) => ({ word, count }));
  };
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Emotion Distribution</CardTitle>
            <CardDescription>Distribution of emotions across all customer interactions</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="w-full h-96 rounded-md" />
            ) : (
              <div className="w-full h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={emotionData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="emotion" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" name="Number of Customers" fill="#8884d8">
                      {emotionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Common Words by Emotion</CardTitle>
            <CardDescription>Frequently used words in each emotional category</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="w-full h-72 rounded-md" />
            ) : (
              <div className="space-y-4">
                {['anger', 'joy', 'frustration', 'sadness', 'fear'].map((emotion) => {
                  const customers = customerExamples[emotion];
                  if (!customers || customers.length === 0) return null;
                  
                  const wordFrequencies = getWordFrequencies(emotion as Emotion, 5);
                  
                  return (
                    <div key={emotion} className="space-y-1">
                      <h4 className="text-sm font-medium">{emotion.charAt(0).toUpperCase() + emotion.slice(1)}</h4>
                      <div className="flex flex-wrap gap-2">
                        {wordFrequencies.map(({ word, count }) => (
                          <span 
                            key={word} 
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-muted"
                            style={{ 
                              opacity: Math.max(0.5, Math.min(1, count / 3)),
                              fontSize: `${Math.max(0.75, Math.min(1, count / 2))}rem`
                            }}
                          >
                            {word} ({count})
                          </span>
                        ))}
                        
                        {wordFrequencies.length === 0 && (
                          <span className="text-xs text-muted-foreground">No data available</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Emotion Insights</CardTitle>
            <CardDescription>Key takeaways from emotional analysis</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="w-full h-4 rounded-md" />
                <Skeleton className="w-full h-4 rounded-md" />
                <Skeleton className="w-3/4 h-4 rounded-md" />
              </div>
            ) : (
              <div className="space-y-4 text-sm">
                {emotionData.length > 0 ? (
                  <>
                    <p>
                      <span className="font-medium">Top emotion:</span>{' '}
                      {emotionData.sort((a, b) => b.count - a.count)[0].emotion} with {emotionData.sort((a, b) => b.count - a.count)[0].count} instances
                    </p>
                    
                    {emotionData.find(e => e.emotion.toLowerCase() === 'anger')?.count > 0 && (
                      <p>
                        <span className="font-medium">Anger signals:</span>{' '}
                        {emotionData.find(e => e.emotion.toLowerCase() === 'anger')?.count} customers showing anger require immediate attention
                      </p>
                    )}
                    
                    {emotionData.find(e => e.emotion.toLowerCase() === 'frustration')?.count > 0 && (
                      <p>
                        <span className="font-medium">Frustration indicators:</span>{' '}
                        {emotionData.find(e => e.emotion.toLowerCase() === 'frustration')?.count} customers expressing frustration need clarification
                      </p>
                    )}
                    
                    {emotionData.find(e => e.emotion.toLowerCase() === 'joy')?.count > 0 && (
                      <p>
                        <span className="font-medium">Positive signals:</span>{' '}
                        {emotionData.find(e => e.emotion.toLowerCase() === 'joy')?.count} customers showing joy indicate successful experiences
                      </p>
                    )}
                    
                    <div className="pt-2">
                      <h4 className="font-medium mb-1">Recommended Actions</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {emotionData.find(e => e.emotion.toLowerCase() === 'anger')?.count > 0 && (
                          <li>Prioritize customers showing anger for immediate resolution</li>
                        )}
                        {emotionData.find(e => e.emotion.toLowerCase() === 'frustration')?.count > 0 && (
                          <li>Provide clear explanations to frustrated customers</li>
                        )}
                        {emotionData.find(e => e.emotion.toLowerCase() === 'fear')?.count > 0 && (
                          <li>Reassure customers expressing fear or concern</li>
                        )}
                        {emotionData.find(e => e.emotion.toLowerCase() === 'joy')?.count > 0 && (
                          <li>Acknowledge and reinforce positive experiences</li>
                        )}
                      </ul>
                    </div>
                  </>
                ) : (
                  <p className="text-muted-foreground">
                    No emotion data available for analysis.
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
