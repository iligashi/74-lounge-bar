const bcrypt = require('bcryptjs');

const MIN_ADMIN_PASSWORD_LENGTH = 12;

// Passwords that were shipped as defaults in earlier versions of this
// repository. They are public, so they are never accepted.
const KNOWN_DEFAULT_PASSWORDS = ['admin123'];

function isKnownDefaultPassword(password, hash) {
  return KNOWN_DEFAULT_PASSWORDS.some((candidate) => password === candidate || (hash && bcrypt.compareSync(candidate, hash)));
}

function validateAdminPassword(password) {
  if (typeof password !== 'string' || password.length < MIN_ADMIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_ADMIN_PASSWORD_LENGTH} characters`;
  }
  if (isKnownDefaultPassword(password)) {
    return 'This password is publicly known and cannot be used';
  }
  return null;
}

/**
 * Create the first administrator from ADMIN_USERNAME / ADMIN_PASSWORD.
 * Nothing is created when they are unset: there is no built-in default
 * account. An existing account that still uses a published default password
 * is rotated to ADMIN_PASSWORD when one is provided.
 */
async function bootstrapAdmin(pool, env = process.env, log = console) {
  const username = (env.ADMIN_USERNAME || '').trim();
  const password = env.ADMIN_PASSWORD;

  const [admins] = await pool.query('SELECT id, username, password FROM admin_users');
  const count = admins.length;
  const insecure = admins.filter((row) => isKnownDefaultPassword(null, row.password));

  if (!username || !password) {
    if (count === 0) {
      log.warn('No admin account exists. Set ADMIN_USERNAME and ADMIN_PASSWORD and restart to create one.');
    }
    insecure.forEach((row) =>
      log.warn(`Admin "${row.username}" uses a published default password and is locked out until it is rotated (set ADMIN_PASSWORD and restart).`)
    );
    return { created: false, rotated: 0 };
  }

  const problem = validateAdminPassword(password);
  if (problem) throw new Error(`ADMIN_PASSWORD rejected: ${problem}`);
  const hash = bcrypt.hashSync(password, 12);

  for (const row of insecure) {
    await pool.query('UPDATE admin_users SET password = ? WHERE id = ?', [hash, row.id]);
    log.warn(`Rotated published default password for admin "${row.username}".`);
  }

  if (count === 0) {
    await pool.query('INSERT INTO admin_users (username, password) VALUES (?, ?)', [username, hash]);
    log.info(`Admin account "${username}" created from environment.`);
    return { created: true, rotated: insecure.length };
  }
  return { created: false, rotated: insecure.length };
}

module.exports = { bootstrapAdmin, validateAdminPassword, isKnownDefaultPassword, MIN_ADMIN_PASSWORD_LENGTH };
