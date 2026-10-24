import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { api } from './api/client';
import { User } from './api/types';
import { DevPanel } from './components/DevPanel';
import { FloatingStudioArt } from './components/FloatingStudioArt';
import { ClickSpark } from './components/ClickSpark';
import { StudioAtmosphere } from './components/StudioAtmosphere';
import { CartProvider } from './components/CartContext';
import { CartPage } from './components/CartPage';

// Features
import { LandingPage } from './features/landing/LandingPage';
import { CustomerLoginPage } from './features/auth/CustomerLoginPage';
import { CustomerSignupPage } from './features/auth/CustomerSignupPage';
import { AdminLoginPage } from './features/auth/AdminLoginPage';
import { GalleryPage } from './features/gallery/GalleryPage';
import { PaintingDetailPage } from './features/gallery/PaintingDetailPage';
import { WallBookingPage } from './features/wall/WallBookingPage';
import { PotteryPage } from './features/pottery/PotteryPage';
import { AccountDashboardPage } from './features/account/AccountDashboardPage';

// Admin Views
import { AdminDashboard } from './features/admin/AdminDashboard';
import { AdminPaintings } from './features/admin/AdminPaintings';
import { AdminBookings } from './features/admin/AdminBookings';
import { AdminPottery } from './features/admin/AdminPottery';
import { AdminOrders } from './features/admin/AdminOrders';
import { AdminActivity } from './features/admin/AdminActivity';

// Error Views
import { NotFoundPage, ForbiddenPage } from './components/ErrorPages';

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function RouteTransition({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const isLandingPage = pathname === '/';
  return (
    <div key={pathname} className="route-enter relative isolate">
      <FloatingStudioArt className={isLandingPage ? 'z-[5]' : 'z-0'} />
      {isLandingPage ? children : <div className="relative z-10">{children}</div>}
    </div>
  );
}

// Protected route wrapper for customer accounts
function RequireCustomerAuth({
  user,
  children
}: {
  user: User | null;
  children: React.ReactElement;
}) {
  const location = useLocation();
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

// Protected route wrapper for studio admin desk
function RequireAdminAuth({
  user,
  children
}: {
  user: User | null;
  children: React.ReactElement;
}) {
  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }
  if (user.role !== 'studio') {
    return <ForbiddenPage user={user} />;
  }
  return children;
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authInitialized, setAuthInitialized] = useState<boolean>(false);
  const [refreshKey, setRefreshKey] = useState<number>(0);

  const checkAuth = useCallback(async () => {
    try {
      const currentUser = await api.getCurrentUser();
      setUser(currentUser);
    } catch {
      setUser(null);
    } finally {
      setAuthInitialized(true);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (!authInitialized) {
    return (
      <div className="min-h-screen bg-[#28201C] flex items-center justify-center font-mono text-xs text-zinc-500">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-[#273469] animate-ping" />
          <span className="tracking-widest uppercase">Preparing ARTOPIA...</span>
        </div>
      </div>
    );
  }

  return (
    <CartProvider>
    <BrowserRouter>
      <ScrollToTop />
      <div key={refreshKey} className="relative isolate min-h-screen bg-[#28201C] text-[#FFF5E6] flex flex-col font-sans">
        <StudioAtmosphere />
        <ClickSpark />
        <div className="relative z-10 flex-1">
        <RouteTransition>
        <Routes>
          {/* Public Landing Hero */}
          <Route path="/" element={<LandingPage user={user} />} />

          {/* Authentication */}
          <Route
            path="/login"
            element={<CustomerLoginPage user={user} onLoginSuccess={setUser} />}
          />
          <Route
            path="/signup"
            element={<CustomerSignupPage user={user} onLoginSuccess={setUser} />}
          />
          <Route
            path="/admin/login"
            element={<AdminLoginPage user={user} onLoginSuccess={setUser} />}
          />

          <Route path="/cart" element={<CartPage user={user} />} />

          {/* Gallery & Art Exploration */}
          <Route path="/gallery" element={<GalleryPage user={user} />} />
          <Route path="/gallery/:id" element={<PaintingDetailPage user={user} />} />

          {/* Commissions */}
          <Route path="/wall" element={<WallBookingPage user={user} />} />
          <Route path="/pottery" element={<PotteryPage user={user} />} />
          <Route path="/pottery/:requestId/edit" element={<PotteryPage user={user} />} />

          {/* Customer Dashboard (Protected) */}
          <Route
            path="/account"
            element={
              <RequireCustomerAuth user={user}>
                <AccountDashboardPage user={user} />
              </RequireCustomerAuth>
            }
          />

          {/* Admin Desk (Protected with Admin Role Guard) */}
          <Route
            path="/admin"
            element={
              <RequireAdminAuth user={user}>
                <AdminDashboard user={user} />
              </RequireAdminAuth>
            }
          />
          <Route
            path="/admin/paintings"
            element={
              <RequireAdminAuth user={user}>
                <AdminPaintings user={user} />
              </RequireAdminAuth>
            }
          />
          <Route
            path="/admin/bookings"
            element={
              <RequireAdminAuth user={user}>
                <AdminBookings user={user} />
              </RequireAdminAuth>
            }
          />
          <Route
            path="/admin/pottery"
            element={
              <RequireAdminAuth user={user}>
                <AdminPottery user={user} />
              </RequireAdminAuth>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <RequireAdminAuth user={user}>
                <AdminOrders user={user} />
              </RequireAdminAuth>
            }
          />
          <Route
            path="/admin/activity"
            element={
              <RequireAdminAuth user={user}>
                <AdminActivity user={user} />
              </RequireAdminAuth>
            }
          />

          {/* 403 Forbidden Route */}
          <Route path="/forbidden" element={<ForbiddenPage user={user} />} />

          {/* 404 Void Route */}
          <Route path="*" element={<NotFoundPage user={user} />} />
        </Routes>
        </RouteTransition>

        {/* Global Developer Simulation & Diagnostic Panel */}
        <DevPanel
          currentUser={user}
          onUserChange={setUser}
          onRefreshData={() => setRefreshKey((prev) => prev + 1)}
        />
        </div>
      </div>
    </BrowserRouter>
    </CartProvider>
  );
}
