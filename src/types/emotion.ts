
export type Emotion = 'joy' | 'anger' | 'sadness' | 'fear' | 'surprise' | 'disgust' | 'trust' | 'frustration' | 'neutral';

export type EmotionResult = {
  emotion: Emotion;
  score: number;
  confidence: number;
};

export type AdvancedSentimentResult = {
  sentiment: 'positive' | 'negative' | 'neutral';
  sentimentScore: number;
  emotions: EmotionResult[];
  dominantEmotion: Emotion;
  language: string;
  confidenceScore: number;
  originalText?: string; // Adding the optional originalText property
};

export interface CustomerAnalysisData {
  customerId: string;
  customerName: string;
  customerInitials: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  sentimentScore: number;
  dominantEmotion: Emotion;
  emotions: EmotionResult[];
  interactionCount: number;
  priorityScore: number;
  priorityCategory: 'high' | 'medium' | 'low';
  language: string;
  lastMessage: string;
  timestamp: string;
}

export interface FeedbackData {
  customerId: string;
  originalAnalysis: CustomerAnalysisData;
  correctedEmotion?: Emotion;
  correctedSentiment?: 'positive' | 'negative' | 'neutral';
  wasCorrect: boolean;
  timestamp: string;
  notes?: string;
}
