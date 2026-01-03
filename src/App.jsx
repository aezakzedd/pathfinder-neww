import { lazy, Suspense } from 'react';

const Explore = lazy(() => import('./pages/Explore.jsx'));

// Loading component for better UX
const LoadingScreen = () => (
  <div style={{
    width: '100vw',
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6'
  }}>
    <div style={{
      textAlign: 'center'
    }}>
      <div style={{
        width: '48px',
        height: '48px',
        border: '4px solid rgba(30, 64, 175, 0.1)',
        borderTopColor: '#1e40af',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        margin: '0 auto 16px'
      }} />
      <div style={{
        color: '#1e40af',
        fontSize: '14px',
        fontWeight: '600'
      }}>Loading HapiHub...</div>
    </div>
    <style>
      {`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}
    </style>
  </div>
);

export default function App() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Explore />
    </Suspense>
  );
}
