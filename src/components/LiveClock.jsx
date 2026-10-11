import { useEffect, useState } from 'react';

/**
 * A punch-clock style LCD readout of the current time.
 * This is the signature element tying the UI back to the product's
 * actual job: telling a member of staff exactly when they clocked in.
 */
export default function LiveClock({ className = '', size = 'md' }) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const time = now.toLocaleTimeString('en-GB', { hour12: false });
  const date = now.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const sizes = {
    sm: 'text-lg px-3 py-1.5 gap-2',
    md: 'text-3xl px-4 py-2.5 gap-3',
    lg: 'text-6xl sm:text-7xl px-6 py-4 gap-4',
  };

  return (
    <div
      className={`inline-flex items-center rounded-lg bg-ink text-brass font-mono-num ${sizes[size]} ${className}`}
    >
      <span className="w-2 h-2 rounded-full bg-brass animate-blink-soft shrink-0" />
      <span className="tracking-wider">{time}</span>
      <span className="text-white/40 font-body text-[0.4em] uppercase tracking-widest hidden sm:inline">
        {date}
      </span>
    </div>
  );
}
