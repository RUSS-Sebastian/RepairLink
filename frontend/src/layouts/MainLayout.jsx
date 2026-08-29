import Navbar from "../components/navigation/Navbar";

function MainLayout({ children }) {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navbar />

      <main>{children}</main>
    </div>
  );
}

export default MainLayout;