import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function PrivateRoute({ children }) {
  const { token, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="flex bg-zinc-950 items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return token ? children : <Navigate to="/login" />;
}
