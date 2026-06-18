-- ============================================
-- Editorial Content Calendar & Publication Planner
-- Database Schema for MySQL
-- ============================================


-- -------------------------------------------
-- Users table
-- Stores admins and all staff functional roles
-- -------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin','reporter','interviewer','photographer','editor','video_editor','social_media_manager','publication_manager') NOT NULL,
  department VARCHAR(100),
  phone VARCHAR(20),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------------------------
-- Assignments table
-- Core editorial story/task records
-- -------------------------------------------
CREATE TABLE IF NOT EXISTS assignments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  content_type VARCHAR(100),
  priority ENUM('Low','Medium','High') DEFAULT 'Medium',
  status ENUM('Assigned','In Progress','Completed','Delayed','Archived') DEFAULT 'Assigned',
  publication_deadline DATETIME NOT NULL,
  instructions TEXT,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------------------------
-- Assignment Members table
-- Maps staff to assignments with their role
-- -------------------------------------------
CREATE TABLE IF NOT EXISTS assignment_members (
  id INT AUTO_INCREMENT PRIMARY KEY,
  assignment_id INT NOT NULL,
  user_id INT NOT NULL,
  role_in_assignment VARCHAR(50) NOT NULL,
  assigned_by INT,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------------------------
-- Events table
-- Calendar events tied to assignments
-- -------------------------------------------
CREATE TABLE IF NOT EXISTS events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  assignment_id INT NOT NULL,
  event_type ENUM('Interview','Photo Shoot','Draft Deadline','Review','Publication Deadline') NOT NULL,
  title VARCHAR(200) NOT NULL,
  event_date DATETIME NOT NULL,
  location VARCHAR(200),
  assigned_to INT,
  status ENUM('Scheduled','Completed','Cancelled','Overdue') DEFAULT 'Scheduled',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------------------------
-- Notifications table
-- Alerts for individual users
-- -------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  assignment_id INT,
  message TEXT NOT NULL,
  type VARCHAR(50),
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------------------------
-- Audit Logs table
-- Tracks all important actions
-- -------------------------------------------
CREATE TABLE IF NOT EXISTS audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  assignment_id INT,
  action VARCHAR(100),
  old_value TEXT,
  new_value TEXT,
  changed_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE SET NULL,
  FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------------------------
-- Task Notes table
-- Progress notes by staff on assignments
-- -------------------------------------------
CREATE TABLE IF NOT EXISTS task_notes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  assignment_id INT NOT NULL,
  user_id INT NOT NULL,
  note TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------------------------
-- Indexes for performance
-- -------------------------------------------
CREATE INDEX idx_assignments_status ON assignments(status);
CREATE INDEX idx_assignments_priority ON assignments(priority);
CREATE INDEX idx_assignments_deadline ON assignments(publication_deadline);
CREATE INDEX idx_assignment_members_assignment ON assignment_members(assignment_id);
CREATE INDEX idx_assignment_members_user ON assignment_members(user_id);
CREATE INDEX idx_events_date ON events(event_date);
CREATE INDEX idx_events_assignment ON events(assignment_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_audit_logs_assignment ON audit_logs(assignment_id);
CREATE INDEX idx_task_notes_assignment ON task_notes(assignment_id);
