import { BrowserRouter, Routes as RouterRoutes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import ClockPage from './pages/ClockPage';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';
import { getCurrentUser } from './api/api';

// 1. Guard for authenticated pages (Clock & Admin)
const ProtectedRoute = ({ children, requireAdmin }) => {
  const user = getCurrentUser();

  // Not logged in? Send to login screen.
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Admin trying to access a non-admin page (like /clock)? Send to records.
  if (requireAdmin && !user.is_admin) {
    return <Navigate to="/clock" replace />;
  }

  // Non-admin trying to access an admin page (like /admin)? Send to clock.
  if (!requireAdmin && user.is_admin) {
    return <Navigate to="/admin" replace />;
  }

  // If they pass the checks, render the requested page
  return children;
};

// 2. Guard for the Login page
const GuestRoute = ({ children }) => {
  const user = getCurrentUser();
  
  // If already logged in and trying to view the login page, redirect them to their respective dashboard
  if (user) {
    return <Navigate to={user.is_admin ? "/admin" : "/clock"} replace />;
  }

  return children;
};

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <RouterRoutes>
        {/* Wrap Login in GuestRoute */}
        <Route 
          path="/" 
          element={
            <GuestRoute>
              <Login />
            </GuestRoute>
          } 
        />
        
        {/* Wrap ClockPage in ProtectedRoute requiring requireAdmin = false */}
        <Route 
          path="/clock" 
          element={
            <ProtectedRoute requireAdmin={false}>
              <ClockPage />
            </ProtectedRoute>
          } 
        />
        
        {/* Wrap AdminDashboard in ProtectedRoute requiring requireAdmin = true */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route path="*" element={<NotFound />} />
      </RouterRoutes>
    </BrowserRouter>
  );
}

/*
export default function AppRoutes() {
  return (
    <BrowserRouter>
      <RouterRoutes>
        <Route path="/" element={<Login />} />
        <Route path="/clock" element={<ClockPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="*" element={<NotFound />} />
      </RouterRoutes>
    </BrowserRouter>
  );
}
*/