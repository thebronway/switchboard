# Switchboard Roadmap

*Last updated: 2026-07-04*  
*Current Version: v0.0.1*

## Overview
This document tracks planned improvements, enhancements, and maintenance.

## Release Roadmap

### v0.0.1: The Secure Sandbox
**Goal:** Establish the containerized environment and fail-fast configurations.
* Setup `docker-compose.yml` with the Node.js application and PostgreSQL database.
* Implement the Zod/Joi environment variable validation in `/config/env.ts`.
* Configure the base Express/Fastify server with security middleware (Helmet, CORS).
* Establish the database connection pool.

### v0.0.5: Schema & Cryptography
**Goal:** Define the data layer and secure the handling of sensitive information.
* Run initial database migrations for `users`, `roles`, and `audit_logs` tables.
* Implement `hashing.service.ts` for local password storage (Argon2).
* Implement `encryption.service.ts` (AES-256-GCM) for storing API keys securely.
* Build the structured JSON `audit.service.ts` to track all critical actions.

### v0.1.0: Local Auth & Bootstrapping
**Goal:** Create the core authentication loop and admin baseline.
* Implement the admin bootstrapping workflow (create initial admin on first boot).
* Build the local login route and issue secure, HTTP-only JWT/Session cookies.
* Implement `auth.middleware.ts` to protect internal routes.
* Implement `rateLimiter.middleware.ts` to prevent brute-force attacks on the login endpoint.

### v0.1.5: Identity & Synchronization
**Goal:** Connect to the external directory securely.
* Build the `identity.factory.ts` to route requests to either Local or LDAP services.
* Implement `ldap.client.ts` with strict TLS/LDAPS enforcement.
* Build `ldapSync.service.ts` to perform a read-only import of users from the directory.
* Map external LDAP groups to local Switchboard `roles`.

### v0.2.0: Communications & Self-Service (The MVP)
**Goal:** Allow users to manage their own base accounts and receive notifications.
* Build the SMTP module and email template system for notifications.
* Implement `ldapWrite.service.ts` to allow users to securely update their passwords in LDAP.
* Develop the user-facing web dashboard (Profile view, password reset form).
* Develop the basic Admin dashboard (User list, role assignment).
* **MILESTONE: Minimum Viable Product (MVP) Achieved.** The app can now securely onboard users, sync from LDAP, and allow self-service password resets.

### v0.2.5: The Plugin Engine
**Goal:** Lay the architectural groundwork for external module integrations.
* Define the strict `plugin.interface.ts` contract (install, uninstall, grant, revoke).
* Build `plugin.manager.ts` to dynamically load modules and inject encrypted API keys.
* Update the database schema to track which users have access to which plugins.
* Update the Admin UI to toggle plugins on/off and assign them to users.

### v0.3.0: The Media Modules
**Goal:** Integrate the first-party entertainment plugins.
* Build the `plex.plugin.ts` to connect to the Plex API and invite/revoke library access.
* Build the `overseerr.plugin.ts` to map Switchboard users to Overseerr permissions.
* Update the User Dashboard to display granted media services and single-sign-on links (if applicable).

### v0.3.5: The Network Module
**Goal:** Integrate secure VPN provisioning.
* Build the `wireguard.plugin.ts` to act strictly as an API client to an external Wireguard manager (e.g., wg-easy).
* Implement the logic to auto-generate and display client configuration files/QR codes in the User Dashboard.
* Ensure immediate VPN profile revocation when an Admin removes access or disables a user.

### v0.4.0: Production Polish
**Goal:** Final security audits, optimizations, and the official release.
* Conduct a full audit of all error handling to ensure zero stack-trace leakage.
* Implement comprehensive logging for all plugin-based actions (Plex invites, VPN generation).
* Finalize the Docker image build process (multi-stage builds, minimizing image size).
* Write the user and admin documentation.
* **MILESTONE: Fully Built App.** Switchboard is ready for homelab and enterprise deployment.