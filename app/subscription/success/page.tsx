export default function SubscriptionSuccessPage() {
  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
      <div className="max-w-xl text-center space-y-4">
        <h1 className="text-3xl font-bold">Payment successful</h1>
        <p className="text-muted">Your subscription is being confirmed. Entitlements will update shortly.</p>
        <div className="flex items-center justify-center gap-3">
          <a href="/chat" className="px-4 py-2 rounded-full bg-accent text-white">Go to chat</a>
          <a href="/subscription" className="px-4 py-2 rounded-full border border-border">View plans</a>
        </div>
      </div>
    </main>
  );
}
