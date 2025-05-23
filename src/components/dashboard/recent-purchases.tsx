
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Calendar, ArrowRight, User, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useCompany } from "@/contexts/CompanyContext";
import { getSentimentColor } from "@/utils/sentimentAnalysisUtils";

interface PurchaseItem {
  id: string;
  name: string;
  price: string;
}

interface SentimentResult {
  sentiment: 'positive' | 'negative' | 'neutral';
  score: number;
  confidence: number;
}

interface Purchase {
  id: string;
  customer: string;
  email: string;
  customerId?: string;
  products: PurchaseItem[];
  total: number;
  date: string;
  feedback?: string;
  sentiment?: SentimentResult;
}

export function RecentPurchases() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const { currentCompany } = useCompany();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Function to load purchases
    const loadPurchases = () => {
      if (!currentCompany?.id) return;
      
      const companyId = currentCompany.id;
      const storedPurchases = localStorage.getItem(`purchases_${companyId}`);
      
      if (storedPurchases) {
        const parsedPurchases = JSON.parse(storedPurchases);
        setPurchases(parsedPurchases);
      }
    };
    
    // Load initially
    loadPurchases();
    
    // Set up event listener for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key && e.key.startsWith(`purchases_`)) {
        loadPurchases();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Custom event listener for non-storage events
    const handleCustomStorage = () => loadPurchases();
    window.addEventListener('storage', handleCustomStorage);
    
    // Poll for changes every 2 seconds as a fallback
    const interval = setInterval(loadPurchases, 2000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('storage', handleCustomStorage);
      clearInterval(interval);
    };
  }, [currentCompany]);
  
  const handleViewCustomer = (customerId: string) => {
    // In a real app, this would navigate to the customer profile
    console.log("Viewing customer:", customerId);
  };
  
  if (purchases.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Recent Purchases</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <ShoppingCart className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No purchase data available</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-4"
              onClick={() => navigate('/ishantech-demo')}
            >
              Try IshanTech Demo
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium">Recent Purchases</CardTitle>
          <ShoppingCart className="h-5 w-5 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {purchases.slice(0, 3).map((purchase, index) => (
            <div 
              key={purchase.id} 
              className="border rounded-md p-3 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center">
                  <div className="bg-primary/10 rounded-full p-1.5 mr-2">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{purchase.customer}</p>
                    <p className="text-sm text-muted-foreground">{purchase.email}</p>
                  </div>
                </div>
                <Badge variant="outline" className="font-medium">₹{purchase.total.toLocaleString()}</Badge>
              </div>
              
              <div className="text-sm space-y-1">
                {purchase.products.map((product) => (
                  <div key={product.id} className="flex justify-between">
                    <span>{product.name}</span>
                    <span>{product.price}</span>
                  </div>
                ))}
              </div>
              
              {purchase.feedback && (
                <div className="mt-2 text-sm">
                  <div className="flex items-center gap-1 mb-1">
                    <MessageSquare className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Feedback:</span>
                  </div>
                  <p className="italic text-muted-foreground">{purchase.feedback}</p>
                  
                  {purchase.sentiment && (
                    <div className="mt-1 flex items-center gap-2">
                      <span 
                        className={`text-xs px-2 py-0.5 rounded-full ${getSentimentColor(purchase.sentiment.sentiment)}`}
                      >
                        {purchase.sentiment.sentiment.charAt(0).toUpperCase() + purchase.sentiment.sentiment.slice(1)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {(purchase.sentiment.confidence * 100).toFixed(0)}% confidence
                      </span>
                    </div>
                  )}
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-3 pt-2 border-t">
                <div className="flex items-center text-xs text-muted-foreground space-x-2">
                  <Calendar className="h-3 w-3" />
                  <time dateTime={purchase.date} className="font-medium">
                    {new Date(purchase.date).toLocaleDateString(undefined, {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </time>
                  <span>•</span>
                  <time dateTime={purchase.date} className="font-medium">
                    {new Date(purchase.date).toLocaleTimeString(undefined, {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </time>
                </div>
                
                {purchase.customerId && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 text-xs" 
                    onClick={() => handleViewCustomer(purchase.customerId!)}
                  >
                    View Customer
                  </Button>
                )}
              </div>
            </div>
          ))}
          
          {purchases.length > 3 && (
            <Button variant="ghost" size="sm" className="w-full text-xs">
              View All Purchases
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
