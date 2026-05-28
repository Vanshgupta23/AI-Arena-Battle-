
import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const [token, setToken] = useState(
    localStorage.getItem('token') || null
  );

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      const storedUser =
        localStorage.getItem('user');

      if (storedUser) {
        setUser(
          JSON.parse(storedUser)
        );
      }
    }

    setLoading(false);
  }, [token]);

  const login = async (
    email,
    password
  ) => {
    const res = await axios.post(
      'http://localhost:3000/api/auth/login',
      {
        email,
        password
      }
    );

    const { token, user } = res.data;

    setToken(token);
    setUser(user);

    localStorage.setItem(
      'token',
      token
    );

    localStorage.setItem(
      'user',
      JSON.stringify(user)
    );
  };

  const signup = async (
    name,
    email,
    password
  ) => {
    const res = await axios.post(
      'http://localhost:3000/api/auth/signup',
      {
        name,
        email,
        password
      }
    );

    const { token, user } = res.data;

    setToken(token);
    setUser(user);

    localStorage.setItem(
      'token',
      token
    );

    localStorage.setItem(
      'user',
      JSON.stringify(user)
    );
  };

  const logout = () => {
    setToken(null);
    setUser(null);

    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        signup,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};