export const PATHS = {
  // Public Routes
  HOME: '/',
  ABOUT: '/about',
  COURSES: '/courses',
  PRIVACY: '/privacy',
  PROFILE: '/profile',
  LOGIN: '/login',
  REGISTER: '/register',

  // Student Routes
  ENROLLED_COURSES: '/student/enrolled-courses',
  STUDENT_UPCOMING: '/student/upcoming-sessions',
  STUDENT_SESSIONS: '/student/courses/:id/sessions',
  STUDENT_FILES: '/student/courses/:id/materials/files',
  STUDENT_QUIZEZ: '/student/courses/:id/materials/quizez',
  
  // Admin Routes
  ADMIN_LOGIN: '/admin/login',
  ADMIN_CALENDAR: '/admin/calendar',
  ADMIN_COURSES: '/admin/courses',
  ADMIN_UPCOMING: '/admin/upcoming-sessions',
  ADMIN_COURSE_STUDENTS: '/admin/courses/:id/students',
  ADMIN_COURSE_SESSIONS: '/admin/courses/:id/sessions',
  ADMIN_COURSE_MATERIALS: '/admin/courses/:id/materials',
  ADMIN_COURSE_FILES: '/admin/courses/:id/materials/files',
  ADMIN_COURSE_QUIZEZ: '/admin/courses/:id/materials/quizez'
};