import mongoose from 'mongoose';

const ALLOWED_ROLES = ['user', 'admin', 'customer'];
const ALLOWED_UPDATE_FIELDS = [
  'firstName',
  'lastName',
  'name',
  'email',
  'roles',
  'isActive',
  'password',
  'phoneNumber',
];

const adminValidator = {
  isValidObjectId(id) {
    return mongoose.Types.ObjectId.isValid(id);
  },
  isValidRoles(roles) {
    if (!Array.isArray(roles)) return false;
    return roles.every((role) => typeof role === 'string' && ALLOWED_ROLES.includes(role));
  },
  isValidIsActive(val) {
    return typeof val === 'boolean';
  },
  isValidEmail(email) {
    if (typeof email !== 'string') return false;
    return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
  },
  isValidPassword(password) {
    if (typeof password !== 'string' || password.length < 8) return false;
    return /[A-Za-z]/.test(password) && /[0-9]/.test(password);
  },
  isValidUpdatePayload(payload) {
    if (typeof payload !== 'object' || !payload) return false;
    return Object.keys(payload).every((field) => ALLOWED_UPDATE_FIELDS.includes(field));
  },
};

export default adminValidator;
