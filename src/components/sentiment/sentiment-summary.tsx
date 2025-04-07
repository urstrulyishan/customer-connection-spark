
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { ThumbsUp, ThumbsDown, Minus, TrendingUp } from "lucide-react";

interface SentimentSummaryProps {
  positive: number;
  negative: number;
  neutral: number;
  total: number;
  averageScore: number;
}

export function SentimentSummary({ positive, negative, neutral, total, averageScore }: SentimentSummaryProps) {
  // Calculate percentages
  const positivePercent = total > 0 ? Math.round((positive / total) * 100) : 0;
  const negativePercent = total > 0 ? Math.round((negative / total) * 100) : 0;
  const neutralPercent = total > 0 ? Math.round((neutral / total) * 100) : 0;
  
  // Convert score from -1...1 range to 0...100 for display
  const scoreDisplay = Math.round((averageScore + 1) * 50);
  
  // Get score color
  const getScoreColor = () => {
    if (scoreDisplay >= 70) return "text-green-500";
    if (scoreDisplay >= 40) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <div className="bg-green-100 p-2 rounded-full mr-3">
                <ThumbsUp className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <div className="text-sm font-medium">Positive</div>
                <div className="text-2xl font-bold">{positivePercent}%</div>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">{positive} responses</div>
          </div>
          <Progress value={positivePercent} className="bg-gray-200 h-2" />
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <div className="bg-red-100 p-2 rounded-full mr-3">
                <ThumbsDown className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <div className="text-sm font-medium">Negative</div>
                <div className="text-2xl font-bold">{negativePercent}%</div>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">{negative} responses</div>
          </div>
          <Progress value={negativePercent} className="bg-gray-200 h-2" />
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <div className="bg-blue-100 p-2 rounded-full mr-3">
                <Minus className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <div className="text-sm font-medium">Neutral</div>
                <div className="text-2xl font-bold">{neutralPercent}%</div>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">{neutral} responses</div>
          </div>
          <Progress value={neutralPercent} className="bg-gray-200 h-2" />
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <div className="bg-purple-100 p-2 rounded-full mr-3">
                <TrendingUp className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <div className="text-sm font-medium">Sentiment Score</div>
                <div className={cn("text-2xl font-bold", getScoreColor())}>{scoreDisplay}</div>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">{total} total</div>
          </div>
          <Progress 
            value={scoreDisplay} 
            className={cn(
              "bg-gray-200 h-2",
              scoreDisplay >= 70 ? "text-green-500" : 
              scoreDisplay >= 40 ? "text-yellow-500" : "text-red-500"
            )} 
          />
        </CardContent>
      </Card>
    </div>
  );
}
