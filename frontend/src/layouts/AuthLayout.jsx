import { Link } from "react-router-dom";
import { Wrench } from "lucide-react";

function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="auth-page">

      <div className="auth-brand">
        <Link to="/landing" className="brand-link">
          <span className="brand-icon">
            <Wrench size={21} />
          </span>

          <span>RepairLink</span>
        </Link>
      </div>

      <main className="auth-main">

        <div className="auth-card">

          <div className="auth-header">
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>

          {children}

        </div>

      </main>

      <footer className="auth-footer">
        © {new Date().getFullYear()} RepairLink. All rights reserved.
      </footer>

    </div>
  );
}

export default AuthLayout;