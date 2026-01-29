import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children, adminOnly = false }) {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly) {
    const user = userStr ? JSON.parse(userStr) : null;
    if (user?.role !== 'admin') {
      return <Navigate to="/catalogo" replace />;
    }
  }

  return children;
}
