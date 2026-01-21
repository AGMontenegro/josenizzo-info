import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import ArticleDetail from './pages/ArticleDetail';
import Category from './pages/Category';
import Unsubscribe from './pages/Unsubscribe';
import About from './pages/About';
import Contact from './pages/Contact';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import AdminLogin from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard';
import AdminArticlesList from './pages/admin/ArticlesList';
import ArticleEditor from './pages/admin/ArticleEditor';
import NewsletterSubscribers from './pages/admin/NewsletterSubscribers';
import SendNewsletter from './pages/admin/SendNewsletter';
import NewsletterStats from './pages/admin/NewsletterStats';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="articulo/:id" element={<ArticleDetail />} />
          <Route path="categoria/:category" element={<Category />} />
          <Route path="desuscribirse" element={<Unsubscribe />} />
          <Route path="sobre-nosotros" element={<About />} />
          <Route path="contacto" element={<Contact />} />
          <Route path="privacidad" element={<Privacy />} />
          <Route path="terminos" element={<Terms />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/articles" element={<ProtectedRoute><AdminArticlesList /></ProtectedRoute>} />
        <Route path="/admin/articles/new" element={<ProtectedRoute><ArticleEditor /></ProtectedRoute>} />
        <Route path="/admin/articles/edit/:id" element={<ProtectedRoute><ArticleEditor /></ProtectedRoute>} />
        <Route path="/admin/newsletter" element={<ProtectedRoute><NewsletterSubscribers /></ProtectedRoute>} />
        <Route path="/admin/newsletter/send" element={<ProtectedRoute><SendNewsletter /></ProtectedRoute>} />
        <Route path="/admin/newsletter/stats" element={<ProtectedRoute><NewsletterStats /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
