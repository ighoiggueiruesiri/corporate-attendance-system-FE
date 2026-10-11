import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAttendanceRecords, fetchAttendancePhoto, logout } from '../api/api';
import logo from '../assets/new_logo_vertical.png';

export default function AdminDashboard() {
  const [records, setRecords] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  
  const [filterId, setFilterId] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);
  const navigate = useNavigate();

  // Reset back to page 1 whenever a filter or perPage limit changes
  useEffect(() => {
    setPage(1);
  }, [filterId, filterDate, perPage]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      let active = true;
      setLoading(true);
      
      getAttendanceRecords({ staffId: filterId, date: filterDate, page, perPage })
        .then((response) => {
          if (active) {
            setRecords(response.data || []);
            setPagination(response);
          }
        })
        .catch((error) => {
          if (error.response?.status === 403) setUnauthorized(true);
        })
        .finally(() => {
          if (active) setLoading(false);
        });
        
      return () => {
        active = false;
      };
    }, filterId ? 350 : 0);

    return () => clearTimeout(timeout);
  }, [filterId, filterDate, page, perPage]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleViewPhoto = async (photoPath) => {
    // Open the tab synchronously (before the await) so browsers don't
    // treat it as an unrequested popup and block it.
    const win = window.open('', '_blank');
    try {
      const url = await fetchAttendancePhoto(photoPath);
      if (win) win.location.href = url;
    } catch (err) {
      if (win) win.close();
      alert('Could not load photo.');
    }
  };

  return (
    <div className="min-h-screen bg-paper text-ink pb-12">
      <nav className="bg-paper-raised border-b border-line px-4 sm:px-6 py-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-4 sm:gap-5">
          <img src={logo} alt="Univasa" className="h-8 sm:h-9" />
          <h1 className="text-lg font-bold text-ink border-l border-line pl-4 sm:pl-5 hidden sm:block tracking-wide">
            Admin Portal
          </h1>
        </div>
        <button
          onClick={handleLogout}
          className="text-xs sm:text-sm bg-paper hover:bg-slate-100 text-ink-soft hover:text-ink px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl font-bold transition-all border border-line"
        >
          Logout
        </button>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
        {unauthorized && (
          <div className="mb-6 sm:mb-8 text-sm font-bold text-univasa-dark bg-univasa-light border border-univasa/20 rounded-2xl px-5 py-4 flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-univasa animate-pulse" />
            Access Denied: Administrative privileges required.
          </div>
        )}

        <div className="bg-paper-raised p-4 sm:p-5 rounded-2xl shadow-sm border border-line mb-6 sm:mb-8 flex flex-col sm:flex-row flex-wrap gap-4 sm:gap-5 sm:items-end">
          <div className="w-full sm:flex-1 sm:min-w-[200px]">
            <label className="block text-[11px] font-extrabold uppercase tracking-widest text-ink-soft mb-2">
              Staff ID
            </label>
            <input
              type="text"
              placeholder="e.g. STAFF001"
              className="w-full px-4 py-3 bg-paper border border-line rounded-xl font-mono-num text-sm focus:ring-2 focus:ring-univasa focus:border-univasa outline-none transition-all placeholder:text-slate-400"
              value={filterId}
              onChange={(e) => setFilterId(e.target.value)}
            />
          </div>
          <div className="w-full sm:flex-1 sm:min-w-[200px]">
            <label className="block text-[11px] font-extrabold uppercase tracking-widest text-ink-soft mb-2">
              Date
            </label>
            <input
              type="date"
              className="w-full px-4 py-3 bg-paper border border-line rounded-xl text-sm focus:ring-2 focus:ring-univasa focus:border-univasa outline-none transition-all"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
          </div>
          {(filterId || filterDate) && (
            <button
              onClick={() => { setFilterId(''); setFilterDate(''); setPage(1); }}
              className="w-full sm:w-auto text-sm text-ink-soft hover:text-univasa font-bold sm:self-end sm:pb-3 px-2 transition-colors py-2 sm:py-0"
            >
              Clear filters
            </button>
          )}
        </div>

        <div className="bg-paper-raised rounded-2xl shadow-sm border border-line overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse min-w-max sm:min-w-0">
              <thead className="bg-slate-50 text-ink-soft uppercase text-[11px] tracking-widest font-extrabold border-b border-line">
                <tr>
                  <th className="px-4 sm:px-6 py-4 whitespace-nowrap">Staff ID</th>
                  <th className="px-4 sm:px-6 py-4 whitespace-nowrap">Action</th>
                  <th className="px-4 sm:px-6 py-4 whitespace-nowrap">Date & Time</th>
                  <th className="px-4 sm:px-6 py-4 whitespace-nowrap">Location</th>
                  <th className="px-4 sm:px-6 py-4 whitespace-nowrap">Photo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {loading && (
                  <tr>
                    <td colSpan="5" className="px-4 sm:px-6 py-16 text-center text-ink-soft font-mono-num animate-pulse">
                      Loading records…
                    </td>
                  </tr>
                )}

                {!loading && records.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-4 sm:px-6 py-4 font-mono-num font-bold text-ink whitespace-nowrap">{rec.user?.staff_id}</td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center justify-center whitespace-nowrap px-3 py-1.5 rounded-lg text-[10px] font-extrabold tracking-widest ${
                          rec.type === 'clock_in'
                            ? 'bg-ok-soft text-ok'
                            : 'bg-univasa-light text-univasa-dark'
                        }`}
                      >
                        {rec.type.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4 font-mono-num text-ink-soft group-hover:text-ink transition-colors whitespace-nowrap">
                      {new Date(rec.created_at).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'medium' })}
                    </td>
                    <td className="px-4 sm:px-6 py-4 max-w-xs whitespace-normal break-words min-w-[200px]">
                      <a
                        href={`https://maps.google.com/?q=${rec.latitude},${rec.longitude}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-ink-soft hover:text-univasa hover:underline font-mono-num transition-colors flex items-start gap-2"
                        title="Open in Google Maps"
                      >
                        <svg className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                        </svg>
                        <span>{rec.address ?? `${Number(rec.latitude).toFixed(5)}, ${Number(rec.longitude).toFixed(5)}`}</span>
                      </a>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleViewPhoto(rec.photo_path)}
                        className="text-univasa hover:text-univasa-dark hover:underline font-bold tracking-wide transition-colors"
                      >
                        View Photo
                      </button>
                    </td>
                  </tr>
                ))}

                {!loading && records.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-4 sm:px-6 py-16 text-center text-ink-soft">
                      No records found for these filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {!loading && pagination && pagination.total > 0 && (
            <div className="bg-slate-50 border-t border-line px-4 sm:px-6 py-4 flex flex-col lg:flex-row items-center justify-between gap-4">
              
              <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3 sm:gap-4 w-full lg:w-auto">
                <span className="text-xs font-medium text-ink-soft">
                  Showing <span className="font-bold text-ink">{pagination.from}</span> to <span className="font-bold text-ink">{pagination.to}</span> of <span className="font-bold text-ink">{pagination.total}</span> entries
                </span>

                {/* Rows per page selector */}
                <div className="flex items-center gap-2 sm:border-l border-line sm:pl-4">
                  <label htmlFor="perPage" className="text-[11px] font-extrabold uppercase tracking-widest text-ink-soft">
                    Rows:
                  </label>
                  <select
                    id="perPage"
                    value={perPage}
                    onChange={(e) => setPerPage(Number(e.target.value))}
                    className="bg-paper border border-line rounded-lg text-xs font-bold text-ink px-2 py-1 outline-none focus:ring-2 focus:ring-univasa transition-all cursor-pointer"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={15}>15</option>
                    <option value={20}>20</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              </div>
              
              <div className="flex gap-2 w-full sm:w-auto justify-center">
                <button
                  disabled={!pagination.prev_page_url}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-4 py-2 bg-paper border border-line rounded-lg text-xs font-bold uppercase tracking-wider text-ink disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white hover:border-slate-300 transition-all shadow-sm flex-1 sm:flex-none"
                >
                  Previous
                </button>
                <button
                  disabled={!pagination.next_page_url}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-4 py-2 bg-paper border border-line rounded-lg text-xs font-bold uppercase tracking-wider text-ink disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white hover:border-slate-300 transition-all shadow-sm flex-1 sm:flex-none"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}