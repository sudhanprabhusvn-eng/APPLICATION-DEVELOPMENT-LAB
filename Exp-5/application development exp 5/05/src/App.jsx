import { useState } from 'react';
import Login from './Login.jsx';
import Registration from './Registration.jsx';
import { createUser, findUser, getUserByEmail, getSession, saveSession, clearSession } from './auth.js';

// Restore a signed-in user from sessionStorage (if any)
function restoreUser() {
  try {
    const email = getSession();
    return email ? getUserByEmail(email) : null;
  } catch (err) {
    return null;
  }
}

const PANEL_TEXT = {
  login: { title: 'Welcome back', text: 'Log in to see your dashboard.' },
  register: { title: 'Join us today', text: 'Create an account to get started.' },
  dashboard: { title: 'You are in', text: 'Your session is active in this tab.' },
};

export default function App() {
  const [currentUser, setCurrentUser] = useState(restoreUser);
  const [page, setPage] = useState(() => (restoreUser() ? 'dashboard' : 'login'));
  const [notice, setNotice] = useState('');

  // Each handler returns an error string, or null on success.
  async function handleRegister(values) {
    try {
      const error = await createUser(values);
      if (error) return error;
      setNotice('Account created successfully. Please log in.');
      setPage('login');
      return null;
    } catch (err) {
      return err.message;
    }
  }

  async function handleLogin(email, password) {
    try {
      const user = await findUser(email, password);
      if (!user) return 'Incorrect email or password.';
      saveSession(user.email);
      setCurrentUser(user);
      setNotice('');
      setPage('dashboard');
      return null;
    } catch (err) {
      return err.message;
    }
  }

  function handleLogout() {
    clearSession();
    setCurrentUser(null);
    setNotice('You have been signed out.');
    setPage('login');
  }

  function goTo(nextPage) {
    setNotice('');
    setPage(nextPage);
  }

  const panel = PANEL_TEXT[page];

  return (
    <div className="layout">
      <aside className="panel" aria-hidden="true">
        <span className="shape shape-a" />
        <span className="shape shape-b" />
        <span className="shape shape-c" />
        <div className="panel-text">
          <h1>{panel.title}</h1>
          <p>{panel.text}</p>
        </div>
      </aside>

      <main className="content">
        {notice && (
          <p className="alert success-box" role="status">
            {notice}
          </p>
        )}

        {page === 'login' && <Login onLogin={handleLogin} onSwitch={() => goTo('register')} />}

        {page === 'register' && (
          <Registration onRegister={handleRegister} onSwitch={() => goTo('login')} />
        )}

        {page === 'dashboard' && currentUser && (
          <section className="card dashboard">
            <h2>Hello, {currentUser.username}!</h2>
            <p className="muted">You are signed in as</p>
            <p className="email-chip">{currentUser.email}</p>
            <button type="button" className="btn" onClick={handleLogout}>
              Sign out
            </button>
          </section>
        )}
      </main>
    </div>
  );
}
