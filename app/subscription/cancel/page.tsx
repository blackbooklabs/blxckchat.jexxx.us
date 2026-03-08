export default function SubscriptionCancelPage() {
  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
      <div className="max-w-xl text-center space-y-4">
        <h1 className="text-3xl font-bold">Checkout canceled</h1>
        <p className="text-muted">No charge was made. You can retry whenever you are ready.</p>
        <div className="flex items-center justify-center gap-3">
          <a href="/subscription" className="px-4 py-2 rounded-full bg-accent text-white">Retry checkout</a>
          <a href="/chat" className="px-4 py-2 rounded-full border border-border">Return to chat</a>
        </div>
      </div>
    </main>
  );
}
