// ============================================
// Deadline Helper
// ============================================
// Business logic for deadline status calculations.

/**
 * Check if a deadline is within N days from now.
 * @param {string|Date} deadline - The deadline date
 * @param {number} days - Number of days threshold
 * @returns {boolean}
 */
function isWithinDays(deadline, days) {
  const deadlineDate = new Date(deadline);
  const now = new Date();
  const diffMs = deadlineDate.getTime() - now.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays >= 0 && diffDays <= days;
}

/**
 * Check if a deadline has passed.
 * @param {string|Date} deadline
 * @returns {boolean}
 */
function isOverdue(deadline) {
  return new Date(deadline) < new Date();
}

/**
 * Determine the deadline urgency label.
 * @param {Object} assignment - Assignment object with status, priority, publication_deadline
 * @returns {string|null} 'overdue', 'urgent', 'near_deadline', or null
 */
function getDeadlineUrgency(assignment) {
  if (assignment.status === 'Completed' || assignment.status === 'Archived') return null;

  if (isOverdue(assignment.publication_deadline)) return 'overdue';
  if (assignment.priority === 'High' && isWithinDays(assignment.publication_deadline, 3)) return 'urgent';
  if (isWithinDays(assignment.publication_deadline, 2)) return 'near_deadline';

  return null;
}

/**
 * Check if a staff member is overloaded (more than 5 active assignments).
 * @param {number} activeCount - Number of active assignments
 * @returns {boolean}
 */
function isStaffOverloaded(activeCount) {
  return activeCount > 5;
}

/**
 * Calculate completion percentage.
 * @param {number} completed - Number of completed assignments
 * @param {number} total - Total assignments
 * @returns {number} Percentage (0-100)
 */
function calcCompletionPercentage(completed, total) {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

module.exports = {
  isWithinDays,
  isOverdue,
  getDeadlineUrgency,
  isStaffOverloaded,
  calcCompletionPercentage,
};
