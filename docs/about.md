# Architectural Specification & Engineering Blueprint: Project Switchboard

## Role & System Goal
The objective is to program **Switchboard**: an Active Identity Lifecycle, Self-Service Hub, and Service Provisioner. 

Do not premature-optimize or hardcode specific relational database tables, column names, or rigid fields. Instead, implement this system using a **behavioral, domain-driven approach** that prioritizes architectural elasticity, secure data flow patterns, strict conceptual separation of concerns, and an isolated, pluggable integration engine.

---

## 1. Identity Core: The Shadow Projection Model
The local datastore acts as the absolute authority for **application state, local authorization metadata, and permission policies**, but delegates credential verification and external user lifecycle execution to authoritative external identity contexts.

* **Local Identities:** For users native to Switchboard, the application must manage the full cryptographic lifecycle (utilizing modern salting and memory-hard hashing protocols such as Argon2id) directly inside the local store.
* **External Identities:** For users originating from external directories, the local application stores a "projection" of the identity (username, email, structural metadata, and assigned application roles). **No external account passwords or credential hashes may ever be stored, cached, or mirrored locally within the Switchboard database.**

---

## 2. Multi-Provider & Group Mapping Engine
The identity architecture must natively support a **one-to-many** configuration for external identity sources. The system cannot assume or be restricted to a single external directory server.

* **Provider Agnostic Connectors:** The backend must expose a generalized, pluggable interface to register multiple, concurrent external Identity Providers (IdPs)—such as independent LDAP servers, Active Directory domains, or upstream identity web-services.
* **Multi-Group Assignment Matrices:** Every registered IdP configuration must support the declaration of one or more external organizational groups.
* **Cumulative Resolution Rule (Most Lenient):** If an external user belongs to multiple groups that map to different local Switchboard roles, permissions are cumulative. If *any* of the user's mapped groups grant an access level of `GRANTED` for a module, that highest permission level wins.

---

## 3. Core Domain Workflows

### A. System Bootstrapping
* **State Evaluation:** On every initial initialization request, the application must inspect the user datastore.
* **Conditional Provisioning:** If the datastore is completely unpopulated, the system exposes a secure setup routine exclusively to provision the root administrator account.
* **Permanent Lockdown:** The exact millisecond that the initial root account transaction is successfully committed, the bootstrapping engine must completely self-terminate, forcing a `403 Forbidden` response on all future initialization requests.

### B. Onboarding & Flexible Credential Delivery
When an administrator provisions a user via the UI, they select the target directory authority (Local or a specific External IdP instance). The system must support three distinct onboarding pathways:

1. **SMTP Automated Loop:** The system generates a secure, time-bound onboarding token and automatically emails an invitation link via an external SMTP service (such as AWS SES).
2. **Manual Link Generation:** The system provisions the user and surfaces a secure onboarding URL directly to the administrator UI, allowing them to copy and deliver the link manually over secure out-of-band channels.
3. **One-Time Password (OTP):** The admin sets an explicit, temporary, one-time password. On the user's first login attempt with this OTP, the backend intercepts the session and forces an immediate redirect to a credential-rotation interface.

### C. The Completion & Write-Back Flow
When the user accesses their onboarding link to input profile data and establish their password:

* **For Local Users:** The backend hashes and writes the credential directly to the local store.
* **For External Users:** Switchboard securely binds to the designated authoritative IdP and executes a remote update operation to commit the user's password directly to that external directory.
* **Profile Synchronization:** Profile updates (e.g., email or name changes) initiated within the Switchboard user profile portal must write locally and simultaneously execute an external write-back routine to the authoritative IdP to keep both identity sources synchronized.

### D. Hybrid Directory Synchronization
The application must run a continuous, hybrid synchronization lifecycle to keep local shadow accounts accurate against external directories:

* **Just-In-Time (JIT) Sync:** The exact moment an external user authenticates at the login gate, the backend queries the authoritative IdP, updates local user metadata, and recalculates group permission maps immediately.
* **Background Polling (Cron Engine):** A background worker thread must periodically query active external IdPs to detect user deletions, disabled accounts, or group removals. If a user is stripped of a mapped group or disabled upstream, the background sync must instantly de-provision or suspend their local Switchboard session state.

---

## 4. In-Process Modular Policy Engine & Integration Deep-Dive

### A. Code Architecture: The Strategy Pattern
To prevent infrastructure bloat and minimize operational complexity, modules (e.g., Plex, Wireguard, Overseerr) are not implemented as isolated Docker microservices. Instead, they run within the main application process but remain completely decoupled from core logic, interacting strictly through a unified, in-process plugin framework.

Every module must implement a strict, common structural blueprint. This boundary forces uniform behavior across status checking, structural provisioning, and self-service routing by requiring the following core specifications:

* **Internal Identifiers:** Every module must declare a fixed unique identification string and a clean display name for the user interface.
* **Lifecycle & Configuration Enforcement:** Modules must provide routines to initialize their internal states on boot, validate incoming administrator settings before they are saved, and check operational health statuses (returning Healthy, Unhealthy, or Degraded).
* **Policy Trigger Hooks:** Modules must expose automated hooks that fire immediately when a user's access level transitions (executing provisioning actions when access is granted, or cleanup routines when access is revoked).
* **Unified Action Routine:** Modules must expose a single execution entry point that accepts a user identifier, a specific action string, and a flexible data payload to fulfill custom self-service requests.

### B. Schema Isolation: The JSONB Configuration Blueprint
Modules must never alter the core database structure or require dedicated SQL schema modifications when a new integration is enabled. To store module-specific configurations without polluting the primary database, the core engine leverages an isolated, unstructured configuration model:

* **Central Module Registry Store:** A generic repository mapping module identifiers to their respective system states and variables.
* **Isolated System Parameters:** Global configurations for a module (such as an external API endpoint or an encrypted bearer token) are saved inside a single database field utilizing a JSONB blob structure.
* **Isolated User Configurations:** Any configuration state native to a specific user within a module (such as a user-specific API key or provisioned device array) is stored in a centralized mapping store utilizing a similar JSONB architecture indexed strictly by user identifiers and module identifiers.
* **Runtime Verification:** When an admin saves a module's configuration, the module's validation logic parses and confirms the internal parameters (using validation schemas) before committing them to the JSONB field, protecting the core database from corrupted plugin configurations.

### C. Module Lifecycle States & Transitions
Every module's operational state is governed at the system level by an administrative configuration flag. The engine must evaluate this state before routing any pipeline commands:

* **Disabled State:** The module code is completely inactive. The engine blocks all access checking, drops all matching configuration properties from loading into memory, and rejects any client requests targeting the module with a strict 404 Not Found.
* **Enabled State:** The module executes its initialization routine during server boot. It loads its global configurations, starts its background health routines, and actively responds to the authorization engine.

### D. Module Permission Hierarchy & Visibility States
External application integrations are governed by a **Top-Down Override Chain** to calculate a user's access level:

1. **System-Wide Module Default:** Every module defines its own global default access state (e.g., Plex defaults to `GRANTED`, Wireguard defaults to `REQUESTABLE`).
2. **Role Overrides:** Local Switchboard roles explicitly overwrite the system default for any specific module.
3. **User Exceptions:** Explicit overrides assigned to an individual user account take absolute precedence over both system defaults and role configurations.

The calculated policy evaluates down to a strict three-state permission matrix:

* **`GRANTED` (Active Access):** The module is visible to the user and exposes operational controls. The user is authorized to execute commands against that module's integration handler.
* **`REQUESTABLE`:** The module is visible, but functionality is locked. The UI exposes a request mechanism that logs a pending access request for administrators. Upon admin approval, the user's state transitions to `GRANTED`, triggering the module's access hooks to provision downstream accounts or resources automatically.
* **`DENIED` (Hidden):** The module is completely omitted from the API payload. The client application must have zero structural awareness that the module exists. Any manual backend route penetration attempts to a `DENIED` module must throw a strict 404 or 403.

### E. Self-Service Operation Handlers & Provisioning Mechanics
Because each application integration serves a radically different infrastructure purpose, the core engine passes raw action commands directly into the module’s execution route. This allows individual modules to perform their own hyper-specific backend duties:

* **The Wireguard Handler:** When a user with a `GRANTED` policy clicks "Generate Profile," the core router hands the action payload over to the Wireguard module. The module programmatically communicates with the local Wireguard interface or network wrapper to compile a cryptographic keypair, register a new peer tunnel endpoint, construct a standard client configuration payload, and convert it to a Base64 QR-code string to return directly to the user's frontend layout on the fly.
* **The Plex Handler:** Translates user actions into downstream account validation. When access is granted, the module triggers its access hook to fire an API invitation request directly to the external Plex server API using the admin's encrypted access key, automatically adding the user's email to the managed server sharing list.
* **The Overseerr Handler:** Manages automatic provisioning profile syncing. It targets the external Overseerr endpoint to programmatically provision a user account match, map their corresponding permission profile flags, and surface an authenticated single-sign-on or deep-link token to their workspace dashboard view.

### F. Auditing & Diagnostic Routing
Modules are prohibited from printing unmonitored exceptions directly to system output or silent failure loops. 

* All internal module errors, manual provisioning executions, and self-service status transitions must be intercepted and piped directly into the core Switchboard auditing stream.
* Every explicit module action execution must submit a structured entry to the system audit logging engine tracking the user identifier, the module identifier, the type of action completed, and the infrastructure resolution status.

---

## 5. Security Boundaries & Infrastructure Guards

* **Session Isolation:** Authenticated states must issue stateless tokens stored strictly within secure, `HttpOnly`, `SameSite=Strict` cookies. Frontend client scripts must be structurally barred from reading session tokens.
* **Local Development Environment Defenses:** Configure all security and content policy headers defensively via middleware. For local loopback environments (`http://localhost`), the security middleware must explicitly disable automatic HTTPS upgrades to prevent background application fetch commands from throwing silent network errors.
* **Rate-Limiting Middleware:** Secure all entry, authentication, password-rotation, and verification endpoints behind a robust, memory-backed rate limiter to neutralize brute-force and credential-stuffing attacks.