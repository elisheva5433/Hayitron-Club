import { getAllUsers } from '../services/userService.js';

export function adminUsersController(req, res) {
  res.json({ users: getAllUsers() });
}
