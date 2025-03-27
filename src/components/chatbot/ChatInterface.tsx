
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMutation } from "@tanstack/react-query";
import { Mic, Send, StopCircle, Bot, User, Paperclip, Image } from "lucide-react";
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

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

// Mock API call to simulate sending a message to a chatbot
const sendMessageToBot = async (message: string): Promise<string> => {
  // This simulates an API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));
  
  // Simple responses based on user input
  const lowercaseMessage = message.toLowerCase();

  if (lowercaseMessage.includes("hello") || lowercaseMessage.includes("hi")) {
    return "Hello! How can I assist you today?";
  } else if (lowercaseMessage.includes("help")) {
    return "I'm here to help. What do you need assistance with?";
  } else if (lowercaseMessage.includes("bye") || lowercaseMessage.includes("goodbye")) {
    return "Goodbye! Have a great day!";
  } else if (lowercaseMessage.includes("thank")) {
    return "You're welcome! Is there anything else you need help with?";
  } else if (lowercaseMessage.includes("feature") || lowercaseMessage.includes("can you")) {
    return "Currently I can chat with you, but more features will be added soon. What would you like to know?";
  } else {
    return "I understand your message. How else can I assist you today?";
  }
};

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      content: "Hello! How can I help you today?",
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

  // Scroll to bottom whenever messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessageMutation = useMutation({
    mutationFn: sendMessageToBot,
    onSuccess: (response) => {
      const botMessage: Message = {
        id: Date.now().toString(),
        content: response,
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send message. Please try again.",
      });
    },
  });

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
        content: "Hello! How can I help you today?",
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
            <Bot className="h-5 w-5" />
          </Avatar>
          <div>
            <h3 className="font-medium">AI Assistant</h3>
            <p className="text-xs text-muted-foreground">Online</p>
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
                  <Bot className="h-4 w-4" />
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
                <p className="text-sm">{message.content}</p>
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
                placeholder="Type a message..."
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
                placeholder="Type a message..."
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
