/**
 * API Configuration for backend endpoints
 */

// Base URL for backend API calls
export const API_BASE_URL = '/Attendance_Project/attendify-charusat/backend-php';

// Individual API endpoints
export const API_ENDPOINTS = {
  INSERT_ATTENDANCE: `${API_BASE_URL}/insert_attendance.php`, // Back to real endpoint
  TEST_PHP: `${API_BASE_URL}/test.php`,
  ADD_TEACHER: `${API_BASE_URL}/add_teacher.php`,
  REMOVE_TEACHER: `${API_BASE_URL}/remove_teacher.php`,
  TEACHER_LOGIN: `${API_BASE_URL}/teacher_login.php`,
  GET_TEACHERS_COUNT: `${API_BASE_URL}/get_teachers_count.php`,
  GET_ATTENDANCE: `${API_BASE_URL}/get_attendance.php`,
  REMOVE_ATTENDANCE: `${API_BASE_URL}/remove_attendance.php`,
  DELETE_ATTENDANCE_BULK: `${API_BASE_URL}/delete_attendance_bulk.php`,
  ADD_STUDENT: `${API_BASE_URL}/add_student.php`,
  REMOVE_STUDENT: `${API_BASE_URL}/remove_student.php`,
  GET_STUDENTS_COUNT: `${API_BASE_URL}/get_students_count.php`,
  GET_STUDENTS_LIST: `${API_BASE_URL}/get_students_list.php`,
  GET_TEACHERS_LIST: `${API_BASE_URL}/get_teachers_list.php`,
};

// Helper function to get full API URL
export const getApiUrl = (endpoint: string): string => {
  return `${API_BASE_URL}/${endpoint}`;
};
