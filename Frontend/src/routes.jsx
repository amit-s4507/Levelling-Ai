import { createBrowserRouter } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import Layout from './components/layout/Layout';
import { ErrorBoundary } from './components/ErrorBoundary';

// Loading component
const Loading = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
  </div>
);

// Lazy load components
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Profile = lazy(() => import('./pages/Profile'));
const Upload = lazy(() => import('./pages/Upload'));
const VideoDetail = lazy(() => import('./pages/VideoDetail'));
const Analytics = lazy(() => import('./pages/Analytics'));
const ProtectedRoute = lazy(() => import('./components/auth/ProtectedRoute'));

// Wrap lazy components with Suspense
const withSuspense = (Component) => (
  <Suspense fallback={<Loading />}>
    <Component />
  </Suspense>
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        index: true,
        element: withSuspense(Home),
      },
      {
        path: 'login',
        element: withSuspense(Login),
      },
      {
        path: 'register',
        element: withSuspense(Register),
      },
      {
        path: 'dashboard',
        element: withSuspense(() => (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        )),
      },
      {
        path: 'profile',
        element: withSuspense(() => (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        )),
      },
      {
        path: 'upload',
        element: withSuspense(() => (
          <ProtectedRoute>
            <Upload />
          </ProtectedRoute>
        )),
      },
      {
        path: 'video/:videoId',
        element: withSuspense(VideoDetail),
      },
      {
        path: 'analytics',
        element: withSuspense(() => (
          <ProtectedRoute>
            <Analytics />
          </ProtectedRoute>
        )),
      },
    ],
  },
]); 