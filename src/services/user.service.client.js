import axios from 'axios';

const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:5000';

/**
 * Fetch all users from the user-service as an admin.
 * Forwards the admin JWT for authentication.
 */
export const fetchAllUsers = async (adminToken) => {
  // Forward admin JWT to user-service for authentication
  const res = await axios.get(`${USER_SERVICE_URL}/api/admin/users`, {
    headers: {
      Authorization: `Bearer ${adminToken}`,
    },
  });
  return res.data;
};

/**
 * Fetch a single user by ID from the user-service.
 * Requires a valid admin or service JWT.
 */
export const fetchUserById = async (id, token) => {
  try {
    const res = await axios.get(`${USER_SERVICE_URL}/api/admin/users/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    // Log the error details for debugging
    console.error('Error fetching user by ID:', err.response?.data || err.message);
    throw err;
  }
};

/**
 * Update a user's profile, password, or activation by ID in the user-service.
 * Accepts a data object with fields to update (e.g., { name, password, isActive }).
 */
export const updateUserById = async (id, data, token) => {
  const res = await axios.patch(`${USER_SERVICE_URL}/api/admin/users/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

/**
 * Remove (delete) a user by ID in the user-service.
 */
export const removeUserById = async (id, token) => {
  const res = await axios.delete(`${USER_SERVICE_URL}/api/admin/users/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
