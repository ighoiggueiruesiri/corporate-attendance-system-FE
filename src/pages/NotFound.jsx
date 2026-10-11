import { Link } from 'react-router-dom';
import logo from '../assets/new_logo_vertical.png';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-paper flex flex-col items-center justify-center p-6 text-center">
      <img src={logo} alt="Univasa" className="h-12 mb-8" />
      
      <h1 className="text-7xl font-black text-univasa drop-shadow-sm mb-4">
        404
      </h1>
      
      <h2 className="text-2xl font-bold text-ink mb-3 tracking-wide">
        Page Not Found
      </h2>
      
      <p className="text-ink-soft text-sm max-w-sm mb-10 leading-relaxed">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      
      <Link
        to="/"
        className="bg-univasa hover:bg-univasa-dark text-white px-8 py-3.5 rounded-xl font-bold transition-all shadow-sm"
      >
        Return to Dashboard
      </Link>
    </div>
  );
}