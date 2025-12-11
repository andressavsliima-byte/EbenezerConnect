import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import Favorites from './pages/Favorites';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import AdminProducts from './pages/AdminProducts';
import AdminOrders from './pages/AdminOrders';
import AdminUsers from './pages/AdminUsers';
import AdminMessages from './pages/AdminMessages';
import AdminPromos from './pages/AdminPromos';
import ProtectedRoute from './components/ProtectedRoute';
import MobileTabBar from './components/MobileTabBar';
import UnipamLogin from './pages/UnipamLogin';

function AppContent() {
  const location = useLocation();
  const hideNavbar = location.pathname === '/';

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      {!hideNavbar && <Navbar />}
      <Routes>
          <Route path="/" element={<UnipamLogin />} />
        <Route path="/catalogo" element={<ProtectedRoute><Catalog /></ProtectedRoute>} />
        <Route path="/produto/:id" element={<ProtectedRoute><ProductDetail /></ProtectedRoute>} />
        <Route path="/carrinho" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
        <Route path="/pedidos" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
        <Route path="/favoritos" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
        <Route path="/perfil" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/produtos" element={<ProtectedRoute adminOnly><AdminProducts /></ProtectedRoute>} />
        <Route path="/admin/pedidos" element={<ProtectedRoute adminOnly><AdminOrders /></ProtectedRoute>} />
        <Route path="/admin/usuarios" element={<ProtectedRoute adminOnly><AdminUsers /></ProtectedRoute>} />
        <Route path="/admin/promos" element={<ProtectedRoute adminOnly><AdminPromos /></ProtectedRoute>} />
        <Route path="/admin/mensagens" element={<ProtectedRoute adminOnly><AdminMessages /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      {!hideNavbar && <MobileTabBar />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
