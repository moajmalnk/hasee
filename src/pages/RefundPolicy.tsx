import AppLayout from "@/components/layout/AppLayout";
import RefundPolicyContent from "@/components/legal/RefundPolicyContent";

export default function RefundPolicy() {
  return (
    <AppLayout>
      <div className="p-4 sm:p-6 max-w-2xl mx-auto">
        <RefundPolicyContent />
      </div>
    </AppLayout>
  );
}

