'use strict';

const crypto = require('node:crypto');

const BUILTIN_OWNER_EMAIL = 'moote011@gmail.com';
const BUILTIN_OWNER_SESSION_TOKEN = 'builtin-owner:v1';
const BUILTIN_OWNER_PASSWORD_SALT = 'vidogo-v1-owner-2026-08';
const BUILTIN_OWNER_PASSWORD_HASH = '6c430dbbebedbe0dcfada97fdb82212895628d441570d51522136de43d7a3826';

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

function isBuiltinOwnerEmail(value) {
  return normalizeEmail(value) === BUILTIN_OWNER_EMAIL;
}

function verifyBuiltinOwnerPassword(value) {
  const actual = crypto.scryptSync(String(value || ''), BUILTIN_OWNER_PASSWORD_SALT, 32);
  const expected = Buffer.from(BUILTIN_OWNER_PASSWORD_HASH, 'hex');
  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
}

function verifyBuiltinOwnerCredentials(credentials = {}) {
  return isBuiltinOwnerEmail(credentials.email) && verifyBuiltinOwnerPassword(credentials.password);
}

function isBuiltinOwnerSession(accessToken) {
  return String(accessToken || '') === BUILTIN_OWNER_SESSION_TOKEN;
}

function builtinOwnerUser() {
  return {
    id: 'builtin-owner-v1',
    email: BUILTIN_OWNER_EMAIL,
    role: 'owner',
    plan: 'owner',
    planExpiresAt: null,
    createdAt: '2026-08-29T00:00:00.000Z',
    builtin: true,
  };
}

module.exports = {
  BUILTIN_OWNER_EMAIL,
  BUILTIN_OWNER_SESSION_TOKEN,
  builtinOwnerUser,
  isBuiltinOwnerEmail,
  isBuiltinOwnerSession,
  verifyBuiltinOwnerCredentials,
};
