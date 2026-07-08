import React, { useCallback, useEffect, useState } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import { fetchCurrentUser, setOnUnauthorized } from './utils/api';

function App() {
  const [authState, setAuthState] = useState({ status: 'loading', user: null });

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    setAuthState({ status: 'unauthenticated', user: null });
  }, []);

  useEffect(() => {
    setOnUnauthorized(handleLogout);
  }, [handleLogout]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setAuthState({ status: 'unauthenticated', user: null });
      return;
    }

    fetchCurrentUser()
      .then((user) => setAuthState({ status: 'authenticated', user }))
      .catch(() => handleLogout());
  }, [handleLogout]);

  const handleLoginSuccess = useCallback(async () => {
    try {
      const user = await fetchCurrentUser();
      setAuthState({ status: 'authenticated', user });
    } catch {
      handleLogout();
    }
  }, [handleLogout]);

  if (authState.status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-600">
        Yükleniyor...
      </div>
    );
  }

  if (authState.status === 'authenticated') {
    return (
      <Dashboard
        currentUser={authState.user}
        onLogout={handleLogout}
      />
    );
  }

  return <Login onLoginSuccess={handleLoginSuccess} />;
}

export default App;
