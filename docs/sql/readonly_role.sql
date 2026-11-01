-- Read-only role for diagnostics in production (see docs/production.md). The app's user can't
-- create roles (it isn't a superuser), so it goes in two steps (deploy/README.md):
--   1. as a superuser: CREATE ROLE ecomm_readonly NOLOGIN;
--   2. this file, once, as the owner of the app's tables (replacing ecomm with the database name):
--      the default privileges apply to the tables that owner creates later.
--
-- Each person gets their own login that inherits it (created as a superuser), never the app's user:
--   CREATE ROLE franco LOGIN PASSWORD '...' IN ROLE ecomm_readonly;
-- and drops it when they no longer need it.

GRANT CONNECT ON DATABASE ecomm TO ecomm_readonly;
GRANT USAGE ON SCHEMA public TO ecomm_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO ecomm_readonly;
-- Tables created by later migrations too.
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO ecomm_readonly;

-- Sessions and 2FA secrets aren't for reading: a session key logs in as its user, and a TOTP
-- key generates their codes.
REVOKE SELECT ON django_session, mfa_authenticator FROM ecomm_readonly;
