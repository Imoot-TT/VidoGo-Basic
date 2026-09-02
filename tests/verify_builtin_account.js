const assert = require('assert');
const fs = require('fs');
const path = require('path');
const {
  BUILTIN_OWNER_EMAIL,
  BUILTIN_OWNER_EMAILS,
  BUILTIN_OWNER_SESSION_TOKEN,
  builtinOwnerSessionToken,
  builtinOwnerUser,
  isBuiltinOwnerEmail,
  isBuiltinOwnerSession,
  verifyBuiltinOwnerCredentials,
} = require('../src/builtin-account');

assert.strictEqual(BUILTIN_OWNER_EMAIL, 'moote@gmail.com');
assert.deepStrictEqual(BUILTIN_OWNER_EMAILS, ['moote@gmail.com', 'qiuz01511@gmail.com']);
assert.strictEqual(isBuiltinOwnerEmail('  MOOTE@GMAIL.COM '), true);
assert.strictEqual(isBuiltinOwnerEmail('qiuz01511@gmail.com'), true);
assert.strictEqual(isBuiltinOwnerEmail('moote011@gmail.com'), false);
assert.strictEqual(isBuiltinOwnerEmail('someone@example.com'), false);
assert.strictEqual(isBuiltinOwnerSession(BUILTIN_OWNER_SESSION_TOKEN), true);
assert.strictEqual(isBuiltinOwnerSession(builtinOwnerSessionToken('qiuz01511@gmail.com')), true);
assert.notStrictEqual(builtinOwnerSessionToken('moote@gmail.com'), builtinOwnerSessionToken('qiuz01511@gmail.com'));
assert.strictEqual(isBuiltinOwnerSession('not-owner'), false);
assert.strictEqual(verifyBuiltinOwnerCredentials({ email: BUILTIN_OWNER_EMAIL, password: 'incorrect-password' }), false);
assert.strictEqual(verifyBuiltinOwnerCredentials({ email: 'qiuz01511@gmail.com', password: 'incorrect-password' }), false);
assert.deepStrictEqual(
  { email: builtinOwnerUser().email, role: builtinOwnerUser().role, plan: builtinOwnerUser().plan, builtin: builtinOwnerUser().builtin },
  { email: BUILTIN_OWNER_EMAIL, role: 'owner', plan: 'owner', builtin: true },
);
assert.strictEqual(builtinOwnerUser('qiuz01511@gmail.com').email, 'qiuz01511@gmail.com');
assert.strictEqual(builtinOwnerUser(builtinOwnerSessionToken('qiuz01511@gmail.com')).email, 'qiuz01511@gmail.com');

const source = fs.readFileSync(path.join(__dirname, '..', 'src', 'builtin-account.js'), 'utf8');
assert(source.includes('crypto.scryptSync') && source.includes('passwordHash'), 'The built-in password verifier must use stored scrypt hashes.');

console.log(JSON.stringify({ emails: BUILTIN_OWNER_EMAILS, role: 'owner', plan: 'owner', plaintextStored: false }));
