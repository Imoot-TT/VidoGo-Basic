const assert = require('assert');
const fs = require('fs');
const path = require('path');
const {
  BUILTIN_OWNER_EMAIL,
  BUILTIN_OWNER_SESSION_TOKEN,
  builtinOwnerUser,
  isBuiltinOwnerEmail,
  isBuiltinOwnerSession,
  verifyBuiltinOwnerCredentials,
} = require('../src/builtin-account');

assert.strictEqual(BUILTIN_OWNER_EMAIL, 'moote011@gmail.com');
assert.strictEqual(isBuiltinOwnerEmail('  MOOTE011@GMAIL.COM '), true);
assert.strictEqual(isBuiltinOwnerEmail('someone@example.com'), false);
assert.strictEqual(isBuiltinOwnerSession(BUILTIN_OWNER_SESSION_TOKEN), true);
assert.strictEqual(isBuiltinOwnerSession('not-owner'), false);
assert.strictEqual(verifyBuiltinOwnerCredentials({ email: BUILTIN_OWNER_EMAIL, password: 'incorrect-password' }), false);
assert.deepStrictEqual(
  { email: builtinOwnerUser().email, role: builtinOwnerUser().role, plan: builtinOwnerUser().plan, builtin: builtinOwnerUser().builtin },
  { email: BUILTIN_OWNER_EMAIL, role: 'owner', plan: 'owner', builtin: true },
);

const source = fs.readFileSync(path.join(__dirname, '..', 'src', 'builtin-account.js'), 'utf8');
assert(source.includes('crypto.scryptSync') && source.includes('BUILTIN_OWNER_PASSWORD_HASH'), 'The built-in password verifier must use a stored scrypt hash.');

console.log(JSON.stringify({ email: BUILTIN_OWNER_EMAIL, role: 'owner', plan: 'owner', plaintextStored: false }));
