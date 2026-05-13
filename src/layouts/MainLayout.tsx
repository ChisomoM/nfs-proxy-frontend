import { Outlet } from 'react-router-dom';
// import Navbar from './components/navbar';
import { Footer } from '../components/footer';
import Navbar from '@/components/navbar';
// import { Navbar } from '@/components/Navbar';

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
