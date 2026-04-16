import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Toaster } from 'sonner';

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-void flex bg-wallpaper-overlay">
      <Sidebar />
      <main
        className="flex-1 min-h-screen min-w-0 relative z-10"
      >
        <div className="pt-16 pb-8 px-4 sm:px-8 lg:pt-10 lg:pb-10 lg:px-12 xl:px-16">
          <Outlet />
        </div>
      </main>
      <Toaster
        theme="dark"
        position="bottom-right"
        richColors
        toastOptions={{
          style: {
            background: 'rgba(16, 27, 46, 0.95)',
            backdropFilter: 'blur(16px)',
            border: '1px solid #1a3a52',
            color: '#e8f0f8',
            fontFamily: "'Outfit', sans-serif",
            borderRadius: '10px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          },
        }}
      />
    </div>
  );
}
