# Admin Service

`admin-service` is a microservice responsible for privileged user management and administrative operations for the AIOutlet platform. It provides secure endpoints for admin users to manage user accounts, roles, and statuses across the platform.

**Architecture Pattern:** Publisher-only service (following Amazon's admin portal pattern)

- Admins take actions through API endpoints
- Publishes events for audit/notification (e.g., `admin.user.updated`, `admin.user.deleted`)
- Does NOT consume events - it's an action center, not an event responder

---

## Features

- List all users (admin only)
- View user details by ID
- Update user profile, roles, and status (activate/deactivate)
- Change user password (admin-initiated)
- Delete user accounts
- Publishes admin action events to message broker
- Robust input validation and error handling
- Structured logging for audit and traceability
- Forwards admin JWT to user-service for all privileged actions

---

## Architecture

This service is built with Node.js and Express, using Mongoose for MongoDB object modeling and Axios for inter-service communication with the user-service.

**Event-Driven Design:**

- **Publisher Only**: Emits events when admins perform actions
- **No Consumer**: Does not react to events from other services
- **Event Notifications**: Handled by notification-service and audit-service

The microservice is designed to be deployed independently and can run locally, via Docker, or in Kubernetes (AKS).

---

## Getting Started

### Prerequisites

- Node.js v16+
- MongoDB instance (local, Docker, or cloud)
- A running user-service instance (for user management APIs)
- Service runs on port **1003**
- Dapr HTTP port: **3503**, gRPC port: **50003**

### Environment Variables

Create a `.env` file in the root with the following variables:

```env
# .env.example for admin-service
PORT=1003
USER_SERVICE_URL=http://localhost:1002/api/users
USER_SERVICE_SECRET=your-shared-secret
DAPR_HTTP_PORT=3503
DAPR_GRPC_PORT=50003

```

---

## API Endpoints

- `GET /admin/users` — List all users
- `GET /admin/users/:id` — Get user by ID
- `PATCH /admin/users/:id` — Update user profile/roles/status
- `POST /admin/users/:id/password/change` — Change user password
- `DELETE /admin/users/:id` — Delete user account

All endpoints require a valid admin JWT in the `Authorization` header.

---

## Contributing

Contributions are welcome! Please open issues or submit pull requests.

---

## License

MIT License

---

## Contact

For questions or support, reach out to the AIOutlet dev team.
