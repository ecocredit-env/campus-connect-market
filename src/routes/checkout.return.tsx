import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/checkout/return")({
  validateSearch: (search: Record<string, unknown>): { session_id?: string } => ({
    session_id: typeof search.session_id === "string" ? search.session_id : undefined,
  }),
  head: () => ({ meta: [{ title: "Payment complete · UltraOver" }] }),
  component: ReturnPage,
});

function ReturnPage() {
  const { session_id } = Route.useSearch();
  return (
    <div className="min-h-screen">
      <Header />
      <div className="mx-auto max-w-lg px-6 py-20 text-center">
        <CheckCircle2 className="mx-auto h-14 w-14 text-success" />
        <h1 className="display mt-4 text-3xl text-primary">Payment successful</h1>
        <p className="mt-2 text-muted-foreground">
          Your order is confirmed. The seller has been notified with your delivery details and will reach out shortly.
        </p>
        {session_id && (
          <p className="mt-3 text-xs text-muted-foreground">Ref: {session_id.slice(0, 18)}…</p>
        )}
        <div className="mt-8 flex justify-center gap-3">
          <Link to="/me"><Button>View my orders</Button></Link>
          <Link to="/browse"><Button variant="outline">Keep browsing</Button></Link>
        </div>
      </div>
    </div>
  );
}
