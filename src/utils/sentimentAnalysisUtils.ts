
// A simple sentiment analysis utility to classify text as positive, negative, or neutral
// In a production environment, you would use a more sophisticated NLP library

// Dictionary of positive words
const positiveWords = [
  'good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'terrific',
  'outstanding', 'superb', 'awesome', 'nice', 'love', 'happy', 'satisfied',
  'perfect', 'brilliant', 'impressive', 'exceptional', 'delighted', 'pleased',
  'thank', 'thanks', 'like', 'enjoy', 'excited', 'recommend', 'best'
];

// Dictionary of negative words
const negativeWords = [
  'bad', 'poor', 'terrible', 'awful', 'horrible', 'disappointing', 'frustrating',
  'unsatisfied', 'dissatisfied', 'unhappy', 'sorry', 'hate', 'dislike', 'worst',
  'mistake', 'annoying', 'problem', 'issue', 'fail', 'failure', 'complaint',
  'complain', 'disappointed', 'upset', 'regret', 'sad', 'angry', 'broken'
];

export type SentimentResult = {
  sentiment: 'positive' | 'negative' | 'neutral';
  score: number; // -1 to 1, with -1 being very negative, 0 neutral, and 1 very positive
  confidence: number; // 0 to 1, with 1 being very confident
};

export const analyzeSentiment = (text: string): SentimentResult => {
  if (!text || typeof text !== 'string') {
    return { sentiment: 'neutral', score: 0, confidence: 0 };
  }

  // Convert to lowercase for case-insensitive matching
  const lowerText = text.toLowerCase();
  const words = lowerText.match(/\b(\w+)\b/g) || [];
  
  // Count positive and negative words
  let positiveCount = 0;
  let negativeCount = 0;
  
  for (const word of words) {
    if (positiveWords.includes(word)) {
      positiveCount++;
    } else if (negativeWords.includes(word)) {
      negativeCount++;
    }
  }
  
  // Calculate score (-1 to 1)
  const totalWords = words.length;
  const score = totalWords > 0 
    ? (positiveCount - negativeCount) / Math.max(totalWords, 5) 
    : 0;
  
  // Calculate confidence based on the ratio of sentiment words to total words
  const sentimentWords = positiveCount + negativeCount;
  const confidence = totalWords > 0 
    ? Math.min(sentimentWords / totalWords * 2, 1) 
    : 0;
  
  // Determine sentiment
  let sentiment: 'positive' | 'negative' | 'neutral';
  if (score > 0.1) {
    sentiment = 'positive';
  } else if (score < -0.1) {
    sentiment = 'negative';
  } else {
    sentiment = 'neutral';
  }
  
  return { sentiment, score, confidence };
};

// Helper function to get sentiment color
export const getSentimentColor = (sentiment: 'positive' | 'negative' | 'neutral'): string => {
  switch (sentiment) {
    case 'positive':
      return 'bg-green-100 text-green-800';
    case 'negative':
      return 'bg-red-100 text-red-800';
    case 'neutral':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};
