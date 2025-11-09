import * as userService from '../../src/services/user.service.client.js';
import * as daprClient from '../../src/services/dapr.client.js';

// Mock dependencies
jest.mock('../../src/services/dapr.client.js');

describe('user.service.client', () => {
  const mockToken = 'test_token';
  const userId = 'user123';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchAllUsers', () => {
    it('should fetch all users with admin token', async () => {
      const mockUsers = [
        { id: '1', email: 'user1@test.com' },
        { id: '2', email: 'user2@test.com' },
      ];
      daprClient.invokeService.mockResolvedValue(mockUsers);

      const result = await userService.fetchAllUsers(mockToken);

      expect(daprClient.invokeService).toHaveBeenCalledWith(
        'user-service',
        'api/admin/users',
        'GET',
        null,
        {
          headers: {
            Authorization: `Bearer ${mockToken}`,
          },
        }
      );
      expect(result).toEqual(mockUsers);
    });
  });

  describe('fetchUserById', () => {
    it('should fetch user by ID with token', async () => {
      const mockUser = { id: userId, email: 'user@test.com' };
      daprClient.invokeService.mockResolvedValue(mockUser);

      const result = await userService.fetchUserById(userId, mockToken);

      expect(daprClient.invokeService).toHaveBeenCalledWith(
        'user-service',
        `api/admin/users/${userId}`,
        'GET',
        null,
        {
          headers: {
            Authorization: `Bearer ${mockToken}`,
          },
        }
      );
      expect(result).toEqual(mockUser);
    });

    it('should log and rethrow error on failure', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const error = new Error('Service error');
      daprClient.invokeService.mockRejectedValue(error);

      await expect(userService.fetchUserById(userId, mockToken)).rejects.toThrow('Service error');

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching user by ID:', 'Service error');
      consoleErrorSpy.mockRestore();
    });
  });

  describe('updateUserById', () => {
    it('should update user with provided data', async () => {
      const updateData = { firstName: 'John', lastName: 'Doe' };
      const mockUpdatedUser = { id: userId, ...updateData };
      daprClient.invokeService.mockResolvedValue(mockUpdatedUser);

      const result = await userService.updateUserById(userId, updateData, mockToken);

      expect(daprClient.invokeService).toHaveBeenCalledWith(
        'user-service',
        `api/admin/users/${userId}`,
        'PATCH',
        updateData,
        {
          headers: {
            Authorization: `Bearer ${mockToken}`,
          },
        }
      );
      expect(result).toEqual(mockUpdatedUser);
    });
  });

  describe('removeUserById', () => {
    it('should delete user by ID', async () => {
      daprClient.invokeService.mockResolvedValue();

      await userService.removeUserById(userId, mockToken);

      expect(daprClient.invokeService).toHaveBeenCalledWith(
        'user-service',
        `api/admin/users/${userId}`,
        'DELETE',
        null,
        {
          headers: {
            Authorization: `Bearer ${mockToken}`,
          },
        }
      );
    });
  });
});
