import AppRoutes from "./routes/AppRoutes.jsx";
function App() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-8">
      <div className="w-full max-w-xl rounded-3xl bg-white p-10 text-center shadow-2xl">
        <h1 className="text-5xl font-bold text-slate-900">
          RepairLink
        </h1>

        <p className="mt-4 text-lg text-slate-600">
          Tailwind CSS is working correctly.
        </p>

        <button className="mt-8 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700">
          Test Button
        </button>
      </div>
    </div>
  );
}

export default App;