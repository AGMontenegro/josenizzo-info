import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import LiveDataWidget from '../components/LiveDataWidget';
import ReadingProgressBar from '../components/ReadingProgressBar';

function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <ReadingProgressBar />
      <LiveDataWidget />
      <Header />
      <Navigation />
      {/* Banners publicitarios superiores */}
      <div className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-3 space-y-3">
          <div className="border border-gray-200 py-6 text-center rounded">
            <p className="text-gray-400 font-medium text-sm">Espacio Publicitario</p>
            <p className="text-xs text-gray-300 mt-1">970x90</p>
          </div>
          <div className="hidden md:block border border-gray-200 py-6 text-center rounded">
            <p className="text-gray-400 font-medium text-sm">Espacio Publicitario</p>
            <p className="text-xs text-gray-300 mt-1">970x90</p>
          </div>
        </div>
      </div>
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default MainLayout;
