import { EventIntegrationSummary } from "@/components/events/EventIntegrationSummary";

export default function IntegrationTestPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <EventIntegrationSummary />
      </div>
    </div>
  );
}