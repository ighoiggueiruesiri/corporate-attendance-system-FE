import { useRef, useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import { useNavigate } from 'react-router-dom';
import { recordAttendance, getAttendanceStatus, logout, getCurrentUser } from '../api/api';
import LiveClock from '../components/LiveClock';
import logo from '../assets/new_logo_vertical.png';

export default function ClockPage() {
  const webcamRef = useRef(null);
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState(false);
  const [pending, setPending] = useState(null);
  const [lastAction, setLastAction] = useState(null);
  const [status, setStatus] = useState({ clocked_in: false, since: null });
  const [statusLoaded, setStatusLoaded] = useState(false);
  const navigate = useNavigate();
  const user = getCurrentUser();
  // True only when GPS is live: a fix exists AND no GPS error is active.
  const gpsReady = Boolean(location) && !locationError;

  // GPS must be live to clock in/out. If it is blocked, switched off or lost at
  // any point, the stored fix is cleared and an error is set, so both buttons
  // stay disabled until a fresh fix arrives.
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocation(null);
      setLocationError(true);
      return;
    }

    let active = true;
    let watchId = null;
    let permission = null;

    const block = () => {
      setLocation(null);
      setLocationError(true);
    };

    const startWatch = () => {
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setLocationError(false);
        },
        block,
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 30000 }
      );
    };

    // Reacts when the user turns location permission off (or back on) while
    // the page is open.
    const onPermissionChange = () => {
      if (permission?.state === 'denied') block();
      else startWatch(); // re-enabled: pick up a fresh fix
    };

    startWatch();

    navigator.permissions
      ?.query({ name: 'geolocation' })
      .then((p) => {
        if (!active) return;
        permission = p;
        p.addEventListener('change', onPermissionChange);
        if (p.state === 'denied') block();
      })
      .catch(() => {});

    return () => {
      active = false;
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
      permission?.removeEventListener('change', onPermissionChange);
    };
  }, []);

  // Load whether this user is currently on shift (survives refresh and midnight)
  useEffect(() => {
    getAttendanceStatus()
      .then(setStatus)
      .catch(() => {})
      .finally(() => setStatusLoaded(true));
  }, []);

  const handleAction = async (type) => {
    if (!gpsReady) return;
    const imageSrc = webcamRef.current?.getScreenshot();
    if (!imageSrc) return;

    setPending(type);
    try {
      await recordAttendance({
        type,
        latitude: location.lat,
        longitude: location.lng,
        photo: imageSrc,
      });
      setLastAction({ type, time: new Date() });
      try {
        setStatus(await getAttendanceStatus());
      } catch {
        setStatus({ clocked_in: type === 'clock_in', since: null });
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Could not record attendance. Please try again.');
      // If the server rejected it as out-of-sequence, re-sync the buttons
      if (err.response?.status === 409) {
        getAttendanceStatus().then(setStatus).catch(() => {});
      }
    } finally {
      setPending(null);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 flex flex-col items-center">
      <header className="w-full max-w-2xl flex justify-between items-center mb-8 bg-paper-raised p-4 rounded-2xl shadow-sm border border-line">
        <div className="flex items-center gap-4">
          <img src={logo} alt="Univasa" className="h-9" />
          {user?.staff_id && (
            <span className="hidden sm:inline-block text-xs font-mono-num font-bold text-ink-soft bg-paper border border-line rounded-lg px-3 py-1.5">
              {user.staff_id}
            </span>
          )}
        </div>
        <button onClick={handleLogout} className="text-sm font-bold text-ink-soft hover:text-univasa transition-colors px-4 py-2 rounded-lg hover:bg-slate-100">
          Sign Out
        </button>
      </header>

      <main className="w-full max-w-2xl bg-paper-raised rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden border border-line">
        <div className="brand-accent-strip" />

        <div className="p-6 sm:p-10 text-center">
          <div className="flex justify-center mb-8">
            <LiveClock size="lg" />
          </div>

          <div className="relative rounded-2xl overflow-hidden bg-slate-100 mb-8 mx-auto w-full max-w-sm aspect-[4/3] ring-1 ring-line">
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              className="w-full h-full object-cover"
            />
            {/* Viewfinder overlay */}
            <div className="absolute inset-0 pointer-events-none border-2 border-white/30 rounded-xl m-4 mix-blend-overlay" />
          </div>

          <div
            className={`inline-flex items-center gap-2 mb-8 text-sm font-bold px-5 py-2.5 rounded-full border ${
              locationError
                ? 'text-univasa-dark bg-univasa-light border-univasa/20'
                : location
                ? 'text-ok bg-ok-soft border-ok/20'
                : 'text-brass bg-brass-soft border-brass/20'
            }`}
          >
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                locationError ? 'bg-univasa' : location ? 'bg-ok' : 'bg-brass animate-blink-soft'
              }`}
            />
            {locationError
              ? 'GPS Blocked — Please Enable'
              : location
              ? 'GPS Lock Acquired'
              : 'Acquiring Satellites…'}
          </div>

          {statusLoaded && status.clocked_in && status.since && (
            <p className="text-sm font-bold text-ok mb-6">
              On shift since{' '}
              <span className="font-mono-num">
                {new Date(status.since).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}
              </span>
            </p>
          )}

          {/*
          {lastAction && (
            <div className="bg-paper border border-line rounded-xl py-3 px-6 mb-8 inline-block">
              <p className="text-sm text-ink-soft">
                Last action:{' '}
                <span className="font-bold text-ink">
                  {lastAction.type === 'clock_in' ? 'Clocked in' : 'Clocked out'}
                </span>{' '}
                at{' '}
                <span className="font-mono-num text-ink">
                  {lastAction.time.toLocaleTimeString('en-GB', { hour12: false })}
                </span>
              </p>
            </div>
          )}
          */}

          {lastAction && (
            <div className="bg-paper border border-line rounded-xl py-3 px-6 mb-8 inline-block">
              <p className="text-sm text-ink-soft">
                Last action:{' '}
                {user?.staff_id && (
                  <span className="font-bold text-ink mr-1">{user.staff_id}</span>
                )}
                <span className="font-bold text-ink">
                  {lastAction.type === 'clock_in' ? 'Clocked in' : 'Clocked out'}
                </span>{' '}
                at{' '}
                <span className="font-mono-num text-ink">
                  {lastAction.time.toLocaleTimeString('en-GB', { hour12: false })}
                </span>
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
            <button
              onClick={() => handleAction('clock_in')}
              disabled={!gpsReady || pending !== null || !statusLoaded || status.clocked_in}
              className="bg-ok hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-base py-4.5 rounded-2xl transition-all active:scale-95 tracking-wide shadow-md shadow-ok/20"
            >
              {pending === 'clock_in' ? 'SYNCING…' : 'CLOCK IN'}
            </button>
            <button
              onClick={() => handleAction('clock_out')}
              disabled={!gpsReady || pending !== null || !statusLoaded || !status.clocked_in}
              className="bg-univasa hover:bg-univasa-dark disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-base py-4.5 rounded-2xl transition-all active:scale-95 tracking-wide shadow-md shadow-univasa/20"
            >
              {pending === 'clock_out' ? 'SYNCING…' : 'CLOCK OUT'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}