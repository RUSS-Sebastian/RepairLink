import { useEffect, useState } from "react";
import { checkBackendHealth } from "./services/api/healthApi";

function App() {
  const [status, setStatus] = useState("Checking backend...");
  const [error, setError] = useState("");

  useEffect(() => {
    checkBackendHealth()
      .then((message) => {
        setStatus(message);
        setError("");
      })
      .catch((err) => {
        setStatus("");
        setError(err.message);
      });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="rounded-xl bg-white p-8 shadow-lg">
        <h1 className="text-3xl font-bold text-gray-900">RepairLink</h1>

        {status && <p className="mt-4 text-green-600">{status}</p>}

        {error && <p className="mt-4 text-red-600">{error}</p>}
      </div>
    </div>
  );
}

export default App;
