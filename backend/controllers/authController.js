// ============================================
// Auth Controller
// ============================================

const bcrypt = require('bcryptjs');
const generateToken = require('../utils/generateToken');
const { getPool, isDatabaseConnected } = require('../config/db');
const mockStore = require('../utils/mockData');
const { logAudit } = require('../utils/auditLogger');

/**
 * POST /api/auth/login
 * Authenticate user and return JWT token.
 */
async function login(req, res) {
  try {
    const { email, password } = req.body;
    let user = null;

    if (isDatabaseConnected()) {
      const pool = getPool();
      const [rows] = await pool.execute('SELECT * FROM users WHERE email = ? AND is_active = true', [email]);
      user = rows[0];
    } else {
      user = mockStore.users.find((u) => u.email === email && u.is_active);
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.', code: 401 });
    }

    // Compare password with stored hash
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.', code: 401 });
    }

    const token = generateToken(user);

    res.json({
      success: true,
      message: 'Login successful.',
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department,
          phone: user.phone,
        },
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login.', code: 500 });
  }
}

/**
 * POST /api/auth/register
 * Register a new user (admin only in practice, but exposed for seeding).
 */
async function register(req, res) {
  try {
    const { name, email, password, role, department, phone } = req.body;

    // Check if user already exists
    let existing = null;
    if (isDatabaseConnected()) {
      const pool = getPool();
      const [rows] = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);
      existing = rows[0];
    } else {
      existing = mockStore.users.find((u) => u.email === email);
    }

    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already registered.', code: 400 });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);
    let newUser;

    if (isDatabaseConnected()) {
      const pool = getPool();
      const [result] = await pool.execute(
        'INSERT INTO users (name, email, password_hash, role, department, phone) VALUES (?, ?, ?, ?, ?, ?)',
        [name, email, password_hash, role || 'reporter', department || null, phone || null]
      );
      newUser = { id: result.insertId, name, email, role: role || 'reporter', department, phone };
    } else {
      const id = mockStore.getNextId('users');
      const now = new Date().toISOString();
      newUser = {
        id, name, email, password_hash, role: role || 'reporter',
        department: department || null, phone: phone || null,
        is_active: true, created_at: now, updated_at: now,
      };
      mockStore.users.push(newUser);
    }

    // Audit log for staff creation
    await logAudit({
      action: 'Staff Account Created',
      newValue: `${newUser.name} (${newUser.role})`,
      changedBy: req.user ? req.user.id : newUser.id,
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      data: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Server error during registration.', code: 500 });
  }
}

/**
 * GET /api/auth/me
 * Get current authenticated user profile.
 */
async function getMe(req, res) {
  try {
    let user = null;

    if (isDatabaseConnected()) {
      const pool = getPool();
      const [rows] = await pool.execute(
        'SELECT id, name, email, role, department, phone, is_active, created_at FROM users WHERE id = ?',
        [req.user.id]
      );
      user = rows[0];
    } else {
      const found = mockStore.users.find((u) => u.id === req.user.id);
      if (found) {
        const { password_hash, ...userWithoutPassword } = found;
        user = userWithoutPassword;
      }
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.', code: 404 });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    console.error('GetMe error:', error);
    res.status(500).json({ success: false, message: 'Server error.', code: 500 });
  }
}

/**
 * PUT /api/auth/update-profile
 * Update current user profile details.
 */
async function updateProfile(req, res) {
  try {
    const { name, email, department, phone } = req.body;
    const userId = req.user.id;

    // Check if email already taken by someone else
    let emailTaken = null;
    if (isDatabaseConnected()) {
      const pool = getPool();
      const [rows] = await pool.execute('SELECT id FROM users WHERE email = ? AND id != ?', [email, userId]);
      emailTaken = rows[0];
    } else {
      emailTaken = mockStore.users.find((u) => u.email === email && u.id !== userId);
    }

    if (emailTaken) {
      return res.status(400).json({ success: false, message: 'Email address is already in use by another account.', code: 400 });
    }

    if (isDatabaseConnected()) {
      const pool = getPool();
      await pool.execute(
        'UPDATE users SET name = ?, email = ?, department = ?, phone = ? WHERE id = ?',
        [name, email, department || null, phone || null, userId]
      );
    } else {
      const u = mockStore.users.find((u) => u.id === userId);
      if (!u) return res.status(404).json({ success: false, message: 'User not found.', code: 404 });
      u.name = name;
      u.email = email;
      u.department = department || null;
      u.phone = phone || null;
      u.updated_at = new Date().toISOString();
    }

    // Log audit
    await logAudit({
      action: 'Profile Details Updated',
      newValue: `Name: ${name}, Email: ${email}`,
      changedBy: userId,
    });

    res.json({ success: true, message: 'Profile details updated successfully.' });
  } catch (error) {
    console.error('UpdateProfile error:', error);
    res.status(500).json({ success: false, message: 'Server error.', code: 500 });
  }
}

/**
 * PUT /api/auth/change-password
 * Change current user password.
 */
async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;
    let user = null;

    if (isDatabaseConnected()) {
      const pool = getPool();
      const [rows] = await pool.execute('SELECT password_hash FROM users WHERE id = ?', [userId]);
      user = rows[0];
    } else {
      user = mockStore.users.find((u) => u.id === userId);
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.', code: 404 });
    }

    // Check password match
    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect.', code: 400 });
    }

    // Hash new password
    const password_hash = await bcrypt.hash(newPassword, 10);

    if (isDatabaseConnected()) {
      const pool = getPool();
      await pool.execute('UPDATE users SET password_hash = ? WHERE id = ?', [password_hash, userId]);
    } else {
      const u = mockStore.users.find((u) => u.id === userId);
      u.password_hash = password_hash;
      u.updated_at = new Date().toISOString();
    }

    // Log audit
    await logAudit({
      action: 'Password Changed',
      changedBy: userId,
    });

    res.json({ success: true, message: 'Password changed successfully.' });
  } catch (error) {
    console.error('ChangePassword error:', error);
    res.status(500).json({ success: false, message: 'Server error.', code: 500 });
  }
}

module.exports = { login, register, getMe, updateProfile, changePassword };
