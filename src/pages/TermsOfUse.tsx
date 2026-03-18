import AppLayout from "@/components/layout/AppLayout";
import TermsOfUseContent from "@/components/legal/TermsOfUseContent";

export default function TermsOfUse() {
  return (
    <AppLayout>
      <div className="p-4 sm:p-6 max-w-2xl mx-auto">
        <TermsOfUseContent />
      </div>
    </AppLayout>
  );
}

