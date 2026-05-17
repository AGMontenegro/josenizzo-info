import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import ArticleDetail from './pages/ArticleDetail';
import Category from './pages/Category';
import Unsubscribe from './pages/Unsubscribe';
import About from './pages/About';
import Contact from './pages/Contact';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Subscription from './pages/Subscription';
import ReaderLogin from './pages/auth/Login';
import ReaderRegister from './pages/auth/Register';
import ReaderProfile from './pages/auth/Profile';
import AdminLogin from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard';
import AdminArticlesList from './pages/admin/ArticlesList';
import ArticleEditor from './pages/admin/ArticleEditor';
import NewsletterSubscribers from './pages/admin/NewsletterSubscribers';
import SendNewsletter from './pages/admin/SendNewsletter';
import NewsletterStats from './pages/admin/NewsletterStats';
import AnalyticsDashboard from './pages/admin/AnalyticsDashboard';
import SiteSettings from './pages/admin/SiteSettings';
import ProtectedRoute from './components/ProtectedRoute';
import NotificationBanner from './components/NotificationBanner';
import NewsletterPopup from './components/NewsletterPopup';
import PWAInstallBanner from './components/PWAInstallBanner';
import TagPage from './pages/TagPage';
import ScrollToTop from './components/ScrollToTop';

function App() {
  return (
    <ThemeProvider>
    <AuthProvider>
    <Router>
      <ScrollToTop />
      <NotificationBanner />
      <NewsletterPopup />
      <PWAInstallBanner />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="articulo/:slug" element={<ArticleDetail />} />
          <Route path="categoria/:category" element={<Category />} />
          <Route path="desuscribirse" element={<Unsubscribe />} />
          <Route path="sobre-nosotros" element={<About />} />
          <Route path="contacto" element={<Contact />} />
          <Route path="privacidad" element={<Privacy />} />
          <Route path="terminos" element={<Terms />} />
          <Route path="suscripcion" element={<Subscription />} />
          <Route path="tag/:tag" element={<TagPage />} />
          <Route path="perfil" element={<ReaderProfile />} />
        </Route>

        {/* Reader Auth Routes (outside MainLayout for cleaner UI) */}
        <Route path="/login" element={<ReaderLogin />} />
        <Route path="/registro" element={<ReaderRegister />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/articles" element={<ProtectedRoute><AdminArticlesList /></ProtectedRoute>} />
        <Route path="/admin/articles/new" element={<ProtectedRoute><ArticleEditor /></ProtectedRoute>} />
        <Route path="/admin/articles/edit/:id" element={<ProtectedRoute><ArticleEditor /></ProtectedRoute>} />
        <Route path="/admin/newsletter" element={<ProtectedRoute><NewsletterSubscribers /></ProtectedRoute>} />
        <Route path="/admin/newsletter/send" element={<ProtectedRoute><SendNewsletter /></ProtectedRoute>} />
        <Route path="/admin/newsletter/stats" element={<ProtectedRoute><NewsletterStats /></ProtectedRoute>} />
        <Route path="/admin/analytics" element={<ProtectedRoute><AnalyticsDashboard /></ProtectedRoute>} />
        <Route path="/admin/settings" element={<ProtectedRoute><SiteSettings /></ProtectedRoute>} />
      </Routes>
    </Router>
    </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
