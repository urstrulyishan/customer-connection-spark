
import { PageContainer, SectionContainer } from "@/components/ui/container";
import { MainLayout } from "@/layouts/main-layout";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Paperclip, Plus, Search, Send, Smile } from "lucide-react";
import { useState } from "react";

interface MessageData {
  id: string;
  sender: "customer" | "me";
  customer?: {
    name: string;
    avatar?: string;
    initials: string;
  };
  time: string;
  content: string;
}

interface ConversationData {
  id: string;
  customer: {
    name: string;
    avatar?: string;
    initials: string;
  };
  lastMessage: string;
  lastMessageTime: string;
  unread: boolean;
  messages: MessageData[];
}

// Sample data
const conversations: ConversationData[] = [
  {
    id: "1",
    customer: {
      name: "Emma Thompson",
      initials: "ET",
    },
    lastMessage: "Thanks for the quick response!",
    lastMessageTime: "10:30 AM",
    unread: true,
    messages: [
      {
        id: "1-1",
        sender: "me",
        time: "10:15 AM",
        content: "Hello Emma, how can I help you today?"
      },
      {
        id: "1-2",
        sender: "customer",
        customer: {
          name: "Emma Thompson",
          initials: "ET",
        },
        time: "10:20 AM",
        content: "Hi, I'm having trouble with the new dashboard feature. Can you help me set it up?"
      },
      {
        id: "1-3",
        sender: "me",
        time: "10:25 AM",
        content: "Of course! I'd be happy to help. The dashboard setup process is quite simple. First, go to Settings > Dashboard, then click 'Configure'. You'll see options to customize your widgets and metrics."
      },
      {
        id: "1-4",
        sender: "customer",
        customer: {
          name: "Emma Thompson",
          initials: "ET",
        },
        time: "10:30 AM",
        content: "Thanks for the quick response!"
      }
    ]
  },
  {
    id: "2",
    customer: {
      name: "Michael Chen",
      initials: "MC",
    },
    lastMessage: "I'll review the proposal and get back to you tomorrow.",
    lastMessageTime: "Yesterday",
    unread: false,
    messages: [
      {
        id: "2-1",
        sender: "me",
        time: "Yesterday, 2:15 PM",
        content: "Hello Michael, I've sent you the proposal we discussed during our meeting."
      },
      {
        id: "2-2",
        sender: "customer",
        customer: {
          name: "Michael Chen",
          initials: "MC",
        },
        time: "Yesterday, 3:20 PM",
        content: "I'll review the proposal and get back to you tomorrow."
      }
    ]
  },
  {
    id: "3",
    customer: {
      name: "Sarah Williams",
      initials: "SW",
    },
    lastMessage: "The new features look amazing! Our team is excited to start using them.",
    lastMessageTime: "May 15",
    unread: false,
    messages: [
      {
        id: "3-1",
        sender: "me",
        time: "May 15, 11:30 AM",
        content: "Hi Sarah, following up on our meeting yesterday. I wanted to make sure you had access to all the materials we discussed."
      },
      {
        id: "3-2",
        sender: "customer",
        customer: {
          name: "Sarah Williams",
          initials: "SW",
        },
        time: "May 15, 12:45 PM",
        content: "The new features look amazing! Our team is excited to start using them."
      }
    ]
  }
];

export default function MessagesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedConversation, setSelectedConversation] = useState<ConversationData | null>(conversations[0]);
  const [newMessage, setNewMessage] = useState("");
  
  const filteredConversations = conversations.filter(conversation => 
    conversation.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conversation.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;
    
    // In a real app, you would send this to your backend
    console.log("Sending message:", newMessage);
    setNewMessage("");
  };
  
  return (
    <MainLayout>
      <PageContainer className="py-0">
        <div className="h-[calc(100vh-5rem)] flex overflow-hidden rounded-xl border shadow-card">
          {/* Conversations sidebar */}
          <div className="w-full max-w-xs border-r bg-card">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-medium">Messages</h3>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search conversations..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <div className="overflow-y-auto h-[calc(100%-5rem)]">
              {filteredConversations.map((conversation, index) => (
                <div 
                  key={conversation.id}
                  className={cn(
                    "p-4 border-b cursor-pointer hover:bg-muted/20 transition-colors animate-fade-in",
                    selectedConversation?.id === conversation.id && "bg-muted/30",
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                  onClick={() => setSelectedConversation(conversation)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="relative">
                      <Avatar className="h-10 w-10 border">
                        {conversation.customer.avatar ? (
                          <img src={conversation.customer.avatar} alt={conversation.customer.name} />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-muted text-xs font-medium">
                            {conversation.customer.initials}
                          </div>
                        )}
                      </Avatar>
                      {conversation.unread && (
                        <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-primary" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium truncate">{conversation.customer.name}</span>
                        <span className="text-xs text-muted-foreground">{conversation.lastMessageTime}</span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{conversation.lastMessage}</p>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredConversations.length === 0 && (
                <div className="p-4 text-center">
                  <p className="text-sm text-muted-foreground">No conversations found.</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Conversation area */}
          <div className="flex-1 flex flex-col bg-white">
            {selectedConversation ? (
              <>
                {/* Conversation header */}
                <div className="p-4 border-b flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10 border">
                      {selectedConversation.customer.avatar ? (
                        <img src={selectedConversation.customer.avatar} alt={selectedConversation.customer.name} />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-muted text-xs font-medium">
                          {selectedConversation.customer.initials}
                        </div>
                      )}
                    </Avatar>
                    
                    <div>
                      <h3 className="text-sm font-medium">{selectedConversation.customer.name}</h3>
                      <p className="text-xs text-muted-foreground">Online</p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Messages */}
                <div className="flex-1 p-4 overflow-y-auto">
                  <div className="space-y-4">
                    {selectedConversation.messages.map((message, index) => (
                      <div 
                        key={message.id}
                        className={cn(
                          "flex animate-fade-in",
                          message.sender === "me" ? "justify-end" : "justify-start"
                        )}
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        {message.sender === "customer" && (
                          <Avatar className="h-8 w-8 mr-2 mt-1">
                            {message.customer?.avatar ? (
                              <img src={message.customer.avatar} alt={message.customer.name} />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-muted text-xs font-medium">
                                {message.customer?.initials}
                              </div>
                            )}
                          </Avatar>
                        )}
                        
                        <div>
                          <div 
                            className={cn(
                              "max-w-md rounded-2xl p-3",
                              message.sender === "me" 
                                ? "bg-primary text-primary-foreground" 
                                : "bg-muted"
                            )}
                          >
                            <p className="text-sm">{message.content}</p>
                          </div>
                          <span className="text-xs text-muted-foreground mt-1 block">
                            {message.time}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Message input */}
                <div className="p-4 border-t">
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="icon" className="h-9 w-9">
                      <Paperclip className="h-5 w-5" />
                    </Button>
                    
                    <div className="relative flex-1">
                      <Input
                        placeholder="Type a message..."
                        className="pr-10"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                      />
                      <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7">
                        <Smile className="h-5 w-5" />
                      </Button>
                    </div>
                    
                    <Button 
                      className="h-9 w-9"
                      size="icon"
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                    >
                      <Send className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-muted-foreground">Select a conversation to start messaging.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </PageContainer>
    </MainLayout>
  );
}
