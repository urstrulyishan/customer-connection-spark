import React, { useState, useEffect } from "react";
import { MainLayout } from "@/layouts/main-layout";
import { PageContainer, SectionContainer } from "@/components/ui/container";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingCart, Check, ArrowRight, BarChart3, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCompany } from "@/contexts/CompanyContext";
import { toast } from "sonner";
import { analyzeEmotions, analyzeSentiment } from "@/utils/emotionAnalysisUtils";
import { Textarea } from "@/components/ui/textarea";

interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  category: string;
  image: string;
}

const products: Product[] = [
  {
    id: "prod1",
    name: "Enterprise CRM Suite",
    description: "Complete CRM solution for enterprise customers with AI-powered analytics",
    price: "₹24,999",
    category: "Software",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1000"
  },
  {
    id: "prod2",
    name: "Data Analytics Package",
    description: "Advanced data mining and business intelligence tools",
    price: "₹18,500",
    category: "Software",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1000"
  },
  {
    id: "prod3",
    name: "Cloud Integration Service",
    description: "Seamless integration between your existing systems and IshanTech cloud services",
    price: "₹32,000",
    category: "Service",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1000"
  },
  {
    id: "prod4",
    name: "Security Suite Premium",
    description: "Enterprise-grade security solution with continuous monitoring",
    price: "₹15,750",
    category: "Software",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1000"
  }
];

export default function IshanTechDemo() {
  const [currentStep, setCurrentStep] = useState<'browse' | 'checkout' | 'complete'>('browse');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [feedback, setFeedback] = useState<string>('');
  const { toast } = useToast();
  const navigate = useNavigate();
  const { currentCompany } = useCompany();

  // Create a default user for the demo
  const defaultUser = {
    id: `demo-user-${Date.now()}`,
    name: "Demo User",
    email: "demo@example.com"
  };

  const addToCart = (productId: string) => {
    setSelectedProducts([...selectedProducts, productId]);
    
    const product = products.find(p => p.id === productId);
    if (product) {
      setCurrentProduct(product);
    }
    
    toast({
      title: "Added to cart",
      description: "Product has been added to your cart",
    });
  };

  const proceedToCheckout = () => {
    if (selectedProducts.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Please add products to your cart before checkout",
        variant: "destructive"
      });
      return;
    }
    setCurrentStep('checkout');
  };

  const saveCustomerMessage = async (customerId: string, message: string) => {
    try {
      const companyId = currentCompany?.id || JSON.parse(localStorage.getItem("currentCompany") || "{}").id;
      
      // Get existing messages
      const messagesKey = `customer_messages_${companyId}`;
      const existingMessages = JSON.parse(localStorage.getItem(messagesKey) || "[]");
      
      // Create new message
      const newMessage = {
        customerId: customerId,
        message: message,
        timestamp: new Date().toISOString()
      };
      
      // Add to start of array for newest first
      const updatedMessages = [newMessage, ...existingMessages];
      
      // Save back to localStorage
      localStorage.setItem(messagesKey, JSON.stringify(updatedMessages));
      
      // Dispatch storage event to notify other tabs
      window.dispatchEvent(new CustomEvent('customer-message-added', {
        detail: { message: newMessage }
      }));
      
      console.log("Customer message saved", newMessage);
      return true;
    } catch (error) {
      console.error("Error saving customer message:", error);
      return false;
    }
  };

  const completeOrder = async () => {
    // First, save the feedback as a customer message for sentiment analysis
    if (feedback.trim()) {
      await saveCustomerMessage(defaultUser.id, feedback);
    }
    
    // Analyze feedback sentiment
    const sentimentResult = analyzeSentiment(feedback);
    
    // Update local storage with the purchase for CRM integration
    if (currentCompany) {
      const purchaseData = {
        id: `purchase-${Date.now()}`,
        customer: defaultUser.name,
        email: defaultUser.email,
        customerId: defaultUser.id,
        products: selectedProducts.map(id => {
          const product = products.find(p => p.id === id);
          return {
            id,
            name: product?.name,
            price: product?.price
          };
        }),
        total: selectedProducts.reduce((total, id) => {
          const product = products.find(p => p.id === id);
          return total + parseInt(product?.price.replace(/[^\d]/g, '') || "0");
        }, 0),
        date: new Date().toISOString(),
        feedback: feedback,
        sentiment: sentimentResult
      };
      
      // Store the purchase in localStorage
      const existingPurchases = JSON.parse(localStorage.getItem(`purchases_${currentCompany.id}`) || "[]");
      localStorage.setItem(`purchases_${currentCompany.id}`, JSON.stringify([purchaseData, ...existingPurchases]));
      
      // Create an activity for this purchase
      const activity = {
        id: `activity-${Date.now()}`,
        customerId: defaultUser.id,
        customerName: defaultUser.name,
        customerEmail: defaultUser.email,
        type: "Purchase",
        details: `Purchased ${selectedProducts.length} items for ₹${purchaseData.total.toLocaleString()}`,
        timestamp: purchaseData.date,
        feedback: feedback,
        sentiment: sentimentResult
      };
      
      // Add to activities
      const activitiesKey = `customer_activities_${currentCompany.id}`;
      const activities = JSON.parse(localStorage.getItem(activitiesKey) || "[]");
      localStorage.setItem(activitiesKey, JSON.stringify([activity, ...activities]));
      
      // Dispatch custom event to notify other tabs/components about the purchase
      window.dispatchEvent(new Event('storage'));
      
      // Use toast to notify about successful integration with CRM
      toast({
        title: "Purchase Integrated with CRM",
        description: "Your purchase data has been sent to the CRM system",
      });
    }
    
    setCurrentStep('complete');
    
    // Clear cart and feedback
    setSelectedProducts([]);
    setFeedback('');
  };

  const viewDashboard = () => {
    toast({
      title: "Navigating to Dashboard",
      description: "Your purchase data has been integrated with the CRM",
    });
    setTimeout(() => navigate('/'), 1000);
  };

  const viewSentimentAnalysis = () => {
    navigate('/sentiment-analysis');
  };

  return (
    <MainLayout>
      <div className="flex flex-col min-h-screen">
        {/* Header */}
        <header className="bg-primary py-4 border-b">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Home className="h-6 w-6 text-primary-foreground" />
                <h1 className="text-2xl font-bold text-primary-foreground">IshanTech</h1>
              </div>
              <div className="flex items-center space-x-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="hidden md:flex bg-background text-foreground"
                  onClick={() => navigate('/')}
                >
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Back to CRM
                </Button>
                
                <Button variant="ghost" size="icon" className="text-primary-foreground">
                  <ShoppingCart className="h-5 w-5" />
                  {selectedProducts.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs">
                      {selectedProducts.length}
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </header>

        <PageContainer className="flex-1">
          {currentStep === 'browse' && (
            <>
              <div className="py-8 text-center">
                <h1 className="text-3xl font-bold mb-2">Enterprise Software Solutions</h1>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  IshanTech provides cutting-edge software solutions for modern businesses. 
                  Explore our products and experience the power of intelligent technology.
                </p>
              </div>

              <Tabs defaultValue="all" className="mb-8">
                <TabsList className="mx-auto">
                  <TabsTrigger value="all">All Products</TabsTrigger>
                  <TabsTrigger value="software">Software</TabsTrigger>
                  <TabsTrigger value="service">Services</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {products.map((product) => (
                      <Card key={product.id} className="overflow-hidden h-full flex flex-col">
                        <div 
                          className="h-40 bg-muted bg-cover bg-center"
                          style={{ backgroundImage: `url(${product.image})` }}
                        />
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-lg">{product.name}</CardTitle>
                            <Badge>{product.category}</Badge>
                          </div>
                          <CardDescription>{product.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="pb-2 flex-grow">
                          <p className="text-2xl font-bold">{product.price}</p>
                        </CardContent>
                        <CardFooter>
                          <Button 
                            className="w-full" 
                            onClick={() => addToCart(product.id)}
                            disabled={selectedProducts.includes(product.id)}
                          >
                            {selectedProducts.includes(product.id) ? (
                              <>
                                <Check className="mr-2 h-4 w-4" />
                                Added to Cart
                              </>
                            ) : (
                              <>
                                <ShoppingCart className="mr-2 h-4 w-4" />
                                Add to Cart
                              </>
                            )}
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="software" className="mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {products
                      .filter(p => p.category === "Software")
                      .map((product) => (
                        <Card key={product.id} className="overflow-hidden h-full flex flex-col">
                          <div 
                            className="h-40 bg-muted bg-cover bg-center"
                            style={{ backgroundImage: `url(${product.image})` }}
                          />
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                              <CardTitle className="text-lg">{product.name}</CardTitle>
                              <Badge>{product.category}</Badge>
                            </div>
                            <CardDescription>{product.description}</CardDescription>
                          </CardHeader>
                          <CardContent className="pb-2 flex-grow">
                            <p className="text-2xl font-bold">{product.price}</p>
                          </CardContent>
                          <CardFooter>
                            <Button 
                              className="w-full" 
                              onClick={() => addToCart(product.id)}
                              disabled={selectedProducts.includes(product.id)}
                            >
                              {selectedProducts.includes(product.id) ? (
                                <>
                                  <Check className="mr-2 h-4 w-4" />
                                  Added to Cart
                                </>
                              ) : (
                                <>
                                  <ShoppingCart className="mr-2 h-4 w-4" />
                                  Add to Cart
                                </>
                              )}
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                  </div>
                </TabsContent>

                <TabsContent value="service" className="mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {products
                      .filter(p => p.category === "Service")
                      .map((product) => (
                        <Card key={product.id} className="overflow-hidden h-full flex flex-col">
                          <div 
                            className="h-40 bg-muted bg-cover bg-center"
                            style={{ backgroundImage: `url(${product.image})` }}
                          />
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                              <CardTitle className="text-lg">{product.name}</CardTitle>
                              <Badge>{product.category}</Badge>
                            </div>
                            <CardDescription>{product.description}</CardDescription>
                          </CardHeader>
                          <CardContent className="pb-2 flex-grow">
                            <p className="text-2xl font-bold">{product.price}</p>
                          </CardContent>
                          <CardFooter>
                            <Button 
                              className="w-full" 
                              onClick={() => addToCart(product.id)}
                              disabled={selectedProducts.includes(product.id)}
                            >
                              {selectedProducts.includes(product.id) ? (
                                <>
                                  <Check className="mr-2 h-4 w-4" />
                                  Added to Cart
                                </>
                              ) : (
                                <>
                                  <ShoppingCart className="mr-2 h-4 w-4" />
                                  Add to Cart
                                </>
                              )}
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                  </div>
                </TabsContent>
              </Tabs>

              {selectedProducts.length > 0 && (
                <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 shadow-lg">
                  <div className="container mx-auto flex justify-between items-center">
                    <div>
                      <p className="font-medium">{selectedProducts.length} item(s) in cart</p>
                      <p className="text-muted-foreground">Total: ₹{
                        selectedProducts.reduce((total, id) => {
                          const product = products.find(p => p.id === id);
                          return total + parseInt(product?.price.replace(/[^\d]/g, '') || "0");
                        }, 0).toLocaleString()
                      }</p>
                    </div>
                    <Button onClick={proceedToCheckout}>
                      Proceed to Checkout
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}

          {currentStep === 'checkout' && (
            <SectionContainer className="max-w-2xl mx-auto py-8">
              <Card>
                <CardHeader>
                  <CardTitle>Complete Your Purchase</CardTitle>
                  <CardDescription>Review your order before finalizing</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Order Summary</h3>
                    <div className="border rounded-md divide-y">
                      {selectedProducts.map(id => {
                        const product = products.find(p => p.id === id);
                        return (
                          <div key={id} className="p-3 flex justify-between items-center">
                            <div>
                              <p className="font-medium">{product?.name}</p>
                              <p className="text-sm text-muted-foreground">{product?.category}</p>
                            </div>
                            <p className="font-medium">{product?.price}</p>
                          </div>
                        );
                      })}
                      <div className="p-3 flex justify-between items-center bg-muted">
                        <p className="font-bold">Total</p>
                        <p className="font-bold">₹{
                          selectedProducts.reduce((total, id) => {
                            const product = products.find(p => p.id === id);
                            return total + parseInt(product?.price.replace(/[^\d]/g, '') || "0");
                          }, 0).toLocaleString()
                        }</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2">Customer Information</h3>
                    <div className="border rounded-md p-3">
                      <p><span className="font-medium">Name:</span> {defaultUser.name}</p>
                      <p><span className="font-medium">Email:</span> {defaultUser.email}</p>
                      <p><span className="font-medium">Company:</span> IshanTech</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2">Feedback</h3>
                    <Textarea
                      placeholder="How do you feel about your purchase? (optional)"
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <h3 className="font-medium mb-2">Payment Method</h3>
                    <div className="border rounded-md p-3">
                      <p>Credit Card ending in ****4242</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={() => setCurrentStep('browse')}>
                    Back to Shopping
                  </Button>
                  <Button onClick={completeOrder}>
                    Complete Order
                  </Button>
                </CardFooter>
              </Card>
            </SectionContainer>
          )}

          {currentStep === 'complete' && (
            <SectionContainer className="max-w-2xl mx-auto py-12 text-center">
              <div className="bg-green-100 rounded-full h-24 w-24 flex items-center justify-center mx-auto mb-6">
                <Check className="h-12 w-12 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Order Completed!</h2>
              <p className="text-muted-foreground mb-6">
                Thank you for your purchase. Your order has been processed and the transaction data 
                has been sent to our CRM system. You can view this data in your CRM dashboard.
              </p>
              <div className="space-y-2">
                <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2 justify-center">
                  <Button onClick={viewDashboard} className="w-full sm:w-auto">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    View in CRM Dashboard
                  </Button>
                  
                  <Button 
                    variant="secondary" 
                    onClick={viewSentimentAnalysis} 
                    className="w-full sm:w-auto"
                  >
                    <BarChart3 className="mr-2 h-4 w-4" />
                    View Sentiment Analysis
                  </Button>
                </div>
                <div className="h-2"></div>
                <Button variant="outline" onClick={() => setCurrentStep('browse')} className="w-full sm:w-auto">
                  Continue Shopping
                </Button>
              </div>
            </SectionContainer>
          )}
        </PageContainer>

        {/* Footer */}
        <footer className="bg-muted py-6">
          <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
            <p>© 2025 IshanTech. All rights reserved.</p>
            <p className="mt-2">This is a demo website for the Customer Relationship Model project.</p>
          </div>
        </footer>
      </div>
    </MainLayout>
  );
}
