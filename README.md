# PCD Protagoniza Cultura

## Features

### Authentication

- [ ] It should be able to authenticate using e-mail & password;
- [ ] It should be able to authenticate using Gmail account;
- [ ] It should be able to recover password using e-mail;
- [x] It should be able to create an account (e-mail, name and password);

### Organizations

- [ ] It should be able to create a new organization;
- [ ] It should be able to get organizations to which the user belongs;
- [ ] It should be able to update an organization;

### Projects

- [ ] It should be able to get projects within a organization;
- [ ] It should be able to create a new project (name, url, description);
- [ ] It should be able to update a project (name, url, description);
- [ ] It should be able to delete a project;

## RBAC

Roles & permissions.

### Roles

- Owner (count as business)
- Administrator
- Candidate
- Business
- Anonymous

### Permissions table

|                      | Administrator | Candidate | Business | Anonymous |
| -------------------- | ------------- | --------- | -------- | --------- |
| Create organization  | ✅            | ❌        | ✅       | ❌        |
| Update organization  | ✅            | ❌        | ✅       | ❌        |
| Delete organization  | ✅            | ❌        | ✅       | ❌        |
| Revoke an invite     | ✅            | ❌        | ✅       | ❌        |
| List Candidates      | ✅            | ❌        | ✅       | ❌        |
| Update user role     | ✅            | ❌        | ❌       | ❌        |
| Delete candidate     | ✅            | ⚠️        | ❌       | ❌        |
| List projects        | ❌            | ✅        | ❌       | ❌        |
| Create Applications  | ❌            | ✅        | ❌       | ❌        |
| Get Applications     | ❌            | ✅        | ❌       | ❌        |
| Delete Applications  | ❌            | ✅        | ❌       | ❌        |
| Create a new project | ✅            | ❌        | ✅       | ❌        |
| Update a project     | ✅            | ❌        | ✅       | ❌        |
| Delete a project     | ✅            | ❌        | ✅       | ❌        |

> ✅ = allowed
> ❌ = not allowed
> ⚠️ = allowed w/ conditions

#### Conditions

- Only owners may transfer organization ownership;
- Only administrators and project authors may update/delete the project;
- Candidates can leave their own apllies;
