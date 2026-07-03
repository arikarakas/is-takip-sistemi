import React, { useState } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const savedToken = localStorage.getItem("token");
    return !!savedToken;
  });

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
  };

  if (isLoggedIn) {
    return <Dashboard onLogout={handleLogout} />;
  }

  return <Login onLoginSuccess={() => setIsLoggedIn(true)} />;
}

export default App;