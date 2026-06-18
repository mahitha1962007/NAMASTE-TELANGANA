-- ============================================
-- Editorial Content Calendar & Publication Planner
-- Seed Data for MySQL
-- ============================================
-- NOTE: Passwords here are bcrypt hashes.
-- Admin@123 => $2b$10$8K1p/a0dR1xqM8K1p0dR1OeQZkIqC5F5T2N5F3V6J7M8K1p0dR1u
-- Staff@123 => $2b$10$8K1p/a0dR1xqM8K1p0dR1OeQZkIqC5F5T2N5F3V6J7M8K1p0dR1v
--
-- IMPORTANT: For production, use the backend seed.js script which
-- generates proper bcrypt hashes at runtime. These hashes are
-- placeholders for reference only. Use the migrations/seed.js script.
-- ============================================

-- USE editorial_content_planner;

-- -------------------------------------------
-- Seed Users
-- Use the backend seed.js script for proper password hashing
-- -------------------------------------------
-- The following INSERT statements use placeholder hashes.
-- Run `node backend/migrations/seed.js` instead for proper hashes.

INSERT INTO users (name, email, password_hash, role, department, phone, is_active) VALUES
('Admin User', 'admin@example.com', '$2b$10$placeholder_hash_for_admin', 'admin', 'Management', '9876543210', true),
('Ravi Kumar', 'reporter@example.com', '$2b$10$placeholder_hash_for_staff', 'reporter', 'News Desk', '9876543211', true),
('Kiran Reddy', 'photographer@example.com', '$2b$10$placeholder_hash_for_staff', 'photographer', 'Media', '9876543212', true),
('Anjali Sharma', 'editor@example.com', '$2b$10$placeholder_hash_for_staff', 'editor', 'Editorial', '9876543213', true),
('Suresh Babu', 'interviewer@example.com', '$2b$10$placeholder_hash_for_staff', 'interviewer', 'News Desk', '9876543214', true);

-- -------------------------------------------
-- Seed Assignments
-- -------------------------------------------
INSERT INTO assignments (title, description, category, content_type, priority, status, publication_deadline, instructions, created_by) VALUES
('Telangana Education Policy Update', 'Cover the new education policy announcement by the state government.', 'Politics', 'News Article', 'High', 'Assigned', DATE_ADD(CURDATE(), INTERVAL 5 DAY), 'Interview the Education Minister. Get photos at the press conference. Draft article by deadline.', 1),
('Hyderabad Metro Expansion Report', 'Detailed report on metro line expansion plans for Hyderabad.', 'Infrastructure', 'Feature Story', 'Medium', 'In Progress', DATE_ADD(CURDATE(), INTERVAL 7 DAY), 'Visit the construction site. Interview HMRL officials. Include before/after photos.', 1),
('Bathukamma Festival Coverage', 'Annual Bathukamma festival cultural coverage across Telangana.', 'Culture', 'Photo Story', 'High', 'Assigned', DATE_ADD(CURDATE(), INTERVAL 3 DAY), 'Capture celebrations in at least 3 districts. Interview participants.', 1),
('Farmers Market Feature', 'Weekly farmers market feature highlighting local produce and vendors.', 'Agriculture', 'Video Story', 'Low', 'Completed', DATE_SUB(CURDATE(), INTERVAL 2 DAY), 'Film interviews with 5 vendors. Get drone shots of the market.', 1),
('IT Hub Growth Analysis', 'Analysis of IT sector growth in Hyderabad financial district.', 'Business', 'News Article', 'Medium', 'Delayed', DATE_SUB(CURDATE(), INTERVAL 1 DAY), 'Get statistics from STPI. Interview 3 IT company executives.', 1);

-- -------------------------------------------
-- Seed Assignment Members
-- -------------------------------------------
INSERT INTO assignment_members (assignment_id, user_id, role_in_assignment, assigned_by) VALUES
(1, 2, 'reporter', 1),
(1, 5, 'interviewer', 1),
(1, 3, 'photographer', 1),
(1, 4, 'editor', 1),
(2, 2, 'reporter', 1),
(2, 3, 'photographer', 1),
(2, 4, 'editor', 1),
(3, 2, 'reporter', 1),
(3, 3, 'photographer', 1),
(3, 4, 'editor', 1),
(4, 2, 'reporter', 1),
(4, 3, 'photographer', 1),
(5, 2, 'reporter', 1),
(5, 4, 'editor', 1);

-- -------------------------------------------
-- Seed Events
-- -------------------------------------------
INSERT INTO events (assignment_id, event_type, title, event_date, location, assigned_to, status) VALUES
(1, 'Interview', 'Interview: Education Minister', DATE_ADD(CURDATE(), INTERVAL 2 DAY), 'Secretariat, Hyderabad', 5, 'Scheduled'),
(1, 'Photo Shoot', 'Photos: Education Policy Press Conference', DATE_ADD(CURDATE(), INTERVAL 3 DAY), 'Press Club, Hyderabad', 3, 'Scheduled'),
(1, 'Publication Deadline', 'Publish: Education Policy Update', DATE_ADD(CURDATE(), INTERVAL 5 DAY), NULL, 4, 'Scheduled'),
(2, 'Interview', 'Interview: HMRL Officials', DATE_ADD(CURDATE(), INTERVAL 1 DAY), 'HMRL Office', 2, 'Scheduled'),
(2, 'Photo Shoot', 'Photos: Metro Construction Site', DATE_ADD(CURDATE(), INTERVAL 4 DAY), 'Raidurg Metro Station', 3, 'Scheduled'),
(2, 'Publication Deadline', 'Publish: Metro Expansion Report', DATE_ADD(CURDATE(), INTERVAL 7 DAY), NULL, 4, 'Scheduled'),
(3, 'Photo Shoot', 'Photos: Bathukamma Celebrations', DATE_ADD(CURDATE(), INTERVAL 1 DAY), 'Tank Bund, Hyderabad', 3, 'Scheduled'),
(3, 'Publication Deadline', 'Publish: Bathukamma Coverage', DATE_ADD(CURDATE(), INTERVAL 3 DAY), NULL, 4, 'Scheduled');

-- -------------------------------------------
-- Seed Notifications
-- -------------------------------------------
INSERT INTO notifications (user_id, assignment_id, message, type, is_read) VALUES
(2, 1, 'You have been assigned as Reporter for "Telangana Education Policy Update"', 'new_assignment', false),
(5, 1, 'You have been assigned as Interviewer for "Telangana Education Policy Update"', 'new_assignment', false),
(3, 1, 'You have been assigned as Photographer for "Telangana Education Policy Update"', 'new_assignment', false),
(4, 1, 'You have been assigned as Editor for "Telangana Education Policy Update"', 'new_assignment', false),
(2, 3, 'Deadline approaching: "Bathukamma Festival Coverage" is due in 3 days', 'deadline_near', false),
(1, 5, 'Assignment "IT Hub Growth Analysis" is overdue', 'deadline_overdue', false);

-- -------------------------------------------
-- Seed Audit Logs
-- -------------------------------------------
INSERT INTO audit_logs (assignment_id, action, old_value, new_value, changed_by) VALUES
(1, 'Assignment Created', NULL, 'Telangana Education Policy Update', 1),
(2, 'Assignment Created', NULL, 'Hyderabad Metro Expansion Report', 1),
(3, 'Assignment Created', NULL, 'Bathukamma Festival Coverage', 1),
(4, 'Assignment Created', NULL, 'Farmers Market Feature', 1),
(5, 'Assignment Created', NULL, 'IT Hub Growth Analysis', 1),
(2, 'Status Changed', 'Assigned', 'In Progress', 1),
(4, 'Status Changed', 'In Progress', 'Completed', 1),
(5, 'Status Changed', 'Assigned', 'Delayed', 1);
