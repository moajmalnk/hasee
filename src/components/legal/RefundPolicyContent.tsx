export default function RefundPolicyContent() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-black text-foreground">Refund Policy</h1>
      <p className="text-sm text-muted-foreground">Professional policy text for Hasee Maxi.</p>

      <section className="space-y-2">
        <h2 className="text-base font-bold text-foreground">1) Returns</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Maxis purchased from Hasee Maxi can be returned within 7 days of delivery in case of quality issues or
          customer preference. Items must be returned in original condition.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-bold text-foreground">2) Referral Credit (15-Day Rule)</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Referrals are credited only after the 15-day “No-Return” window from the referee’s delivery date.
          This helps ensure fraud prevention and accurate reward eligibility.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-bold text-foreground">3) Refunds and Reward Deduction</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          If a referee is refunded during the policy period, the referee’s credited count is adjusted accordingly,
          and the referrer’s progress may be reduced to reflect accurate eligibility.
        </p>
      </section>
    </div>
  );
}

