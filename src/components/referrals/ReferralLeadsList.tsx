import type { Dispatch, SetStateAction } from "react";
import { Badge } from "@/components/ui/badge";

export type ReferralLead = {
  phone: string;
  status: "Paid" | "Pending" | "Clicked" | "Refunded";
  deliveryDate?: string; // ISO string
  refunded?: boolean;
};

type Props = {
  leads: ReferralLead[];
  onMarkRefunded?: (phone: string) => Promise<void>;
  showActions?: boolean;
  setBusyForPhone?: Dispatch<SetStateAction<string | null>>;
};

export default function ReferralLeadsList({ leads }: Props) {
  return (
    <div className="divide-y divide-border">
      {leads.map((lead, i) => (
        <div key={`${lead.phone}:${i}`} className="p-4 flex justify-between items-center">
          <span className="text-sm font-medium text-muted-foreground font-mono">{lead.phone}</span>
          <Badge variant="secondary" className="text-[10px] uppercase font-bold px-2 py-1 rounded-full">
            {lead.status}
          </Badge>
        </div>
      ))}
    </div>
  );
}

