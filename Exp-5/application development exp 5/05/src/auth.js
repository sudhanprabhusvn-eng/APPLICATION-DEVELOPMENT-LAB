// Data module: accounts, password hashing and sessions.
// Front-end learning demo only: accounts live in the browser (localStorage).

const USERS_KEY = 'authDemo.users';
const SESSION_KEY = 'authDemo.session';

// ---------- Storage helpers ----------
function readUsers() {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    throw new Error('Could not read saved accounts. Please check that browser storage is enabled.');
  }
}

function writeUsers(users) {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch (err) {
    throw new Error('Could not save your account. Please check that browser storage is enabled.');
  }
}

// ---------- Hashing (Web Crypto API) ----------
function toHex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function generateSalt() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return toHex(bytes);
}

async function hashPassword(password, salt) {
  const data = new TextEncoder().encode(`${salt}:${password}`);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return toHex(digest);
}

// ---------- Accounts ----------
// Returns an error message string, or null when the account was created.
export async function createUser({ username, email, password }) {
  const users = readUsers();
  const cleanEmail = email.trim().toLowerCase();
  const cleanName = username.trim();

  if (users.some((u) => u.email === cleanEmail)) {
    return 'An account with this email already exists.';
  }
  if (users.some((u) => u.username.toLowerCase() === cleanName.toLowerCase())) {
    return 'This username is already taken.';
  }

  const salt = generateSalt();
  const hash = await hashPassword(password, salt);

  // Only username, email, salt and hash are stored (never the password).
  users.push({ username: cleanName, email: cleanEmail, salt, hash });
  writeUsers(users);
  return null;
}

// Returns the user object when the details are correct, otherwise null.
export async function findUser(email, password) {
  const users = readUsers();
  const cleanEmail = email.trim().toLowerCase();
  const user = users.find((u) => u.email === cleanEmail);
  if (!user) return null;

  const hash = await hashPassword(password, user.salt);
  return hash === user.hash ? user : null;
}

export function getUserByEmail(email) {
  return readUsers().find((u) => u.email === email) || null;
}

// ---------- Session (cleared when the tab closes) ----------
export function saveSession(email) {
  try {
    sessionStorage.setItem(SESSION_KEY, email);
  } catch (err) {
    throw new Error('Could not start your session. Please check that browser storage is enabled.');
  }
}

export function getSession() {
  try {
    return sessionStorage.getItem(SESSION_KEY);
  } catch (err) {
    return null;
  }
}

export function clearSession() {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch (err) {
    /* nothing to clear */
  }
}
