import React, { useState, useEffect } from "react";
import { PageContainer, SectionContainer } from "@/components/ui/container";
import { MainLayout } from "@/layouts/main-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { useCompany } from "@/contexts/CompanyContext";
import { saveCompanyData, getCompanyData } from "@/utils/companyDataUtils";
import { Webhook, Database, Mail, ShoppingCart, RefreshCw } from "lucide-react";

// Define types for platform connections
type PlatformConnection = {
  id: string;
  name: string;
  type: "api" | "webhook" | "database" | "email" | "ecommerce";
  url: string;
  apiKey?: string;
  isActive: boolean;
  lastSync?: string;
};

// Schema for adding/editing connections
const connectionFormSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters" }),
  type: z.enum(["api", "webhook", "database", "email", "ecommerce"]),
  url: z.string().url({ message: "Please enter a valid URL" }),
  apiKey: z.string().optional(),
  isActive: z.boolean().default(true),
});

export default function PlatformConnectionsPage() {
  const { toast } = useToast();
  const { currentCompany, refreshConnectionStatus } = useCompany();
  const [connections, setConnections] = useState<PlatformConnection[]>([]);
  const [editingConnection, setEditingConnection] = useState<PlatformConnection | null>(null);
  const [isSyncing, setIsSyncing] = useState<string | null>(null);

  // Initialize form
  const form = useForm<z.infer<typeof connectionFormSchema>>({
    resolver: zodResolver(connectionFormSchema),
    defaultValues: {
      name: "",
      type: "api",
      url: "",
      apiKey: "",
      isActive: true,
    },
  });

  // Load connections from local storage
  useEffect(() => {
    const storedConnections = getCompanyData<PlatformConnection[]>("platformConnections", []);
    setConnections(storedConnections);
  }, [currentCompany]);

  // Save connections to local storage
  const saveConnections = (updatedConnections: PlatformConnection[]) => {
    saveCompanyData("platformConnections", updatedConnections);
    setConnections(updatedConnections);
    refreshConnectionStatus();
  };

  // Handle form submission for adding/editing connections
  const onSubmit = (data: z.infer<typeof connectionFormSchema>) => {
    if (editingConnection) {
      // Update existing connection
      const updatedConnections = connections.map(conn => 
        conn.id === editingConnection.id 
          ? { ...conn, ...data, lastSync: editingConnection.lastSync } 
          : conn
      );
      saveConnections(updatedConnections);
      toast({
        title: "Connection Updated",
        description: `${data.name} connection has been updated.`,
      });
    } else {
      // Add new connection - Make sure all required properties are set
      const newConnection: PlatformConnection = {
        id: crypto.randomUUID(),
        name: data.name,
        type: data.type,
        url: data.url,
        apiKey: data.apiKey,
        isActive: data.isActive,
      };
      saveConnections([...connections, newConnection]);
      toast({
        title: "Connection Added",
        description: `${data.name} has been added to your connections.`,
      });
    }
    resetForm();
  };

  // Reset form and editing state
  const resetForm = () => {
    form.reset({
      name: "",
      type: "api",
      url: "",
      apiKey: "",
      isActive: true,
    });
    setEditingConnection(null);
  };

  // Edit an existing connection
  const handleEditConnection = (connection: PlatformConnection) => {
    setEditingConnection(connection);
    form.reset({
      name: connection.name,
      type: connection.type,
      url: connection.url,
      apiKey: connection.apiKey || "",
      isActive: connection.isActive,
    });
  };

  // Delete a connection
  const handleDeleteConnection = (id: string) => {
    const updatedConnections = connections.filter(conn => conn.id !== id);
    saveConnections(updatedConnections);
    toast({
      title: "Connection Removed",
      description: "The connection has been removed from your account.",
    });
  };

  // Toggle connection status
  const toggleConnectionStatus = (id: string) => {
    const updatedConnections = connections.map(conn => 
      conn.id === id ? { ...conn, isActive: !conn.isActive } : conn
    );
    saveConnections(updatedConnections);
  };

  // Simulate syncing with a platform
  const syncWithPlatform = (id: string) => {
    setIsSyncing(id);
    setTimeout(() => {
      const updatedConnections = connections.map(conn => 
        conn.id === id ? { ...conn, lastSync: new Date().toISOString() } : conn
      );
      saveConnections(updatedConnections);
      setIsSyncing(null);
      toast({
        title: "Sync Complete",
        description: "Data has been synchronized successfully.",
      });
    }, 2000);
  };

  // Get icon based on connection type
  const getConnectionIcon = (type: PlatformConnection["type"]) => {
    switch (type) {
      case "api": return <Webhook className="h-5 w-5 text-primary" />;
      case "database": return <Database className="h-5 w-5 text-indigo-500" />;
      case "email": return <Mail className="h-5 w-5 text-amber-500" />;
      case "ecommerce": return <ShoppingCart className="h-5 w-5 text-green-500" />;
      default: return <Webhook className="h-5 w-5 text-primary" />;
    }
  };

  return (
    <MainLayout>
      <PageContainer>
        <div className="flex flex-col space-y-2 mb-6">
          <h1 className="font-semibold">Platform Connections</h1>
          <p className="text-muted-foreground">
            Connect your existing platforms to sync data with your CRM.
          </p>
        </div>

        <Tabs defaultValue="connections">
          <TabsList className="mb-4">
            <TabsTrigger value="connections">My Connections</TabsTrigger>
            <TabsTrigger value="add">Add Connection</TabsTrigger>
          </TabsList>

          <TabsContent value="connections" className="space-y-4">
            <SectionContainer>
              {connections.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">
                    You haven't added any platform connections yet.
                  </p>
                  <Button onClick={() => {
                    const addTab = document.querySelector('[data-value="add"]') as HTMLElement;
                    if (addTab) addTab.click();
                  }}>
                    Add Your First Connection
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {connections.map((connection) => (
                    <Card key={connection.id} className={!connection.isActive ? "opacity-70" : ""}>
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <div className="flex items-center space-x-2">
                          {getConnectionIcon(connection.type)}
                          <CardTitle className="text-md">{connection.name}</CardTitle>
                        </div>
                        <Switch 
                          checked={connection.isActive} 
                          onCheckedChange={() => toggleConnectionStatus(connection.id)} 
                        />
                      </CardHeader>
                      <CardContent className="text-sm pb-2">
                        <p className="truncate text-muted-foreground">{connection.url}</p>
                        {connection.lastSync && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Last synced: {new Date(connection.lastSync).toLocaleString()}
                          </p>
                        )}
                      </CardContent>
                      <CardFooter className="flex justify-between pt-2">
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleEditConnection(connection)}
                          >
                            Edit
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleDeleteConnection(connection.id)}
                          >
                            Remove
                          </Button>
                        </div>
                        <Button 
                          size="sm" 
                          disabled={isSyncing === connection.id || !connection.isActive}
                          onClick={() => syncWithPlatform(connection.id)}
                        >
                          {isSyncing === connection.id ? (
                            <>
                              <RefreshCw className="mr-1 h-3 w-3 animate-spin" />
                              Syncing...
                            </>
                          ) : "Sync Now"}
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </SectionContainer>
          </TabsContent>

          <TabsContent value="add">
            <SectionContainer>
              <div className="max-w-lg mx-auto">
                <Card>
                  <CardHeader>
                    <CardTitle>{editingConnection ? "Edit Connection" : "Add New Connection"}</CardTitle>
                    <CardDescription>
                      {editingConnection 
                        ? "Update your platform connection details" 
                        : "Connect your existing platform to sync data with your CRM"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Connection Name</FormLabel>
                              <FormControl>
                                <Input placeholder="E.g. My Website API" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="type"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Connection Type</FormLabel>
                              <FormControl>
                                <select
                                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                  {...field}
                                >
                                  <option value="api">API</option>
                                  <option value="webhook">Webhook</option>
                                  <option value="database">Database</option>
                                  <option value="email">Email Marketing</option>
                                  <option value="ecommerce">E-commerce Platform</option>
                                </select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="url"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Connection URL</FormLabel>
                              <FormControl>
                                <Input placeholder="https://api.yourplatform.com/v1" {...field} />
                              </FormControl>
                              <FormDescription>
                                The endpoint URL for your platform's API or webhook
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="apiKey"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>API Key / Token (Optional)</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="Your API key or token" {...field} />
                              </FormControl>
                              <FormDescription>
                                This will be stored securely on your device
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="isActive"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                              <div className="space-y-0.5">
                                <FormLabel>Active Status</FormLabel>
                                <FormDescription>
                                  Enable or disable this connection
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <div className="flex justify-between pt-4">
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={resetForm}
                          >
                            {editingConnection ? "Cancel" : "Reset"}
                          </Button>
                          <Button type="submit">
                            {editingConnection ? "Update Connection" : "Add Connection"}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </div>
            </SectionContainer>
          </TabsContent>
        </Tabs>
      </PageContainer>
    </MainLayout>
  );
}
