import { useState, useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CustomerAnalysisData, Emotion } from "@/types/emotion";
import { CheckCircle2, XCircle } from "lucide-react";

interface EmotionFeedbackCardProps {
  customer: CustomerAnalysisData;
  onFeedback: (
    customer: CustomerAnalysisData,
    correctedEmotion?: Emotion,
    correctedSentiment?: 'positive' | 'negative' | 'neutral'
  ) => void;
}

export function EmotionFeedbackCard({ customer, onFeedback }: EmotionFeedbackCardProps) {
  const [showFeedback, setShowFeedback] = useState(false);
  const [correctedEmotion, setCorrectedEmotion] = useState<Emotion | undefined>(undefined);
  const [correctedSentiment, setCorrectedSentiment] = useState<'positive' | 'negative' | 'neutral' | undefined>(undefined);
  
  // Reset feedback state when component unmounts or page refreshes
  useEffect(() => {
    // This will ensure that feedback UI state is reset on refresh
    const handleBeforeUnload = () => {
      setShowFeedback(false);
      setCorrectedEmotion(undefined);
      setCorrectedSentiment(undefined);
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);
  
  const getEmotionColor = (emotion: Emotion): string => {
    const colorMap: Record<Emotion, string> = {
      'joy': 'bg-green-100 text-green-800 hover:bg-green-200',
      'trust': 'bg-blue-100 text-blue-800 hover:bg-blue-200',
      'surprise': 'bg-purple-100 text-purple-800 hover:bg-purple-200',
      'neutral': 'bg-gray-100 text-gray-800 hover:bg-gray-200',
      'sadness': 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200',
      'fear': 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
      'disgust': 'bg-orange-100 text-orange-800 hover:bg-orange-200',
      'anger': 'bg-red-100 text-red-800 hover:bg-red-200',
      'frustration': 'bg-pink-100 text-pink-800 hover:bg-pink-200'
    };
    
    return colorMap[emotion] || 'bg-gray-100 text-gray-800 hover:bg-gray-200';
  };
  
  const getSentimentColor = (sentiment: 'positive' | 'negative' | 'neutral'): string => {
    if (sentiment === 'positive') return 'bg-green-100 text-green-800 hover:bg-green-200';
    if (sentiment === 'negative') return 'bg-red-100 text-red-800 hover:bg-red-200';
    return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
  };
  
  const getPriorityColor = (priority: 'high' | 'medium' | 'low'): string => {
    if (priority === 'high') return 'bg-red-100 text-red-800';
    if (priority === 'medium') return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };
  
  const getLanguageName = (code: string): string => {
    const languages: Record<string, string> = {
      'en': 'English',
      'es': 'Spanish',
      'hi': 'Hindi',
      'other': 'Other'
    };
    return languages[code] || code;
  };
  
  const emotions: Emotion[] = [
    'joy', 'trust', 'surprise', 'neutral', 'sadness', 'fear', 'disgust', 'anger', 'frustration'
  ];
  
  const sentiments = ['positive', 'neutral', 'negative'];
  
  const handleSubmitFeedback = () => {
    onFeedback(customer, correctedEmotion, correctedSentiment as any);
    // Reset UI state after submission
    setShowFeedback(false);
    setCorrectedEmotion(undefined);
    setCorrectedSentiment(undefined);
  };
  
  const handleMarkCorrect = () => {
    onFeedback(customer); // No corrections
    setShowFeedback(false);
  };
  
  // Truncate message if it's too long
  const truncateMessage = (message: string, maxLength = 120) => {
    return message.length > maxLength 
      ? message.substring(0, maxLength) + '...' 
      : message;
  };
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <div className="rounded-full w-8 h-8 bg-accent flex items-center justify-center">
              <span className="text-xs font-medium">{customer.customerInitials}</span>
            </div>
            <CardTitle className="text-base">{customer.customerName}</CardTitle>
          </div>
          <Badge className={getPriorityColor(customer.priorityCategory)}>
            {customer.priorityCategory.charAt(0).toUpperCase() + customer.priorityCategory.slice(1)} Priority
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="text-sm pb-2">
        <div className="space-y-2">
          <div className="text-muted-foreground">
            <span className="font-medium text-foreground">Message:</span> {truncateMessage(customer.lastMessage)}
          </div>
          
          <div className="space-y-1">
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm font-medium text-muted-foreground">Language:</span>
              <Badge variant="outline">
                {getLanguageName(customer.language)}
              </Badge>
            </div>
          
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm font-medium text-muted-foreground">Emotion:</span>
              <Badge className={getEmotionColor(customer.dominantEmotion)}>
                {customer.dominantEmotion.charAt(0).toUpperCase() + customer.dominantEmotion.slice(1)}
              </Badge>
            </div>
            
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm font-medium text-muted-foreground">Sentiment:</span>
              <Badge className={getSentimentColor(customer.sentiment)}>
                {customer.sentiment.charAt(0).toUpperCase() + customer.sentiment.slice(1)}
              </Badge>
            </div>
            
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm font-medium text-muted-foreground">Interactions:</span>
              <Badge variant="outline">{customer.interactionCount}</Badge>
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-2">
        {!showFeedback ? (
          <div className="w-full flex justify-between gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={() => setShowFeedback(true)}
            >
              Provide Feedback
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              className="flex-1"
              onClick={handleMarkCorrect}
            >
              <CheckCircle2 className="h-4 w-4 mr-1" /> Correct
            </Button>
          </div>
        ) : (
          <div className="w-full space-y-2">
            <div className="flex items-center gap-2">
              <Select 
                onValueChange={(value) => setCorrectedEmotion(value as Emotion)}
                value={correctedEmotion}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Correct emotion" />
                </SelectTrigger>
                <SelectContent>
                  {emotions.map(emotion => (
                    <SelectItem key={emotion} value={emotion}>
                      {emotion.charAt(0).toUpperCase() + emotion.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select 
                onValueChange={(value) => setCorrectedSentiment(value as any)}
                value={correctedSentiment}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Correct sentiment" />
                </SelectTrigger>
                <SelectContent>
                  {sentiments.map(sentiment => (
                    <SelectItem key={sentiment} value={sentiment}>
                      {sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={() => setShowFeedback(false)}
              >
                <XCircle className="h-4 w-4 mr-1" /> Cancel
              </Button>
              <Button 
                size="sm" 
                className="flex-1"
                onClick={handleSubmitFeedback}
                disabled={!correctedEmotion && !correctedSentiment}
              >
                Submit Feedback
              </Button>
            </div>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
