import { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';

export default function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'color 0.3s ease'
      }}
    >
      {isOnline ? (
        <Wifi 
          color="#84cc16" 
          size={28} 
          strokeWidth={2} 
        />
      ) : (
        <WifiOff 
          color="#ef4444" 
          size={28} 
          strokeWidth={2} 
        />
      )}
    </div>
  );
}
