# Switchboard

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-v0.0.0-yellow.svg)
![Docker](https://img.shields.io/docker/pulls/thebronway/switchboard?logo=docker)

### Identity & Access Management (IAM) Dashboard for Homelabs & Self-Hosted Environments.

Switchboard connects your identity provider (LDAP or Local Database) with self-hosted services (like: Plex, Overseerr, Wireguard). It provides administrators with Role-Based Access Control (RBAC) and users with a portal to manage credentials and service access.

**GitHub:** [thebronway/switchboard](https://github.com/thebronway/switchboard)  
**Docker Hub:** [thebronway/switchboard](https://hub.docker.com/r/thebronway/switchboard)  
**Documentation:** Read the [User Guide](./docs/USER_GUIDE.md) for setup, configuration, and feature details.  
**Roadmap:** See planned features in the [Project Roadmap](./ROADMAP.md).  
**Changelog:** Review past releases in the [Changelog](./CHANGELOG.md).

## Features

**First-Party Modules:**
- **Plex:** Invite or revoke users from Plex library shares.
- **Overseerr / Jellyseerr:** Map Switchboard users to Overseerr permissions.
- **Wireguard (API):** Provision and revoke VPN profiles via external managers (e.g., wg-easy). Switchboard acts as an API client, not the VPN server.