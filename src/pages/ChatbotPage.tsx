
import { PageContainer } from "@/components/ui/container";
import { MainLayout } from "@/layouts/main-layout";
import { ChatInterface } from "@/components/chatbot/ChatInterface";

export default function ChatbotPage() {
  return (
    <MainLayout>
      <PageContainer className="py-6">
        <h1 className="text-2xl font-bold mb-6">AI Chat Assistant</h1>
        <ChatInterface />
      </PageContainer>
    </MainLayout>
  );
}
