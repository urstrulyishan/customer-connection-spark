import { pipeline, env } from "@huggingface/transformers";

// Configure transformers.js to use WebGPU when available and enable browser cache
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

// Constants for localStorage keys
const CACHED_RESPONSES_KEY = 'sentiment_responses_cache';
const MODEL_FEEDBACK_KEY = 'emotion_feedback_data';
const ISHAN_TECH_FEEDBACK_KEY = 'ishan_tech_feedback';

// Function to get cached responses
const getCachedResponses = (): Array<{text: string, analysis: AdvancedSentimentResult}> => {
  try {
    return JSON.parse(localStorage.getItem(CACHED_RESPONSES_KEY) || '[]');
  } catch {
    return [];
  }
};

// Function to save response to cache
const saveResponseToCache = (text: string, analysis: AdvancedSentimentResult) => {
  try {
    const cachedResponses = getCachedResponses();
    // Check if this text already exists in cache
    const existingIndex = cachedResponses.findIndex(item => item.text === text);
    
    if (existingIndex >= 0) {
      // Update existing entry
      cachedResponses[existingIndex] = { text, analysis };
    } else {
      // Add new entry
      cachedResponses.push({ text, analysis });
    }
    
    localStorage.setItem(CACHED_RESPONSES_KEY, JSON.stringify(cachedResponses));
  } catch (error) {
    console.error('Error saving to cache:', error);
  }
};

// Function to update cached response based on feedback
const updateCachedResponseWithFeedback = (text: string, correctedEmotion?: Emotion, correctedSentiment?: 'positive' | 'negative' | 'neutral') => {
  if (!text) return;
  
  try {
    const cachedResponses = getCachedResponses();
    const existingResponseIndex = cachedResponses.findIndex(item => item.text === text);
    
    if (existingResponseIndex >= 0) {
      const updatedAnalysis = { ...cachedResponses[existingResponseIndex].analysis };
      
      // Update with corrections
      if (correctedEmotion) {
        updatedAnalysis.dominantEmotion = correctedEmotion;
      }
      
      if (correctedSentiment) {
        updatedAnalysis.sentiment = correctedSentiment;
      }
      
      // Update confidence score to reflect human feedback (high confidence)
      updatedAnalysis.confidenceScore = 0.95;
      
      // Save the updated analysis back to cache
      cachedResponses[existingResponseIndex] = {
        text,
        analysis: updatedAnalysis
      };
      
      localStorage.setItem(CACHED_RESPONSES_KEY, JSON.stringify(cachedResponses));
      console.log('Updated cached response with feedback:', updatedAnalysis);
    }
  } catch (error) {
    console.error('Error updating cached response with feedback:', error);
  }
};

// Function to detect language - modified to be synchronous
export const detectLanguage = (text: string): string => {
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

// Rule-based fallback for sentiment analysis when models fail to load
export const analyzeSentimentRuleBased = (text: string): AdvancedSentimentResult => {
  const positiveWords = ['good', 'great', 'excellent', 'happy', 'joy', 'love', 'like', 'amazing', 'wonderful', 'thank', 'thanks', 'helpful', 'awesome', 'contento', 'gracias', 'bueno', 'excelente', 'feliz', 'contenta'];
  const negativeWords = ['bad', 'poor', 'terrible', 'hate', 'dislike', 'awful', 'horrible', 'disappointed', 'frustrat', 'anger', 'angry', 'annoyed', 'annoy', 'worst', 'problema', 'malo', 'terrible', 'odio', 'frustrado'];
  const fearWords = ['afraid', 'scared', 'fear', 'worry', 'anxious', 'nervous', 'terrified', 'miedo', 'preocupado'];
  const trustWords = ['trust', 'reliable', 'depend', 'honest', 'faith', 'confiar', 'confianza'];
  const surpriseWords = ['surprise', 'surprised', 'wow', 'unexpected', 'amazing', 'sorprendido', 'sorpresa'];
  const disgustWords = ['disgust', 'gross', 'ew', 'yuck', 'nasty', 'repulsive', 'asco', 'repugnante'];
  const sadWords = ['sad', 'unhappy', 'depressed', 'sorrow', 'miserable', 'triste', 'deprimido'];
  const frustratedWords = ['frustrat', 'annoying', 'irritat', 'annoy', 'bother', 'frustrado', 'irritado'];
  
  const lowerText = text.toLowerCase();
  
  // Count matches
  let positiveCount = 0;
  let negativeCount = 0;
  let emotionScores: Record<Emotion, number> = {
    'joy': 0,
    'anger': 0,
    'sadness': 0,
    'fear': 0,
    'surprise': 0,
    'disgust': 0,
    'trust': 0,
    'frustration': 0,
    'neutral': 0.1 // Default small value for neutral
  };
  
  // Check for positive words
  for (const word of positiveWords) {
    if (lowerText.includes(word)) {
      positiveCount++;
      emotionScores.joy += 0.3;
      emotionScores.trust += 0.1;
    }
  }
  
  // Check for negative words
  for (const word of negativeWords) {
    if (lowerText.includes(word)) {
      negativeCount++;
      emotionScores.anger += 0.2;
    }
  }
  
  // Check for specific emotions
  for (const word of fearWords) {
    if (lowerText.includes(word)) {
      emotionScores.fear += 0.3;
      negativeCount++;
    }
  }
  
  for (const word of trustWords) {
    if (lowerText.includes(word)) {
      emotionScores.trust += 0.3;
      positiveCount++;
    }
  }
  
  for (const word of surpriseWords) {
    if (lowerText.includes(word)) {
      emotionScores.surprise += 0.3;
      // Surprise can be positive or negative
    }
  }
  
  for (const word of disgustWords) {
    if (lowerText.includes(word)) {
      emotionScores.disgust += 0.3;
      negativeCount++;
    }
  }
  
  for (const word of sadWords) {
    if (lowerText.includes(word)) {
      emotionScores.sadness += 0.3;
      negativeCount++;
    }
  }
  
  for (const word of frustratedWords) {
    if (lowerText.includes(word)) {
      emotionScores.frustration += 0.3;
      negativeCount++;
    }
  }
  
  // Determine sentiment
  let sentiment: 'positive' | 'negative' | 'neutral';
  let sentimentScore: number;
  
  if (positiveCount > negativeCount) {
    sentiment = 'positive';
    sentimentScore = 0.5 + (Math.min(positiveCount, 5) / 10);
  } else if (negativeCount > positiveCount) {
    sentiment = 'negative';
    sentimentScore = 0.5 - (Math.min(negativeCount, 5) / 10);
  } else {
    sentiment = 'neutral';
    sentimentScore = 0.5;
  }
  
  // Find the dominant emotion
  const emotions = Object.entries(emotionScores)
    .map(([emotion, score]) => ({
      emotion: emotion as Emotion,
      score,
      confidence: score
    }))
    .sort((a, b) => b.score - a.score);
  
  // If no strong emotions were detected, increase the neutral score
  if (emotions[0].score < 0.2) {
    emotions.find(e => e.emotion === 'neutral')!.score = 0.3;
    emotions.find(e => e.emotion === 'neutral')!.confidence = 0.3;
    
    // Re-sort
    emotions.sort((a, b) => b.score - a.score);
  }
  
  return {
    sentiment,
    sentimentScore,
    emotions,
    dominantEmotion: emotions[0].emotion,
    language: detectLanguage(text),
    confidenceScore: Math.max(...Object.values(emotionScores))
  };
};

// Initialize the emotion detection model (lazily loaded)
let emotionClassifier: any = null;
let sentimentClassifier: any = null;
let modelLoadFailed = false;

const initializeModels = async () => {
  if (modelLoadFailed) {
    return false; // Don't keep trying if models failed to load
  }
  
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
    modelLoadFailed = true; // Mark as failed so we don't keep trying
    return false;
  }
};

// Function to get all feedback including IshanTech demo feedback
export const getAllFeedback = () => {
  try {
    const sentimentFeedback = JSON.parse(localStorage.getItem(MODEL_FEEDBACK_KEY) || '[]');
    const ishanTechFeedback = JSON.parse(localStorage.getItem(ISHAN_TECH_FEEDBACK_KEY) || '[]');
    return [...sentimentFeedback, ...ishanTechFeedback].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  } catch (error) {
    console.error('Error loading feedback:', error);
    return [];
  }
};

// Function to check for existing feedback-based predictions
const checkFeedbackBasedPrediction = (text: string): AdvancedSentimentResult | null => {
  try {
    const allFeedback = getAllFeedback();
    const matchingFeedback = allFeedback.find(f => 
      f.originalText && f.originalText.toLowerCase() === text.toLowerCase() && 
      (f.correctedEmotion || f.correctedSentiment)
    );

    if (matchingFeedback) {
      console.log('Found matching feedback-based prediction');
      return {
        sentiment: matchingFeedback.correctedSentiment || matchingFeedback.originalPrediction.sentiment,
        sentimentScore: matchingFeedback.originalPrediction.sentimentScore,
        emotions: matchingFeedback.originalPrediction.emotions,
        dominantEmotion: matchingFeedback.correctedEmotion || matchingFeedback.originalPrediction.dominantEmotion,
        language: matchingFeedback.originalPrediction.language,
        confidenceScore: 0.95 // High confidence for feedback-based predictions
      };
    }
    
    // Also check cached responses updated by feedback
    const cachedResponses = getCachedResponses();
    const cachedFeedback = cachedResponses.find(item => 
      item.text.toLowerCase() === text.toLowerCase() && 
      item.analysis.confidenceScore === 0.95 // This indicates it was manually corrected
    );
    
    if (cachedFeedback) {
      console.log('Found cached feedback prediction');
      return cachedFeedback.analysis;
    }
    
    return null;
  } catch (error) {
    console.error('Error checking feedback-based prediction:', error);
    return null;
  }
};

// Main function to analyze text for emotions and sentiment
export const analyzeEmotions = async (text: string): Promise<AdvancedSentimentResult> => {
  // First check if we have a feedback-based prediction
  const feedbackPrediction = checkFeedbackBasedPrediction(text);
  if (feedbackPrediction) {
    return feedbackPrediction;
  }

  // Check cache first
  const cachedResponses = getCachedResponses();
  const cachedResult = cachedResponses.find(item => item.text === text);
  
  if (cachedResult) {
    console.log('Using cached analysis result');
    return cachedResult.analysis;
  }
  
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
    // Detect language first (this is fast and rule-based)
    const language = detectLanguage(text);
    
    // Initialize models
    const modelsInitialized = await initializeModels();
    
    // If models failed to initialize, use rule-based approach
    if (!modelsInitialized) {
      console.log('Using rule-based sentiment analysis as fallback');
      return analyzeSentimentRuleBased(text);
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
    
    
    
    const analysisResult: AdvancedSentimentResult = {
      sentiment: sentimentLabel,
      sentimentScore: sentimentScore,
      emotions,
      dominantEmotion,
      language,
      confidenceScore
    };
    
    // Save to cache before returning
    saveResponseToCache(text, analysisResult);
    
    return analysisResult;
  } catch (error) {
    console.error('Error analyzing emotions:', error);
    const fallbackResult = analyzeSentimentRuleBased(text);
    saveResponseToCache(text, fallbackResult); // Cache fallback results too
    return fallbackResult;
  }
};

// Simplified version for IshanTech demo
export const analyzeSentiment = (text: string): { sentiment: string, score: number } => {
  // This is a synchronous version for the demo page
  const lowerText = text.toLowerCase();
  const positiveWords = ['good', 'great', 'excellent', 'happy', 'joy', 'love', 'like', 'amazing', 'wonderful', 'thank'];
  const negativeWords = ['bad', 'poor', 'terrible', 'hate', 'dislike', 'awful', 'horrible', 'disappointed', 'frustrated'];
  
  let positiveCount = 0;
  let negativeCount = 0;
  
  for (const word of positiveWords) {
    if (lowerText.includes(word)) positiveCount++;
  }
  
  for (const word of negativeWords) {
    if (lowerText.includes(word)) negativeCount++;
  }
  
  if (positiveCount > negativeCount) {
    return { sentiment: 'positive', score: 0.5 + (Math.min(positiveCount, 5) / 10) };
  } else if (negativeCount > positiveCount) {
    return { sentiment: 'negative', score: 0.5 - (Math.min(negativeCount, 5) / 10) };
  } else {
    return { sentiment: 'neutral', score: 0.5 };
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

// Update saveFeedback to include original text and update cache
export const saveFeedback = (
  customerId: string, 
  originalPrediction: AdvancedSentimentResult,
  correctedEmotion?: Emotion,
  correctedSentiment?: 'positive' | 'negative' | 'neutral',
  originalText?: string
): void => {
  try {
    const existingFeedback = JSON.parse(localStorage.getItem(MODEL_FEEDBACK_KEY) || '[]');
    
    const feedbackEntry = {
      timestamp: new Date().toISOString(),
      customerId,
      originalPrediction,
      correctedEmotion,
      correctedSentiment,
      originalText: originalText || originalPrediction.originalText,
      wasCorrect: !correctedEmotion && !correctedSentiment
    };
    
    existingFeedback.push(feedbackEntry);
    localStorage.setItem(MODEL_FEEDBACK_KEY, JSON.stringify(existingFeedback));
    
    // Also update cached responses for immediate training effect
    if (originalText && (correctedEmotion || correctedSentiment)) {
      updateCachedResponseWithFeedback(originalText, correctedEmotion, correctedSentiment);
    }
    
    // Dispatch event to notify other components of feedback update
    window.dispatchEvent(new CustomEvent('sentiment-feedback-updated', { 
      detail: feedbackEntry 
    }));
    
    console.log('Feedback saved:', feedbackEntry);
    
  } catch (error) {
    console.error('Error saving feedback:', error);
  }
};
