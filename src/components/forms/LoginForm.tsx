import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

type Props = {
  onLogin: (input: { email: string; password: string }) => Promise<void>;
};

export function LoginForm({ onLogin }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    const e = email.trim();
    if (!e) return toast.error("Email is required");
    if (!password) return toast.error("Password is required");

    setSubmitting(true);
    try {
      await onLogin({ email: e, password });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-bold text-foreground">Email</label>
        <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-bold text-foreground">Password</label>
        <Input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="••••••••"
        />
      </div>
      <Button className="w-full h-12 rounded-xl font-bold" disabled={submitting} onClick={() => void submit()}>
        {submitting ? "Logging in..." : "Login"}
      </Button>
    </div>
  );
}

