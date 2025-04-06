
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMutation } from "@tanstack/react-query";
import { Mic, Send, StopCircle, Bot, User, Paperclip, Image, Brain } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

// Enhanced mock data for the AI chatbot
const customerDatabase = [
  {
    name: "Ishan Prakash",
    email: "ishan@ishantech.com",
    lastPurchase: { 
      product: "Enterprise CRM Suite", 
      amount: "₹24,999", 
      date: "2023-04-01" 
    },
    interactions: 15,
    status: "active"
  },
  {
    name: "Prakhar Gupta",
    email: "prakhar@example.com",
    lastPurchase: { 
      product: "Data Analytics Package", 
      amount: "₹18,500", 
      date: "2023-03-28" 
    },
    interactions: 8,
    status: "new"
  },
  {
    name: "Abhinaya Singh",
    email: "abhinaya@innovate.com",
    lastPurchase: { 
      product: "Cloud Integration Service", 
      amount: "₹32,000", 
      date: "2023-03-15" 
    },
    interactions: 12,
    status: "active"
  },
  {
    name: "Divyanshi Sharma",
    email: "divyanshi@matrix.com",
    lastPurchase: { 
      product: "Security Suite Premium", 
      amount: "₹15,750", 
      date: "2023-04-03" 
    },
    interactions: 5,
    status: "potential"
  }
];

// Enhanced AI response generation
const generateAIResponse = (message: string): Promise<string> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const lowercaseMessage = message.toLowerCase();
      
      // Check for customer queries
      if (lowercaseMessage.includes("ishan") && lowercaseMessage.includes("purchase")) {
        const customer = customerDatabase.find(c => c.name.toLowerCase().includes("ishan"));
        resolve(`Ishan Prakash's latest purchase was ${customer?.lastPurchase.product} for ${customer?.lastPurchase.amount} on ${new Date(customer?.lastPurchase.date!).toLocaleDateString()}.`);
      } 
      else if (lowercaseMessage.includes("prakhar") && lowercaseMessage.includes("purchase")) {
        const customer = customerDatabase.find(c => c.name.toLowerCase().includes("prakhar"));
        resolve(`Prakhar Gupta's latest purchase was ${customer?.lastPurchase.product} for ${customer?.lastPurchase.amount} on ${new Date(customer?.lastPurchase.date!).toLocaleDateString()}.`);
      }
      else if (lowercaseMessage.includes("abhinaya") && lowercaseMessage.includes("purchase")) {
        const customer = customerDatabase.find(c => c.name.toLowerCase().includes("abhinaya"));
        resolve(`Abhinaya Singh's latest purchase was ${customer?.lastPurchase.product} for ${customer?.lastPurchase.amount} on ${new Date(customer?.lastPurchase.date!).toLocaleDateString()}.`);
      }
      else if (lowercaseMessage.includes("divyanshi") && lowercaseMessage.includes("purchase")) {
        const customer = customerDatabase.find(c => c.name.toLowerCase().includes("divyanshi"));
        resolve(`Divyanshi Sharma's latest purchase was ${customer?.lastPurchase.product} for ${customer?.lastPurchase.amount} on ${new Date(customer?.lastPurchase.date!).toLocaleDateString()}.`);
      }
      // Customer data queries
      else if (lowercaseMessage.includes("customer") && lowercaseMessage.includes("data")) {
        resolve("I can help you access customer data. You can ask about specific customers like 'Show me Ishan's latest purchase' or view analytics by asking 'Show me sales trends'.");
      }
      // Analytics queries
      else if (lowercaseMessage.includes("analytics") || lowercaseMessage.includes("trends") || lowercaseMessage.includes("statistics")) {
        resolve("Our AI-powered analytics show positive growth trends. Total sales this month are ₹48,590, up 8% from last month. Lead quality score is at 72%, showing a 5% improvement.");
      }
      // Integration/sync questions
      else if (lowercaseMessage.includes("connect") || lowercaseMessage.includes("integrate") || lowercaseMessage.includes("sync")) {
        resolve("You can connect external platforms by visiting the Platform Connections page. We support API, webhook, database, email, and e-commerce integrations. Would you like me to navigate you there?");
      }
      // IshanTech demo
      else if (lowercaseMessage.includes("ishantech") || lowercaseMessage.includes("demo")) {
        resolve("The IshanTech demo website is available for testing our CRM integration. You can visit it to make sample purchases that will automatically reflect in our analytics dashboard. Would you like me to take you to the demo site?");
      }
      // Help or command list
      else if (lowercaseMessage.includes("help") || lowercaseMessage.includes("commands") || lowercaseMessage.includes("what can you do")) {
        resolve("I can help you with:\n- Customer information (e.g., 'Show me Ishan's data')\n- Analytics and trends (e.g., 'Show sales trends')\n- Platform connections (e.g., 'How to connect my website')\n- IshanTech demo (e.g., 'Take me to the demo site')\n- Navigating the CRM (e.g., 'Go to leads page')");
      }
      // Navigation
      else if (lowercaseMessage.includes("go to") || lowercaseMessage.includes("navigate to") || lowercaseMessage.includes("take me to")) {
        if (lowercaseMessage.includes("customer")) {
          resolve("I'll navigate you to the Customers page where you can manage all your customer relationships.");
        } else if (lowercaseMessage.includes("lead")) {
          resolve("I'll take you to the Leads page where you can track potential customers and sales opportunities.");
        } else if (lowercaseMessage.includes("message")) {
          resolve("I'll direct you to the Messages page where you can manage all communications with your customers.");
        } else if (lowercaseMessage.includes("demo") || lowercaseMessage.includes("ishantech")) {
          resolve("I'll take you to the IshanTech demo site where you can see our CRM integration in action.");
        } else {
          resolve("I can navigate you to different pages in the CRM. Where would you like to go? Customers, Leads, Messages, or the IshanTech demo?");
        }
      }
      // Generic greeting
      else if (lowercaseMessage.includes("hello") || lowercaseMessage.includes("hi")) {
        resolve("Hello! I'm your AI assistant for the Customer Relationship Model. How can I help you today? You can ask about customer data, analytics, platform connections, or navigate to different parts of the CRM.");
      }
      // Generic fallback
      else {
        resolve("I understand you're asking about " + message.split(" ").slice(0, 3).join(" ") + "... I can provide information on customers, analytics, platform connections, and help you navigate the CRM. Could you please clarify what specific information you need?");
      }
    }, 800);
  });
};

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      content: "Hello! I'm your AI assistant for the Customer Relationship Model. How can I help you today?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [useTextarea, setUseTextarea] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const { toast } = useToast();
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const navigate = useNavigate();

  // Scroll to bottom whenever messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessageMutation = useMutation({
    mutationFn: generateAIResponse,
    onSuccess: (response) => {
      const botMessage: Message = {
        id: Date.now().toString(),
        content: response,
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
      
      // Handle navigation based on AI response
      handleNavigation(response);
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to process your request. Please try again.",
      });
    },
  });

  const handleNavigation = (response: string) => {
    if (response.includes("I'll navigate you to the Customers page")) {
      setTimeout(() => navigate("/customers"), 1000);
    } else if (response.includes("I'll take you to the Leads page")) {
      setTimeout(() => navigate("/leads"), 1000);
    } else if (response.includes("I'll direct you to the Messages page")) {
      setTimeout(() => navigate("/messages"), 1000);
    } else if (response.includes("I'll take you to the IshanTech demo site")) {
      setTimeout(() => navigate("/ishantech-demo"), 1000);
    } else if (response.includes("Platform Connections page") && response.includes("navigate you there")) {
      setTimeout(() => navigate("/platform-connections"), 1000);
    }
  };

  const handleSendMessage = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    sendMessageMutation.mutate(input);
    setInput("");
    
    // Focus the input after sending
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      toast({
        title: "Recording stopped",
        description: "Speech recognition is not implemented in this demo.",
      });
    } else {
      setIsRecording(true);
      toast({
        title: "Recording started",
        description: "Speech recognition is not implemented in this demo.",
      });
    }
  };

  const handleAttachFile = () => {
    toast({
      title: "File attachment",
      description: "File attachment functionality is not implemented in this demo.",
    });
  };

  const handleImageAttachment = () => {
    toast({
      title: "Image attachment",
      description: "Image attachment functionality is not implemented in this demo.",
    });
  };

  const clearConversation = () => {
    setMessages([
      {
        id: "welcome",
        content: "Hello! I'm your AI assistant for the Customer Relationship Model. How can I help you today?",
        isUser: false,
        timestamp: new Date(),
      },
    ]);
    toast({
      title: "Conversation cleared",
      description: "All previous messages have been removed.",
    });
  };

  return (
    <div className={cn(
      "flex flex-col h-[calc(100vh-6rem)] border rounded-xl shadow-sm overflow-hidden",
      darkMode ? "bg-zinc-900 text-white" : "bg-white"
    )}>
      {/* Header */}
      <div className={cn(
        "flex items-center justify-between px-4 py-3 border-b",
        darkMode ? "border-zinc-700 bg-zinc-800" : "border-gray-200"
      )}>
        <div className="flex items-center gap-3">
          <Avatar className={darkMode ? "bg-zinc-700" : "bg-primary/10"}>
            <Brain className="h-5 w-5" />
          </Avatar>
          <div>
            <h3 className="font-medium">AI Assistant</h3>
            <p className="text-xs text-muted-foreground">Customer Relationship Model</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2">
                  <Label htmlFor="dark-mode" className="text-xs">Dark Mode</Label>
                  <Switch 
                    id="dark-mode" 
                    checked={darkMode} 
                    onCheckedChange={setDarkMode} 
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Toggle dark mode</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <circle cx="12" cy="12" r="1" />
                  <circle cx="19" cy="12" r="1" />
                  <circle cx="5" cy="12" r="1" />
                </svg>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={clearConversation}>
                Clear conversation
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setUseTextarea(!useTextarea)}>
                {useTextarea ? "Use single line input" : "Use multiline input"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Chat container */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex items-start gap-3 animate-fade-in",
                message.isUser ? "justify-end" : "justify-start"
              )}
            >
              {!message.isUser && (
                <Avatar className={cn(
                  "h-8 w-8", 
                  darkMode ? "bg-zinc-700" : "bg-primary/10"
                )}>
                  <Brain className="h-4 w-4" />
                </Avatar>
              )}
              <div
                className={cn(
                  "rounded-lg px-3 py-2 max-w-[80%]",
                  message.isUser
                    ? darkMode 
                      ? "bg-blue-600 text-white" 
                      : "bg-primary text-primary-foreground"
                    : darkMode 
                      ? "bg-zinc-800" 
                      : "bg-muted"
                )}
              >
                <p className="text-sm whitespace-pre-line">{message.content}</p>
                <span className="text-xs opacity-70 mt-1 block">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              {message.isUser && (
                <Avatar className={cn(
                  "h-8 w-8", 
                  darkMode ? "bg-zinc-700" : "bg-primary/10"
                )}>
                  <User className="h-4 w-4" />
                </Avatar>
              )}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {/* Input area */}
      <div className={cn(
        "p-3 border-t",
        darkMode ? "border-zinc-700 bg-zinc-800" : "border-gray-200"
      )}>
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            {useTextarea ? (
              <Textarea
                ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me about customers, analytics, or how to navigate the CRM..."
                className={cn(
                  "min-h-[80px] resize-none pr-10",
                  darkMode ? "bg-zinc-800 border-zinc-700" : ""
                )}
              />
            ) : (
              <Input
                ref={inputRef as React.RefObject<HTMLInputElement>}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me about customers, analytics, or how to navigate the CRM..."
                className={cn(
                  "pr-10",
                  darkMode ? "bg-zinc-800 border-zinc-700" : ""
                )}
              />
            )}
          </div>

          <div className="flex gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9"
                    onClick={handleAttachFile}
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Attach file</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9"
                    onClick={handleImageAttachment}
                  >
                    <Image className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Attach image</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9"
                    onClick={toggleRecording}
                  >
                    {isRecording ? (
                      <StopCircle className="h-4 w-4 text-red-500" />
                    ) : (
                      <Mic className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isRecording ? "Stop recording" : "Start recording"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Button
              onClick={handleSendMessage}
              disabled={!input.trim() || sendMessageMutation.isPending}
              className="h-9 px-3 gap-1"
            >
              <Send className="h-4 w-4" />
              <span className="hidden sm:inline">Send</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
