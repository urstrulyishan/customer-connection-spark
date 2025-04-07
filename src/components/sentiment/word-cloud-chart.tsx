
import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare } from "lucide-react";

interface WordCloudChartProps {
  feedbackData: any[];
}

// Simple word extraction and counting function
function extractWords(text: string): Record<string, number> {
  // Convert to lowercase and split by non-word characters
  const words = text.toLowerCase().match(/\b(\w+)\b/g) || [];
  
  // Common English stopwords to exclude
  const stopwords = new Set([
    "i", "me", "my", "myself", "we", "our", "ours", "ourselves", "you", "your", "yours",
    "yourself", "yourselves", "he", "him", "his", "himself", "she", "her", "hers",
    "herself", "it", "its", "itself", "they", "them", "their", "theirs", "themselves",
    "what", "which", "who", "whom", "this", "that", "these", "those", "am", "is", "are",
    "was", "were", "be", "been", "being", "have", "has", "had", "having", "do", "does",
    "did", "doing", "a", "an", "the", "and", "but", "if", "or", "because", "as", "until",
    "while", "of", "at", "by", "for", "with", "about", "against", "between", "into",
    "through", "during", "before", "after", "above", "below", "to", "from", "up", "down",
    "in", "out", "on", "off", "over", "under", "again", "further", "then", "once", "here",
    "there", "when", "where", "why", "how", "all", "any", "both", "each", "few", "more",
    "most", "other", "some", "such", "no", "nor", "not", "only", "own", "same", "so",
    "than", "too", "very", "s", "t", "can", "will", "just", "don", "don't", "should",
    "now", "d", "ll", "m", "o", "re", "ve", "y", "ain", "aren", "aren't", "couldn",
    "couldn't", "didn", "didn't", "doesn", "doesn't", "hadn", "hadn't", "hasn", "hasn't",
    "haven", "haven't", "isn", "isn't", "ma", "mightn", "mightn't", "mustn", "mustn't",
    "needn", "needn't", "shan", "shan't", "shouldn", "shouldn't", "wasn", "wasn't",
    "weren", "weren't", "won", "won't", "wouldn", "wouldn't"
  ]);
  
  // Count words, excluding stopwords
  const wordCounts: Record<string, number> = {};
  
  for (const word of words) {
    if (word.length > 2 && !stopwords.has(word)) {
      wordCounts[word] = (wordCounts[word] || 0) + 1;
    }
  }
  
  return wordCounts;
}

export function WordCloudChart({ feedbackData }: WordCloudChartProps) {
  // Process data to generate word clouds for positive and negative feedback
  const { positiveWords, negativeWords, neutralWords } = useMemo(() => {
    const positiveFeedback = feedbackData
      .filter(item => item.sentiment.sentiment === 'positive')
      .map(item => item.text)
      .join(' ');
      
    const negativeFeedback = feedbackData
      .filter(item => item.sentiment.sentiment === 'negative')
      .map(item => item.text)
      .join(' ');
      
    const neutralFeedback = feedbackData
      .filter(item => item.sentiment.sentiment === 'neutral')
      .map(item => item.text)
      .join(' ');
    
    const positiveWordCounts = extractWords(positiveFeedback);
    const negativeWordCounts = extractWords(negativeFeedback);
    const neutralWordCounts = extractWords(neutralFeedback);
    
    // Get top words
    const getTopWords = (wordCounts: Record<string, number>, count: number) => {
      return Object.entries(wordCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, count)
        .map(([word, count]) => ({ text: word, value: count }));
    };
    
    return {
      positiveWords: getTopWords(positiveWordCounts, 20),
      negativeWords: getTopWords(negativeWordCounts, 20),
      neutralWords: getTopWords(neutralWordCounts, 20)
    };
  }, [feedbackData]);

  // Get font size based on word frequency
  const getFontSize = (count: number, maxCount: number) => {
    const minSize = 14;
    const maxSize = 36;
    if (maxCount === 0) return minSize;
    const size = minSize + ((count / maxCount) * (maxSize - minSize));
    return `${size}px`;
  };
  
  // Get color based on sentiment
  const getColorClass = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600';
      case 'negative': return 'text-red-600';
      case 'neutral': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  // Render word cloud for a specific sentiment
  const renderWordCloud = (words: { text: string, value: number }[], sentiment: string) => {
    if (words.length === 0) {
      return (
        <div className="flex items-center justify-center h-[200px] text-muted-foreground">
          <MessageSquare className="h-6 w-6 mr-2" />
          <span>No {sentiment} feedback data available</span>
        </div>
      );
    }
    
    const maxCount = Math.max(...words.map(w => w.value));
    
    return (
      <div className="flex flex-wrap justify-center gap-3 p-4 h-[200px] overflow-y-auto">
        {words.map((word, index) => (
          <span 
            key={index}
            className={`${getColorClass(sentiment)} font-medium px-1`}
            style={{ fontSize: getFontSize(word.value, maxCount) }}
          >
            {word.text}
          </span>
        ))}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Common Words in Feedback</CardTitle>
        <CardDescription>Most frequently used words in customer feedback by sentiment</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="positive">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="positive" className="text-green-600">Positive</TabsTrigger>
            <TabsTrigger value="negative" className="text-red-600">Negative</TabsTrigger>
            <TabsTrigger value="neutral" className="text-blue-600">Neutral</TabsTrigger>
          </TabsList>
          <TabsContent value="positive">
            {renderWordCloud(positiveWords, 'positive')}
          </TabsContent>
          <TabsContent value="negative">
            {renderWordCloud(negativeWords, 'negative')}
          </TabsContent>
          <TabsContent value="neutral">
            {renderWordCloud(neutralWords, 'neutral')}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
