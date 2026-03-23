import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Toaster } from 'sonner';

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-void flex">
      <Sidebar />
      <main className="flex-1 min-h-screen min-w-0">
        <div className="pt-16 pb-6 px-6 sm:px-10 sm:pb-8 lg:pt-10 lg:pb-10 lg:px-12">
          <Outlet />
        </div>
      </main>
      <Toaster
        theme="dark"
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#0a1420',
            border: '1px solid #1e3a5f',
            color: '#e2e8f0',
            fontFamily: "'Outfit', sans-serif",
          },
        }}
      />
    </div>
  );
}
