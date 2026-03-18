import AppLayout from "@/components/layout/AppLayout";
import PrivacyPolicyContent from "@/components/legal/PrivacyPolicyContent";

export default function PrivacyPolicy() {
  return (
    <AppLayout>
      <div className="p-4 sm:p-6 max-w-2xl mx-auto">
        <PrivacyPolicyContent />
      </div>
    </AppLayout>
  );
}

