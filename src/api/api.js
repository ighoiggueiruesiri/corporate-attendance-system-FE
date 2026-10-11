import client from './client';

/**
 * Auth
 */
export async function login(staffId, password) {
  const { data } = await client.post('/login', {
    staff_id: staffId,
    password,
  });
  localStorage.setItem('token', data.token);
  localStorage.setItem('user', JSON.stringify(data.user));
  return data.user;
}

export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

export function getCurrentUser() {
  const raw = localStorage.getItem('user');
  return raw ? JSON.parse(raw) : null;
}

/**
 * Attendance
 */
export async function getAttendanceRecords({ staffId = '', date = '', page = 1, perPage = 20 } = {}) {
  const { data } = await client.get('/attendance', {
    params: { staff_id: staffId, date, page, per_page: perPage },
  });
  return data; // Laravel paginator: { data, current_page, last_page, total, per_page, ... }
}

export async function recordAttendance({ type, latitude, longitude, photo }) {
  const { data } = await client.post('/attendance', {
    type,
    latitude,
    longitude,
    photo,
  });
  return data;
}

/**
 * Is the logged-in user currently on shift?
 * Returns { clocked_in: boolean, since: ISO string | null }
 */
export async function getAttendanceStatus() {
  const { data } = await client.get('/attendance/status');
  return data;
}

export function photoUrl(photoPath) {
  // Kept for reference/back-compat, but no longer used to render links —
  // see fetchAttendancePhoto below.
  const base = import.meta.env.VITE_API_BASE_URL?.replace(/\/api\/?$/, '') ?? '';
  return `${base}/storage/${photoPath}`;
}

/**
 * Fetches a protected attendance photo through the API (not the /storage
 * symlink, which many shared hosts block) and returns a temporary blob URL
 * that can be opened in a new tab.
 */
export async function fetchAttendancePhoto(photoPath) {
  const filename = photoPath.split('/').pop();
  const { data } = await client.get(`/attendance/photo/${filename}`, {
    responseType: 'blob',
  });
  return URL.createObjectURL(data);
}