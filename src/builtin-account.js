'use strict';

const crypto = require('node:crypto');

const BUILTIN_OWNER_ACCOUNTS = Object.freeze([
  Object.freeze({
    id: 'builtin-owner-moote-v2',
    email: 'moote@gmail.com',
    sessionToken: 'builtin-owner:v2:moote',
    passwordSalt: 'vidogo-basic-owner-2026-09-a',
    passwordHash: '69cd01d82ebf51228b3f87adc6912528bf6b2c0c3512d19f4e58c1ceb532af0c',
  }),
  Object.freeze({
    id: 'builtin-owner-qiuz01511-v2',
    email: 'qiuz01511@gmail.com',
    sessionToken: 'builtin-owner:v2:qiuz01511',
    passwordSalt: 'vidogo-basic-owner-2026-09-b',
    passwordHash: 'db0a1f6dbc725a61dc526e2ba9e040ff14c5ba154e083a8e1923711dac1a96e6',
  }),
]);
const BUILTIN_OWNER_EMAILS = Object.freeze(BUILTIN_OWNER_ACCOUNTS.map((account) => account.email));
const BUILTIN_OWNER_EMAIL = BUILTIN_OWNER_EMAILS[0];
const BUILTIN_OWNER_SESSION_TOKEN = BUILTIN_OWNER_ACCOUNTS[0].sessionToken;

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

function accountForEmail(value) {
  const email = normalizeEmail(value);
  return BUILTIN_OWNER_ACCOUNTS.find((account) => account.email === email) || null;
}

function accountForSession(value) {
  const token = String(value || '');
  return BUILTIN_OWNER_ACCOUNTS.find((account) => account.sessionToken === token) || null;
}

function isBuiltinOwnerEmail(value) {
  return accountForEmail(value) !== null;
}

function verifyBuiltinOwnerPassword(account, value) {
  if (!account) return false;
  const actual = crypto.scryptSync(String(value || ''), account.passwordSalt, 32);
  const expected = Buffer.from(account.passwordHash, 'hex');
  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
}

function verifyBuiltinOwnerCredentials(credentials = {}) {
  return verifyBuiltinOwnerPassword(accountForEmail(credentials.email), credentials.password);
}

function builtinOwnerSessionToken(value) {
  return accountForEmail(value)?.sessionToken || null;
}

function isBuiltinOwnerSession(accessToken) {
  return accountForSession(accessToken) !== null;
}

function builtinOwnerUser(identity = BUILTIN_OWNER_EMAIL) {
  const account = accountForEmail(identity) || accountForSession(identity) || BUILTIN_OWNER_ACCOUNTS[0];
  return {
    id: account.id,
    email: account.email,
    role: 'owner',
    plan: 'owner',
    planExpiresAt: null,
    createdAt: '2026-09-01T00:00:00.000Z',
    builtin: true,
  };
}

module.exports = {
  BUILTIN_OWNER_ACCOUNTS,
  BUILTIN_OWNER_EMAIL,
  BUILTIN_OWNER_EMAILS,
  BUILTIN_OWNER_SESSION_TOKEN,
  builtinOwnerSessionToken,
  builtinOwnerUser,
  isBuiltinOwnerEmail,
  isBuiltinOwnerSession,
  verifyBuiltinOwnerCredentials,
};
