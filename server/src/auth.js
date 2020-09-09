const { scryptSync, randomBytes } = require('crypto');

function hashPassword(password) {
  let size = 32;
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, size);
  return [
    salt.toString('base64'),
    size.toString(),
    hash.toString('base64'),
  ].join('$');
}

function verifyPassword(password, saltedHash) {
  let [salt, size, hash] = saltedHash.split('$');
  salt = Buffer.from(salt, 'base64');
  size = parseInt(size);
  return hash === scryptSync(password, salt, size).toString('base64');
}

module.exports = {
  hashPassword,
  verifyPassword,
};
