-- Read-only role for diagnostics in production (see docs/production.md). Run it once as the
-- owner of the app's tables, replacing ecomm with the database name.
--
-- Each person gets their own login that inherits it, never the app's user:
--   CREATE ROLE fede LOGIN PASSWORD '...' IN ROLE ecomm_readonly;
-- and drops it when they no longer need it.

CREATE ROLE ecomm_readonly NOLOGIN;

GRANT CONNECT ON DATABASE ecomm TO ecomm_readonly;
GRANT USAGE ON SCHEMA public TO ecomm_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO ecomm_readonly;
-- Tables created by later migrations too.
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO ecomm_readonly;

-- Sessions and 2FA secrets aren't for reading: a session key logs in as its user, and a TOTP
-- key generates their codes.
REVOKE SELECT ON django_session, mfa_authenticator FROM ecomm_readonly;
