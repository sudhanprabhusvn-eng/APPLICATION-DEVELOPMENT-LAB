import { useState } from 'react';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Score 0-4 from: length, mixed case, a digit and a symbol
function passwordScore(password) {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  return score;
}

function strengthHint(score) {
  if (score <= 1) return 'Add length and variety';
  if (score <= 3) return 'Getting stronger';
  return 'Strong password';
}

export default function Registration({ onRegister, onSwitch }) {
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const score = passwordScore(form.password);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
    setFormError('');
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const nextErrors = {};
    const username = form.username.trim();

    if (!username) nextErrors.username = 'Username is required.';
    else if (username.length > 32) nextErrors.username = 'Username must be 32 characters or fewer.';

    if (!form.email.trim()) nextErrors.email = 'Email is required.';
    else if (!EMAIL_RE.test(form.email.trim())) nextErrors.email = 'Enter a valid email address.';

    if (!form.password) nextErrors.password = 'Password is required.';
    else if (form.password.length < 8) nextErrors.password = 'Password must be at least 8 characters.';

    if (!form.confirm) nextErrors.confirm = 'Please confirm your password.';
    else if (form.confirm !== form.password) nextErrors.confirm = 'Passwords do not match.';

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    const error = await onRegister({
      username: form.username,
      email: form.email,
      password: form.password,
    });
    if (error) {
      setFormError(error);
      setSubmitting(false);
    }
  }

  return (
    <form className="card" onSubmit={handleSubmit} noValidate>
      <h2>Create account</h2>
      <p className="muted">It only takes a minute.</p>

      {formError && (
        <p className="alert error-box" role="alert">
          {formError}
        </p>
      )}

      <div className="field">
        <label htmlFor="reg-username">Username</label>
        <input
          id="reg-username"
          name="username"
          type="text"
          autoComplete="username"
          value={form.username}
          onChange={handleChange}
          aria-invalid={errors.username ? 'true' : 'false'}
          aria-describedby={errors.username ? 'reg-username-error' : undefined}
        />
        {errors.username && (
          <span id="reg-username-error" className="error" role="alert">
            {errors.username}
          </span>
        )}
      </div>

      <div className="field">
        <label htmlFor="reg-email">Email</label>
        <input
          id="reg-email"
          name="email"
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={handleChange}
          aria-invalid={errors.email ? 'true' : 'false'}
          aria-describedby={errors.email ? 'reg-email-error' : undefined}
        />
        {errors.email && (
          <span id="reg-email-error" className="error" role="alert">
            {errors.email}
          </span>
        )}
      </div>

      <div className="field">
        <label htmlFor="reg-password">Password</label>
        <input
          id="reg-password"
          name="password"
          type="password"
          autoComplete="new-password"
          value={form.password}
          onChange={handleChange}
          aria-invalid={errors.password ? 'true' : 'false'}
          aria-describedby={
            errors.password ? 'reg-password-error' : form.password ? 'reg-strength' : undefined
          }
        />
        {errors.password && (
          <span id="reg-password-error" className="error" role="alert">
            {errors.password}
          </span>
        )}
        {form.password && (
          <span id="reg-strength" className={`strength s${score}`} role="status">
            {strengthHint(score)}
          </span>
        )}
      </div>

      <div className="field">
        <label htmlFor="reg-confirm">Confirm password</label>
        <input
          id="reg-confirm"
          name="confirm"
          type="password"
          autoComplete="new-password"
          value={form.confirm}
          onChange={handleChange}
          aria-invalid={errors.confirm ? 'true' : 'false'}
          aria-describedby={errors.confirm ? 'reg-confirm-error' : undefined}
        />
        {errors.confirm && (
          <span id="reg-confirm-error" className="error" role="alert">
            {errors.confirm}
          </span>
        )}
      </div>

      <button type="submit" className="btn" disabled={submitting}>
        {submitting ? 'Creating account...' : 'Register'}
      </button>

      <p className="switch">
        Already have an account?{' '}
        <button type="button" className="link" onClick={onSwitch}>
          Log in
        </button>
      </p>
    </form>
  );
}
