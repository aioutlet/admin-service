import { invokeService } from './dapr.service.client.js';

const USER_SERVICE_APP_ID = 'user-service';

/**
 * Fetch all users from the user-service as an admin.
 * Forwards the admin JWT for authentication via Dapr service invocation.
 */
export const fetchAllUsers = async (adminToken) => {
  const metadata = {
    headers: {
      Authorization: `Bearer ${adminToken}`,
    },
  };

  return await invokeService(USER_SERVICE_APP_ID, 'api/admin/users', 'GET', null, metadata);
};

/**
 * Fetch a single user by ID from the user-service.
 * Requires a valid admin or service JWT.
 */
export const fetchUserById = async (id, token) => {
  try {
    const metadata = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    return await invokeService(USER_SERVICE_APP_ID, `api/admin/users/${id}`, 'GET', null, metadata);
  } catch (err) {
    // Log the error details for debugging
    console.error('Error fetching user by ID:', err.message);
    throw err;
  }
};

/**
 * Update a user's profile, password, or activation by ID in the user-service.
 * Accepts a data object with fields to update (e.g., { name, password, isActive }).
 */
export const updateUserById = async (id, data, token) => {
  const metadata = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  return await invokeService(USER_SERVICE_APP_ID, `api/admin/users/${id}`, 'PATCH', data, metadata);
};

/**
 * Remove (delete) a user by ID in the user-service.
 */
export const removeUserById = async (id, token) => {
  const metadata = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  return await invokeService(USER_SERVICE_APP_ID, `api/admin/users/${id}`, 'DELETE', null, metadata);
};
