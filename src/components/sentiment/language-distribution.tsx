
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomerAnalysisData } from "@/types/emotion";
import { Skeleton } from "@/components/ui/skeleton";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { Badge } from "@/components/ui/badge";

interface LanguageDistributionProps {
  customerAnalysis: CustomerAnalysisData[];
  isLoading: boolean;
}

export function LanguageDistribution({ customerAnalysis, isLoading }: LanguageDistributionProps) {
  // Calculate language distribution
  const getLanguageDistribution = () => {
    const languageCounts: Record<string, number> = {};
    
    customerAnalysis.forEach(analysis => {
      languageCounts[analysis.language] = (languageCounts[analysis.language] || 0) + 1;
    });
    
    return Object.entries(languageCounts).map(([language, count]) => ({
      language: getLanguageName(language),
      code: language,
      count,
      color: getLanguageColor(language)
    }));
  };
  
  // Helper to get language name from code
  const getLanguageName = (code: string): string => {
    const languages: Record<string, string> = {
      'en': 'English',
      'es': 'Spanish',
      'hi': 'Hindi',
      'other': 'Other'
    };
    return languages[code] || code;
  };
  
  // Get color for language
  const getLanguageColor = (language: string): string => {
    const colors: Record<string, string> = {
      'en': '#3b82f6', // blue
      'es': '#10b981', // green
      'hi': '#f59e0b', // yellow
      'other': '#6b7280' // gray
    };
    return colors[language] || '#6b7280';
  };
  
  // Get example messages for each language
  const getLanguageExamples = () => {
    const examples: Record<string, CustomerAnalysisData[]> = {};
    
    customerAnalysis.forEach(customer => {
      const language = customer.language;
      if (!examples[language]) {
        examples[language] = [];
      }
      
      if (examples[language].length < 2) {
        examples[language].push(customer);
      }
    });
    
    return examples;
  };
  
  // Get sentiment distribution by language
  const getSentimentByLanguage = () => {
    const results: any[] = [];
    
    // Group by language
    const languageGroups = new Map<string, CustomerAnalysisData[]>();
    customerAnalysis.forEach(analysis => {
      if (!languageGroups.has(analysis.language)) {
        languageGroups.set(analysis.language, []);
      }
      languageGroups.get(analysis.language)?.push(analysis);
    });
    
    // Calculate sentiment percentages for each language
    languageGroups.forEach((customers, language) => {
      const total = customers.length;
      const positive = customers.filter(c => c.sentiment === 'positive').length;
      const neutral = customers.filter(c => c.sentiment === 'neutral').length;
      const negative = customers.filter(c => c.sentiment === 'negative').length;
      
      results.push({
        language: getLanguageName(language),
        code: language,
        total,
        positive: Math.round(positive / total * 100),
        neutral: Math.round(neutral / total * 100),
        negative: Math.round(negative / total * 100)
      });
    });
    
    return results;
  };
  
  const languageData = getLanguageDistribution();
  const languageExamples = getLanguageExamples();
  const sentimentByLanguage = getSentimentByLanguage();
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div>
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Language Distribution</CardTitle>
            <CardDescription>Distribution of customer feedback by language</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="w-full h-80 rounded-md" />
            ) : (
              <div className="w-full h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={languageData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="language"
                    >
                      {languageData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
            
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Multilingual Capabilities</h4>
              <p className="text-sm text-muted-foreground">
                {languageData.length > 1
                  ? `The system is currently analyzing feedback in ${languageData.length} languages.`
                  : 'All current feedback is in a single language.'}
              </p>
              
              {languageData.length > 1 && (
                <div className="mt-2 space-y-1">
                  <p className="text-sm font-medium">Languages detected:</p>
                  <div className="flex flex-wrap gap-2">
                    {languageData.map(lang => (
                      <Badge key={lang.code} variant="outline" className="text-xs">
                        {lang.language} ({lang.count})
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="lg:col-span-2">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Multilingual Examples</CardTitle>
            <CardDescription>Sample customer messages in different languages</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="w-full h-32 rounded-md" />
                <Skeleton className="w-full h-32 rounded-md" />
              </div>
            ) : Object.keys(languageExamples).length > 0 ? (
              <div className="space-y-6">
                {Object.entries(languageExamples).map(([langCode, examples]) => {
                  if (examples.length === 0) return null;
                  
                  return (
                    <div key={langCode} className="space-y-3">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-medium">{getLanguageName(langCode)}</h3>
                        <Badge 
                          variant="outline" 
                          className="text-xs"
                          style={{ backgroundColor: `${getLanguageColor(langCode)}20` }}
                        >
                          {langCode}
                        </Badge>
                      </div>
                      
                      {examples.map(example => (
                        <div 
                          key={`${example.customerId}-${example.timestamp}`} 
                          className="p-3 rounded-md bg-muted"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                              <div className="rounded-full w-6 h-6 bg-accent flex items-center justify-center">
                                <span className="text-xs font-medium">{example.customerInitials}</span>
                              </div>
                              <span className="text-sm font-medium">{example.customerName}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Badge 
                                className={`text-xs ${example.sentiment === 'positive' 
                                  ? 'bg-green-100 text-green-800' 
                                  : example.sentiment === 'negative' 
                                    ? 'bg-red-100 text-red-800' 
                                    : 'bg-blue-100 text-blue-800'}`}
                              >
                                {example.sentiment}
                              </Badge>
                              <Badge 
                                variant="outline" 
                                className="text-xs"
                              >
                                {example.dominantEmotion}
                              </Badge>
                            </div>
                          </div>
                          <p className="text-sm">{example.lastMessage}</p>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No language examples available.
              </div>
            )}
            
            {sentimentByLanguage.length > 1 && (
              <div className="mt-6 pt-6 border-t">
                <h3 className="text-base font-medium mb-3">Sentiment Comparison Across Languages</h3>
                <div className="space-y-4">
                  {sentimentByLanguage.map(lang => (
                    <div key={lang.code} className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">{lang.language}</span>
                        <span className="text-xs text-muted-foreground">{lang.total} messages</span>
                      </div>
                      <div className="flex h-2 overflow-hidden rounded-full bg-gray-200">
                        <div 
                          className="bg-green-500 h-full" 
                          style={{ width: `${lang.positive}%` }} 
                          title={`Positive: ${lang.positive}%`}
                        />
                        <div 
                          className="bg-gray-400 h-full" 
                          style={{ width: `${lang.neutral}%` }} 
                          title={`Neutral: ${lang.neutral}%`}
                        />
                        <div 
                          className="bg-red-500 h-full" 
                          style={{ width: `${lang.negative}%` }} 
                          title={`Negative: ${lang.negative}%`}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Positive: {lang.positive}%</span>
                        <span>Neutral: {lang.neutral}%</span>
                        <span>Negative: {lang.negative}%</span>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 text-sm text-muted-foreground">
                  <p className="font-medium mb-1">Key observations:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {(() => {
                      // Find language with highest positive %
                      const mostPositive = [...sentimentByLanguage].sort((a, b) => b.positive - a.positive)[0];
                      // Find language with highest negative %
                      const mostNegative = [...sentimentByLanguage].sort((a, b) => b.negative - a.negative)[0];
                      
                      return (
                        <>
                          {mostPositive && (
                            <li>{mostPositive.language} shows the highest positive sentiment ({mostPositive.positive}%)</li>
                          )}
                          {mostNegative && mostNegative.code !== mostPositive.code && (
                            <li>{mostNegative.language} shows the highest negative sentiment ({mostNegative.negative}%)</li>
                          )}
                          {sentimentByLanguage.length > 1 && (
                            <li>Consider language-specific response strategies based on sentiment variations</li>
                          )}
                        </>
                      );
                    })()}
                  </ul>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
