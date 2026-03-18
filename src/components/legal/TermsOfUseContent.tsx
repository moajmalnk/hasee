export default function TermsOfUseContent() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-black text-foreground">Terms of Use</h1>
      <p className="text-sm text-muted-foreground">By using Hasee Maxi, you agree to these terms.</p>

      <section className="space-y-2">
        <h2 className="text-base font-bold text-foreground">1) Referral System</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Referral rewards follow the rule: when 10 paid referrals are completed, the referrer earns 1 free
          reward (subject to the 15-day “No-Return” window).
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-bold text-foreground">2) GPay/PhonePe Verification</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Payments may be verified using uploaded screenshots and merchant reconciliation. The platform may
          request proof if needed.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-bold text-foreground">3) WhatsApp Communication Consent</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          By providing a WhatsApp number, you consent to receive updates related to orders, referrals, and support
          communications.
        </p>
      </section>
    </div>
  );
}

