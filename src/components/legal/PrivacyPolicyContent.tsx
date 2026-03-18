export default function PrivacyPolicyContent() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-black text-foreground">Privacy Policy</h1>
      <p className="text-sm text-muted-foreground">A simple and transparent mock privacy policy for Hasee Maxi.</p>

      <section className="space-y-2">
        <h2 className="text-base font-bold text-foreground">1) Data We Collect</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          We may collect details like your name, contact information, and delivery address to process orders and
          provide updates.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-bold text-foreground">2) How We Use Your Information</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Your data is used to manage orders, communicate with you, and improve the customer experience.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-bold text-foreground">3) Sharing & Security</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          We only share information with trusted services needed to fulfill orders. Security measures are applied
          to protect data.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-bold text-foreground">4) Your Choices</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          You can review and update your profile and addresses in the app.
        </p>
      </section>
    </div>
  );
}

