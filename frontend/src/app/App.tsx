import { useEffect, useState } from "react";
import { getHealth } from "../shared/api/client";

export default function App() {
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getHealth()
      .then((data) => {
        if (!cancelled) setStatus(data.status);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err));
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main>
      <h1>hackat</h1>
      <p>API status: {status ?? (error ? `error: ${error}` : "loading…")}</p>
    </main>
  );
}
