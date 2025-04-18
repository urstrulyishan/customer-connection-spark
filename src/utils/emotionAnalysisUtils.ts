
import { pipeline, env } from "@huggingface/transformers";

// Configure transformers.js to use WebGPU when available for better performance
env.useBrowserCache = true;
env.allowLocalModels = false;

// Basic emotions we'll detect
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
};

// Map emotion labels from model to our standardized emotions
const emotionMapping: Record<string, Emotion> = {
  'joy': 'joy',
  'happy': 'joy',
  'happiness': 'joy',
  'sadness': 'sadness',
  'sad': 'sadness',
  'anger': 'anger',
  'angry': 'anger',
  'fear': 'fear',
  'scared': 'fear',
  'afraid': 'fear',
  'disgust': 'disgust',
  'surprise': 'surprise',
  'surprised': 'surprise',
  'frustration': 'frustration',
  'frustrated': 'frustration',
  'trust': 'trust',
  'neutral': 'neutral',
};

// Function to detect language
export const detectLanguage = async (text: string): Promise<string> => {
  try {
    // Simple language detection based on character sets
    // In a production app, we would use a proper language detection model
    const hasNonLatin = /[^\u0000-\u007F]/.test(text);
    
    // Very basic language detection
    if (hasNonLatin) {
      // Check for Hindi characters
      if (/[\u0900-\u097F]/.test(text)) return 'hi';
      
      // Check for Spanish special characters
      if (/[áéíóúüñ¿¡]/i.test(text)) return 'es';
      
      return 'other';
    }
    
    return 'en';
  } catch (error) {
    console.error('Language detection error:', error);
    return 'en'; // Default to English
  }
};

// Initialize the emotion detection model (lazily loaded)
let emotionClassifier: any = null;
let sentimentClassifier: any = null;

const initializeModels = async () => {
  try {
    // Load sentiment analysis model
    if (!sentimentClassifier) {
      console.log('Initializing sentiment analysis model...');
      sentimentClassifier = await pipeline(
        'text-classification',
        'distilbert-base-uncased-finetuned-sst-2-english'
      );
    }
    
    // Load emotion detection model
    if (!emotionClassifier) {
      console.log('Initializing emotion detection model...');
      emotionClassifier = await pipeline(
        'text-classification',
        'j-hartmann/emotion-english-distilroberta-base'
      );
    }
    
    return true;
  } catch (error) {
    console.error('Error initializing models:', error);
    return false;
  }
};

// Main function to analyze text for emotions and sentiment
export const analyzeEmotions = async (text: string): Promise<AdvancedSentimentResult> => {
  // Default result in case of error
  const defaultResult: AdvancedSentimentResult = {
    sentiment: 'neutral',
    sentimentScore: 0.5,
    emotions: [{ emotion: 'neutral', score: 1.0, confidence: 0.5 }],
    dominantEmotion: 'neutral',
    language: 'en',
    confidenceScore: 0.5
  };
  
  if (!text || text.trim().length === 0) {
    return defaultResult;
  }
  
  try {
    // Detect language
    const language = await detectLanguage(text);
    
    // Initialize models
    const modelsInitialized = await initializeModels();
    if (!modelsInitialized) {
      return { ...defaultResult, language };
    }
    
    // For non-English text, we could:
    // 1. Use a translation API to translate to English (not implemented)
    // 2. Use a multilingual model (not implemented)
    // For now, we'll just process non-English with English models, but log it
    if (language !== 'en') {
      console.log(`Processing non-English text (${language}) with English model.`);
    }
    
    // Get sentiment analysis
    const sentimentResults = await sentimentClassifier(text, { topk: 2 });
    
    // Map sentiment results
    let sentimentLabel: 'positive' | 'negative' | 'neutral' = 'neutral';
    let sentimentScore = 0.5;
    
    for (const result of sentimentResults) {
      if (result.label === 'POSITIVE' && result.score > 0.5) {
        sentimentLabel = 'positive';
        sentimentScore = result.score;
      } else if (result.label === 'NEGATIVE' && result.score > 0.5) {
        sentimentLabel = 'negative';
        sentimentScore = 1 - result.score; // Invert so higher means more negative
      }
    }
    
    // Get emotion analysis
    const emotionResults = await emotionClassifier(text, { topk: 5 });
    
    // Map emotion results to our standardized format
    const emotions: EmotionResult[] = emotionResults.map((result: any) => {
      const mappedEmotion = emotionMapping[result.label.toLowerCase()] || 'neutral';
      return {
        emotion: mappedEmotion,
        score: result.score,
        confidence: result.score
      };
    });
    
    // Find dominant emotion
    const dominantEmotion = emotions.length > 0 ? emotions[0].emotion : 'neutral';
    
    // Calculate overall confidence
    const confidenceScore = emotions.length > 0 ? emotions[0].score : 0.5;
    
    return {
      sentiment: sentimentLabel,
      sentimentScore: sentimentScore,
      emotions,
      dominantEmotion,
      language,
      confidenceScore
    };
  } catch (error) {
    console.error('Error analyzing emotions:', error);
    return { ...defaultResult, language: 'en' };
  }
};

// Calculate customer priority based on sentiment, emotion, and interaction frequency
export const calculatePriority = (
  sentimentScore: number, 
  dominantEmotion: Emotion, 
  interactionCount: number,
  maxInteractions = 10 // Normalize interactions
): number => {
  // Weights for each factor
  const SENTIMENT_WEIGHT = 0.4;
  const EMOTION_WEIGHT = 0.3;
  const INTERACTION_WEIGHT = 0.3;
  
  // Emotion impact score (higher for negative emotions)
  const emotionImpact: Record<Emotion, number> = {
    'anger': 1.0,       // Highest priority
    'frustration': 0.9,
    'sadness': 0.8,
    'fear': 0.75,
    'disgust': 0.7,
    'surprise': 0.5,    // Neutral
    'neutral': 0.5,     // Neutral
    'joy': 0.3,         // Positive emotions get lower priority
    'trust': 0.2
  };
  
  // Normalize interaction count (0-1)
  const normalizedInteractions = Math.min(interactionCount / maxInteractions, 1);
  
  // Calculate priority score components
  const sentimentComponent = (1 - sentimentScore) * SENTIMENT_WEIGHT; // Invert so negative sentiment = higher priority
  const emotionComponent = (emotionImpact[dominantEmotion] || 0.5) * EMOTION_WEIGHT;
  const interactionComponent = normalizedInteractions * INTERACTION_WEIGHT;
  
  // Calculate final priority score (0-1)
  const priorityScore = sentimentComponent + emotionComponent + interactionComponent;
  
  return Math.min(Math.max(priorityScore, 0), 1); // Ensure it's between 0 and 1
};

// Determine priority category
export const getPriorityCategory = (priorityScore: number): 'high' | 'medium' | 'low' => {
  if (priorityScore > 0.7) return 'high';
  if (priorityScore > 0.3) return 'medium';
  return 'low';
};

// Save feedback about emotion/sentiment prediction
export const saveFeedback = (
  customerId: string, 
  originalPrediction: AdvancedSentimentResult,
  correctedEmotion?: Emotion,
  correctedSentiment?: 'positive' | 'negative' | 'neutral'
): void => {
  // In a real system, we would send this to a backend API
  // For now, we'll store it in localStorage to simulate feedback collection
  
  try {
    const feedbackKey = 'emotion_feedback_data';
    const existingFeedback = JSON.parse(localStorage.getItem(feedbackKey) || '[]');
    
    existingFeedback.push({
      timestamp: new Date().toISOString(),
      customerId,
      originalPrediction,
      correctedEmotion,
      correctedSentiment,
      wasCorrect: !correctedEmotion && !correctedSentiment
    });
    
    localStorage.setItem(feedbackKey, JSON.stringify(existingFeedback));
    console.log('Feedback saved:', existingFeedback[existingFeedback.length - 1]);
    
  } catch (error) {
    console.error('Error saving feedback:', error);
  }
};
