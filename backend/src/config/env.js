// Fail fast on missing or unsafe security configuration instead of silently
// falling back to predictable values.
const MIN_SECRET_LENGTH = 32;

function requireJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < MIN_SECRET_LENGTH) {
    throw new Error(
      `JWT_SECRET must be set to a random value of at least ${MIN_SECRET_LENGTH} characters ` +
        "(generate one with: node -e \"console.log(require('crypto').randomBytes(48).toString('hex'))\")"
    );
  }
  return secret;
}

module.exports = { requireJwtSecret };
