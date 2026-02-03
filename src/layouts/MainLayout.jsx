import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import LiveDataWidget from '../components/LiveDataWidget';
import ReadingProgressBar from '../components/ReadingProgressBar';
import Analytics from '../components/Analytics';

function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950 dark:text-gray-100 transition-colors">
      <Analytics />
      <ReadingProgressBar />
      <LiveDataWidget />
      <Header />
      <Navigation />
      {/* Banners publicitarios superiores */}
      <div className="border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-3 space-y-3">
          <div className="border border-gray-200 dark:border-gray-800 py-6 text-center rounded">
            <p className="text-gray-400 dark:text-gray-600 font-medium text-sm">Espacio Publicitario</p>
            <p className="text-xs text-gray-300 dark:text-gray-700 mt-1">970x90</p>
          </div>
          <div className="hidden md:block border border-gray-200 dark:border-gray-800 py-6 text-center rounded">
            <p className="text-gray-400 dark:text-gray-600 font-medium text-sm">Espacio Publicitario</p>
            <p className="text-xs text-gray-300 dark:text-gray-700 mt-1">970x90</p>
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
