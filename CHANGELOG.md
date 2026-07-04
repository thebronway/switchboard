# Switchboard Changelog

*Last updated: 2026-07-04*  
*Current Version: v0.0.1*

## Overview
This document tracks past changes starting with v0.0.1.

## Changelog

### Release v0.0.1
- Added Dockerfile and docker-compose.yml
- Added Node.js project configuration and TypeScript compiler options
- Added environment variable validation
- Added base Express server with Helmet and CORS middleware
- Added PostgreSQL database connection pool

### Release v0.0.5
- Added database migrations for roles, users, and audit_logs tables
- Added Argon2 hashing service for secure password storage
- Added AES-256-GCM encryption service for sensitive data at rest
- Added audit service for tracking critical security events