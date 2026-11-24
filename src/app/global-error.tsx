"use client";

/** Last-resort boundary (errors in the root layout itself). Must render its own <html>/<body>. */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#050505", color: "#f4f1ec", fontFamily: "system-ui, sans-serif" }}>
        <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", textAlign: "center", padding: 24 }}>
          <div>
            <h1 style={{ fontWeight: 500, fontSize: 28 }}>Something went wrong.</h1>
            <button
              type="button"
              onClick={reset}
              style={{ marginTop: 20, background: "#ff7a1a", color: "#000", border: 0, padding: "12px 24px", cursor: "pointer" }}
            >
              Try again
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
