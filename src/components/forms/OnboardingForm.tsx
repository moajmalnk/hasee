import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

const colorOptions = ["Red", "Blue", "Green", "Black", "White", "Pink", "Orange", "Purple"];

export type OnboardingFormValues = {
  name: string;
  location: string;
  whatsappNumber: string;
  phoneNumber?: string;
  email?: string;
  favoriteColors?: string[];
};

type Props = {
  onSubmit: (values: OnboardingFormValues) => Promise<void>;
};

export function OnboardingForm({ onSubmit }: Props) {
  const [values, setValues] = useState<OnboardingFormValues>({
    name: "",
    location: "",
    whatsappNumber: "",
    phoneNumber: "",
    email: "",
    favoriteColors: [],
  });
  const [submitting, setSubmitting] = useState(false);

  const toggleColor = (c: string, checked: boolean) => {
    setValues((v) => {
      const set = new Set(v.favoriteColors ?? []);
      if (checked) set.add(c);
      else set.delete(c);
      return { ...v, favoriteColors: Array.from(set) };
    });
  };

  const submit = async () => {
    if (!values.name.trim()) return toast.error("Name is required");
    if (!values.location.trim()) return toast.error("Location is required");
    if (!values.whatsappNumber.trim()) return toast.error("WhatsApp number is required");

    setSubmitting(true);
    try {
      await onSubmit({
        ...values,
        phoneNumber: values.phoneNumber?.trim() ? values.phoneNumber.trim() : undefined,
        email: values.email?.trim() ? values.email.trim() : undefined,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-bold text-foreground">Name</label>
        <Input value={values.name} onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))} />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold text-foreground">Location (District in Kerala/City)</label>
        <Input
          value={values.location}
          onChange={(e) => setValues((v) => ({ ...v, location: e.target.value }))}
          placeholder="e.g., Kochi / Ernakulam"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold text-foreground">WhatsApp Number (Required)</label>
        <Input
          value={values.whatsappNumber}
          onChange={(e) => setValues((v) => ({ ...v, whatsappNumber: e.target.value }))}
          placeholder="e.g., 9XXXXXXXXX"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold text-foreground">Phone Number (Optional)</label>
        <Input
          value={values.phoneNumber ?? ""}
          onChange={(e) => setValues((v) => ({ ...v, phoneNumber: e.target.value }))}
          placeholder="e.g., 9XXXXXXXXX"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold text-foreground">Email (Optional)</label>
        <Input
          value={values.email ?? ""}
          onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
          placeholder="you@example.com"
        />
      </div>

      <div className="space-y-2">
        <p className="text-sm font-bold text-foreground">Favorite Colors (Optional)</p>
        <div className="grid grid-cols-2 gap-2">
          {colorOptions.map((c) => {
            const checked = (values.favoriteColors ?? []).includes(c);
            return (
              <label
                key={c}
                className={`flex items-center gap-2 p-2 rounded-xl border ${
                  checked ? "bg-primary/10 border-primary/20" : "bg-secondary/50 border-border"
                }`}
              >
                <Checkbox checked={checked} onCheckedChange={(v) => toggleColor(c, Boolean(v))} />
                <span className="text-sm font-bold text-foreground">{c}</span>
              </label>
            );
          })}
        </div>
      </div>

      <Button className="w-full h-12 rounded-xl font-bold" disabled={submitting} onClick={() => void submit()}>
        {submitting ? "Saving..." : "Continue"}
      </Button>
    </div>
  );
}

