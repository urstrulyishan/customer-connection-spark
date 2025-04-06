
import React from "react";
import { MainLayout } from "@/layouts/main-layout";
import { PageContainer } from "@/components/ui/container";
import { AuthForm } from "@/components/ishantech/AuthForm";
import { Home, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function IshanTechAuth() {
  const navigate = useNavigate();

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
              </div>
            </div>
          </div>
        </header>

        <PageContainer className="flex-1 flex items-center justify-center py-12">
          <div className="w-full max-w-md">
            <AuthForm />
          </div>
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
