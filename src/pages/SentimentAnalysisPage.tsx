import { useEffect, useState, useCallback } from "react";
import { PageContainer, SectionContainer } from "@/components/ui/container";
import { MainLayout } from "@/layouts/main-layout";
import { 
  BarChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Bar, 
  PieChart, Pie, Cell, ResponsiveContainer 
} from "recharts";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CustomerData } from "@/components/customers/customer-card";
import { LeadData } from "@/types/leads";
import { useCompany } from "@/contexts/CompanyContext";
import { analyzeEmotions, calculatePriority, getPriorityCategory, saveFeedback } from "@/utils/emotionAnalysisUtils";
import { Emotion, CustomerAnalysisData } from "@/types/emotion";
import { EmotionFeedbackCard } from "@/components/sentiment/emotion-feedback-card";
import { SentimentSummary } from "@/components/sentiment/sentiment-summary";
import { EmotionDistribution } from "@/components/sentiment/emotion-distribution";
import { SentimentTrends } from "@/components/sentiment/sentiment-trends";
import { CustomerPriorityList } from "@/components/sentiment/customer-priority-list";
import { LanguageDistribution } from "@/components/sentiment/language-distribution";
import { toast } from "sonner";
import { RefreshCw } from "lucide-react";

// Sample multilingual customer messages for testing
const sampleCustomerMessages = [
  {
    customerId: "1",
    message: "I'm extremely frustrated with the continued delays. This is the third time I've had to follow up.",
    timestamp: "2023-05-15T09:30:00",
  },
  {
    customerId: "2",
    message: "Thank you for the amazing service! Your team went above and beyond to help me.",
    timestamp: "2023-05-14T14:20:00",
  },
  {
    customerId: "3",
    message: "I'm really worried about the security of my data after the recent news. Can you explain your policies?",
    timestamp: "2023-05-13T11:15:00",
  },
  {
    customerId: "1",
    message: "This is absolutely unacceptable! I've been waiting for a response for days. I need to speak to a manager now!",
    timestamp: "2023-05-11T16:45:00",
  },
  {
    customerId: "4",
    message: "¡Estoy muy contento con el producto! Funciona exactamente como esperaba. Gracias por la atención rápida.",
    timestamp: "2023-05-10T10:30:00", // Spanish: "I'm very happy with the product! It works exactly as expected. Thanks for the quick attention."
  },
  {
    customerId: "3",
    message: "मैं आपके उत्पाद से बहुत खुश हूं लेकिन कुछ सुधार की जरूरत है। क्या हम इस पर चर्चा कर सकते हैं?",
    timestamp: "2023-05-09T13:25:00", // Hindi: "I'm very happy with your product but some improvement is needed. Can we discuss this?"
  },
];

export default function SentimentAnalysisPage() {
  const { currentCompany } = useCompany();
  const [customers, setCustomers] = useState<CustomerData[]>([]);
  const [leads, setLeads] = useState<LeadData[]>([]);
  const [customerAnalysis, setCustomerAnalysis] = useState<CustomerAnalysisData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("summary");
  const [refreshKey, setRefreshKey] = useState(0); // Used to force refresh
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Function to handle message events
  const handleCustomerMessageAdded = useCallback((event: Event) => {
    const customEvent = event as CustomEvent;
    console.log("New customer message detected:", customEvent.detail);
    // Force a refresh of the data
    setRefreshKey(prev => prev + 1);
  }, []);

  // Handle storage events for customers from other tabs
  const handleStorageChange = useCallback(() => {
    console.log("Storage change detected, refreshing data");
    // Force a refresh of the data
    setRefreshKey(prev => prev + 1);
  }, []);
  
  // Load data and perform analysis
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setIsRefreshing(true);
      
      try {
        // Get company ID
        const companyId = currentCompany?.id || JSON.parse(localStorage.getItem("currentCompany") || "{}").id;
        
        // Load customers
        const storedCustomers = localStorage.getItem(`customers_${companyId}`);
        const customersData = storedCustomers ? JSON.parse(storedCustomers) : [];
        setCustomers(customersData);
        
        // Load leads
        const storedLeads = localStorage.getItem(`leads_${companyId}`);
        const leadsData = storedLeads ? JSON.parse(storedLeads) : [];
        setLeads(leadsData);
        
        // Get stored messages or use sample data
        const messagesKey = `customer_messages_${companyId}`;
        const storedMessages = localStorage.getItem(messagesKey);
        let messages = [];
        
        if (storedMessages) {
          messages = JSON.parse(storedMessages);
          console.log(`Loaded ${messages.length} customer messages`);
        } else {
          // If no messages exist, use sample data
          messages = sampleCustomerMessages;
          localStorage.setItem(messagesKey, JSON.stringify(sampleCustomerMessages));
          console.log("Using sample messages");
        }
        
        // Process customer messages with emotion analysis
        const analysisPromises = messages.map(async (msg: any) => {
          // For demo users from IshanTech demo
          let customer;
          
          if (msg.customerId.startsWith('demo-user')) {
            // Create a virtual customer for demo users
            customer = {
              id: msg.customerId,
              name: "Demo User",
              initials: "DU",
              email: "demo@example.com"
            };
          } else {
            // Find existing customer
            customer = customersData.find((c: CustomerData) => c.id === msg.customerId);
          }
          
          if (!customer) return null;
          
          // Count interactions for this customer
          const customerInteractions = messages.filter((m: any) => m.customerId === msg.customerId).length;
          
          // Analyze emotions in message
          console.log(`Analyzing message: "${msg.message}"`);
          const analysis = await analyzeEmotions(msg.message);
          console.log(`Analysis result:`, analysis);
          
          // Calculate priority
          const priorityScore = calculatePriority(
            analysis.sentimentScore,
            analysis.dominantEmotion,
            customerInteractions
          );
          
          return {
            customerId: customer.id,
            customerName: customer.name,
            customerInitials: customer.initials || customer.name.charAt(0),
            sentiment: analysis.sentiment,
            sentimentScore: analysis.sentimentScore,
            dominantEmotion: analysis.dominantEmotion,
            emotions: analysis.emotions,
            interactionCount: customerInteractions,
            priorityScore,
            priorityCategory: getPriorityCategory(priorityScore),
            language: analysis.language,
            lastMessage: msg.message,
            timestamp: msg.timestamp,
          } as CustomerAnalysisData;
        });
        
        // Wait for all analysis to complete
        const results = await Promise.all(analysisPromises);
        const validResults = results.filter(result => result !== null) as CustomerAnalysisData[];
        
        // Sort by priority score (highest first)
        const sortedResults = validResults.sort((a, b) => b.priorityScore - a.priorityScore);
        
        setCustomerAnalysis(sortedResults);
        
        // Show success message when refreshing
        if (isRefreshing) {
          toast.success("Sentiment data refreshed successfully");
        }
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("Error refreshing sentiment data");
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    };
    
    loadData();
    
    // Add event listeners for real-time updates
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('customer-message-added', handleCustomerMessageAdded);
    
    return () => {
      // Clean up event listeners
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('customer-message-added', handleCustomerMessageAdded);
    };
  }, [currentCompany, refreshKey, handleStorageChange, handleCustomerMessageAdded, isRefreshing]);
  
  // Handle manual refresh
  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setRefreshKey(prev => prev + 1);
  };
  
  // Handle feedback submission with original message text
  const handleFeedback = (
    customer: CustomerAnalysisData,
    correctedEmotion?: Emotion,
    correctedSentiment?: 'positive' | 'negative' | 'neutral'
  ) => {
    // Save feedback with original message text
    saveFeedback(
      customer.customerId,
      {
        sentiment: customer.sentiment,
        sentimentScore: customer.sentimentScore,
        emotions: customer.emotions,
        dominantEmotion: customer.dominantEmotion,
        language: customer.language,
        confidenceScore: Math.max(...customer.emotions.map(e => e.confidence)),
        originalText: customer.lastMessage // Now this property exists in the type
      },
      correctedEmotion,
      correctedSentiment,
      customer.lastMessage
    );
    
    // Update UI with correction
    setCustomerAnalysis(prev => 
      prev.map(c => 
        c.customerId === customer.customerId && c.timestamp === customer.timestamp
          ? {
              ...c,
              dominantEmotion: correctedEmotion || c.dominantEmotion,
              sentiment: correctedSentiment || c.sentiment
            }
          : c
      )
    );
    
    toast.success("Feedback submitted. This will help improve future analysis.");
  };
  
  return (
    <MainLayout>
      <PageContainer>
        <div className="flex flex-col space-y-2 mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Advanced Sentiment Analysis</h1>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleManualRefresh} 
              disabled={isRefreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
            </Button>
          </div>
          <p className="text-muted-foreground">
            Analyze customer emotions, sentiment, and priority across languages.
          </p>
        </div>
        
        <Tabs defaultValue="summary" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-5 mb-4">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="emotions">Emotions</TabsTrigger>
            <TabsTrigger value="priorities">Priorities</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="languages">Languages</TabsTrigger>
          </TabsList>
          
          <TabsContent value="summary" className="mt-0">
            <SentimentSummary 
              customerAnalysis={customerAnalysis} 
              isLoading={isLoading} 
              onFeedback={handleFeedback}
            />
          </TabsContent>
          
          <TabsContent value="emotions" className="mt-0">
            <EmotionDistribution 
              customerAnalysis={customerAnalysis} 
              isLoading={isLoading} 
            />
          </TabsContent>
          
          <TabsContent value="priorities" className="mt-0">
            <CustomerPriorityList 
              customerAnalysis={customerAnalysis} 
              isLoading={isLoading} 
              onFeedback={handleFeedback}
            />
          </TabsContent>
          
          <TabsContent value="trends" className="mt-0">
            <SentimentTrends 
              customerAnalysis={customerAnalysis} 
              isLoading={isLoading} 
            />
          </TabsContent>
          
          <TabsContent value="languages" className="mt-0">
            <LanguageDistribution 
              customerAnalysis={customerAnalysis} 
              isLoading={isLoading} 
            />
          </TabsContent>
        </Tabs>
      </PageContainer>
    </MainLayout>
  );
}
