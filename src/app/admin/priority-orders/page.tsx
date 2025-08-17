import { PageLayout, MainContainer } from "@/components/layout";
import { PriorityOrdersManagementPanel } from "@/components/admin";

export default function AdminPriorityOrdersPage() {
  return (
    <PageLayout>
      <MainContainer>
        <PriorityOrdersManagementPanel />
      </MainContainer>
    </PageLayout>
  );
} 