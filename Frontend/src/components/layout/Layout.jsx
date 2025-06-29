import { Routes, Route } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { Suspense, lazy } from 'react';
import Header from "./Header";

// Loading component
const Loading = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
  </div>
);

// Lazy load components
const Home = lazy(() => import('../../pages/Home'));
const Login = lazy(() => import('../../pages/Login'));
const Register = lazy(() => import('../../pages/Register'));
const Dashboard = lazy(() => import('../../pages/Dashboard'));
const Profile = lazy(() => import('../../pages/Profile'));
const Upload = lazy(() => import('../../pages/Upload'));
const VideoDetail = lazy(() => import('../../pages/VideoDetail'));
const Analytics = lazy(() => import('../../pages/Analytics'));
const ProtectedRoute = lazy(() => import('../auth/ProtectedRoute'));

export default function Layout() {
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-background dark' : 'bg-background'}`}>
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route
            index
            element={
              <Suspense fallback={<Loading />}>
                <Home />
              </Suspense>
            }
          />
          <Route
            path="/login"
            element={
              <Suspense fallback={<Loading />}>
                <Login />
              </Suspense>
            }
          />
          <Route
            path="/register"
            element={
              <Suspense fallback={<Loading />}>
                <Register />
              </Suspense>
            }
          />
          <Route
            path="/dashboard"
            element={
              <Suspense fallback={<Loading />}>
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              </Suspense>
            }
          />
          <Route
            path="/profile"
            element={
              <Suspense fallback={<Loading />}>
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              </Suspense>
            }
          />
          <Route
            path="/upload"
            element={
              <Suspense fallback={<Loading />}>
                <ProtectedRoute>
                  <Upload />
                </ProtectedRoute>
              </Suspense>
            }
          />
          <Route
            path="/video/:videoId"
            element={
              <Suspense fallback={<Loading />}>
                <VideoDetail />
              </Suspense>
            }
          />
          <Route
            path="/analytics"
            element={
              <Suspense fallback={<Loading />}>
                <ProtectedRoute>
                  <Analytics />
                </ProtectedRoute>
              </Suspense>
            }
          />
        </Routes>
      </main>
    </div>
  );
}
