# Switchboard

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-v0.0.0-yellow.svg)
![Docker](https://img.shields.io/docker/pulls/thebronway/switchboard?logo=docker)

### Identity & Access Management (IAM) Dashboard for Homelabs & Self-Hosted Environments.

Switchboard connects your identity provider (LDAP or Local Database) with self-hosted services (Plex, Overseerr, Wireguard). It provides administrators with Role-Based Access Control (RBAC) and users with a portal to manage credentials and service access.

**GitHub:** [thebronway/switchboard](https://github.com/thebronway/switchboard)  
**Docker Hub:** [thebronway/switchboard](https://hub.docker.com/r/thebronway/switchboard)  
**Documentation:** Read the [User Guide](./docs/USER_GUIDE.md) for setup, configuration, and feature details.  
**Roadmap:** See planned features in the [Project Roadmap](./ROADMAP.md).  
**Changelog:** Review past releases in the [Changelog](./CHANGELOG.md).

## Features

### Security
- **Containerized Architecture:** Runs within Docker with non-root user enforcement.
- **Configuration Validation:** Environment variable validation on boot (via Zod/Joi).
- **External Database:** Requires PostgreSQL for data storage.
- **Encryption:** LDAP bind passwords and plugin API keys are encrypted at rest using AES-256-GCM.
- **Audit Logging:** Login attempts, password resets, and permission changes are logged in JSON format.
- **Rate Limiting:** Defenses against brute-force attacks on authentication endpoints.

### Identity & Access Management
- **Identity Sources:** Connect to an LDAP/Active Directory server or use the Local Database provider.
- **LDAP Synchronization & Write-Back:** Read-only user syncs or LDAPS/StartTLS to allow users to reset LDAP passwords.
- **Role-Based Access Control (RBAC):** Map users to roles and assign plugin access based on permission schemas.

### User Portal
- **Onboarding:** Setup workflows for added users.
- **Profile Management:** Users update personal information and reset passwords via tokenized email links.
- **Service Dashboard:** Users view modules and services they are granted access to.

### Plugin Engine
Switchboard uses a domain-driven architecture. The application can be extended with plugins that use lifecycle hooks (`install`, `uninstall`, `grantAccess`, `revokeAccess`).

**First-Party Modules:**
- **Plex:** Invite or revoke users from Plex library shares.
- **Overseerr / Jellyseerr:** Map Switchboard users to Overseerr permissions.
- **Wireguard (API):** Provision and revoke VPN profiles via external managers (e.g., wg-easy). Switchboard acts as an API client, not the VPN server.