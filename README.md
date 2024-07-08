# PCD Protagoniza Cultura

This project contains all the necessary boilerplate to setup a multi-tenant SaaS with Next.js including authentication and RBAC authorization.

## Features

### Authentication

- [ ] It should be able to authenticate using e-mail & password;
- [ ] It should be able to authenticate using Github account;
- [ ] It should be able to recover password using e-mail;
- [x] It should be able to create an account (e-mail, name and password);

### Organizations

- [ ] It should be able to create a new organization;
- [ ] It should be able to get organizations to which the user belongs;
- [ ] It should be able to update an organization;
- [ ] It should be able to shutdown an organization;
- [ ] It should be able to transfer organization ownership;

### Invites

- [ ] It should be able to invite a new candidate (e-mail, role);
- [ ] It should be able to accept an invite;
- [ ] It should be able to revoke a pending invite;

### Members

- [ ] It should be able to get organization members;
- [ ] It should be able to update a candidate role;

### Projects

- [ ] It should be able to get projects within a organization;
- [ ] It should be able to create a new project (name, url, description);
- [ ] It should be able to update a project (name, url, description);
- [ ] It should be able to delete a project;

### Billing

- [ ] It should be able to get billing details for organization ($20 per project / $10 per candidate excluding billing role);

## RBAC

Roles & permissions.

### Roles

- Owner (count as business)
- Administrator
- Candidate
- Business
- Anonymous

### Permissions table

|                       | Administrator | Candidate | Business | Anonymous |
| --------------------- | ------------- | --------- | -------- | --------- |
| Create organization   | ✅            | ❌        | ✅       | ❌        |
| Update organization   | ✅            | ❌        | ✅       | ❌        |
| Delete organization   | ✅            | ❌        | ✅       | ❌        |
| Invite a candidate    | ✅            | ❌        | ❌       | ❌        |
| Revoke an invite      | ✅            | ❌        | ✅       | ❌        |
| List Candidates       | ✅            | ✅        | ✅       | ❌        |
| Transfer ownership    | ❌            | ❌        | ❌       | ❌        |
| Update candidate role | ✅            | ❌        | ❌       | ❌        |
| Delete candidate      | ✅            | ⚠️        | ❌       | ❌        |
| List projects         | ✅            | ✅        | ✅       | ❌        |
| Create a new project  | ✅            | ❌        | ✅       | ❌        |
| Update a project      | ✅            | ❌        | ✅       | ❌        |
| Delete a project      | ✅            | ❌        | ✅       | ❌        |

> ✅ = allowed
> ❌ = not allowed
> ⚠️ = allowed w/ conditions

#### Conditions

- Only owners may transfer organization ownership;
- Only administrators and project authors may update/delete the project;
- Candidates can leave their own apllies;
