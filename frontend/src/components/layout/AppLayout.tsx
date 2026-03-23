import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Toaster } from 'sonner';

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-void">
      <Sidebar />
      <main className="ml-[260px] min-h-screen">
        <div className="p-8">
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

