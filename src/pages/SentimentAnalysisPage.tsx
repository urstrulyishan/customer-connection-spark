
import { useEffect, useState } from "react";
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
  
  // Load data and perform analysis
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      
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
        const storedMessages = localStorage.getItem(`customer_messages_${companyId}`);
        const messages = storedMessages ? JSON.parse(storedMessages) : sampleCustomerMessages;
        
        // Save sample messages if none exist
        if (!storedMessages) {
          localStorage.setItem(`customer_messages_${companyId}`, JSON.stringify(sampleCustomerMessages));
        }
        
        // Process customer messages with emotion analysis
        const analysisPromises = messages.map(async (msg: any) => {
          // Find customer
          const customer = customersData.find((c: CustomerData) => c.id === msg.customerId);
          if (!customer) return null;
          
          // Count interactions for this customer
          const customerInteractions = messages.filter((m: any) => m.customerId === msg.customerId).length;
          
          // Analyze emotions in message
          const analysis = await analyzeEmotions(msg.message);
          
          // Calculate priority
          const priorityScore = calculatePriority(
            analysis.sentimentScore,
            analysis.dominantEmotion,
            customerInteractions
          );
          
          return {
            customerId: customer.id,
            customerName: customer.name,
            customerInitials: customer.initials,
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
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [currentCompany]);
  
  // Handle feedback submission
  const handleFeedback = (
    customer: CustomerAnalysisData,
    correctedEmotion?: Emotion,
    correctedSentiment?: 'positive' | 'negative' | 'neutral'
  ) => {
    // Save feedback
    saveFeedback(
      customer.customerId,
      {
        sentiment: customer.sentiment,
        sentimentScore: customer.sentimentScore,
        emotions: customer.emotions,
        dominantEmotion: customer.dominantEmotion,
        language: customer.language,
        confidenceScore: Math.max(...customer.emotions.map(e => e.confidence)) 
      },
      correctedEmotion,
      correctedSentiment
    );
    
    // Update UI with correction
    setCustomerAnalysis(prev => 
      prev.map(c => 
        c.customerId === customer.customerId
          ? {
              ...c,
              dominantEmotion: correctedEmotion || c.dominantEmotion,
              sentiment: correctedSentiment || c.sentiment
            }
          : c
      )
    );
  };
  
  return (
    <MainLayout>
      <PageContainer>
        <div className="flex flex-col space-y-2 mb-6">
          <h1 className="text-2xl font-bold text-center mb-4">Advanced Sentiment Analysis</h1>
          <p className="text-muted-foreground text-center">
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
