import { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import { PATHS } from './paths';
import { ProtectedRoute } from './ProtectedRoute';

// Lazy load layouts
const PublicLayout = lazy(() => import('../pages/public/layout/Layout'));
const StudentLayout = lazy(() => import('../pages/student/layout/Layout'));

// Lazy load public pages
const Home = lazy(() => import('../pages/public/home/home'));
const About = lazy(() => import('../pages/public/about/about'));
const Courses = lazy(() => import('../pages/public/courses/courses'));
const Pricing = lazy(() => import('../pages/public/pricing/pricing'));
const Login = lazy(() => import('../pages/public/login/login'));
const Register = lazy(() => import('../pages/public/register/register'));

// Lazy load student pages
const EnrolledCourses = lazy(() => import('../pages/student/enrolledCourses/enrolledCourses'));
const StudentUpcomingSessions = lazy(() => import('../pages/student/upcomingSessions/upcomingSessions'));
const StudentSessions = lazy(() => import('../pages/student/sessions/sessions'));
const StudentFiles = lazy(() => import('../pages/student/files/files'));
const StudentQuizez = lazy(() => import('../pages/student/quizez/quizez'));

export const routes = [
  {
    element: <PublicLayout />,
    children: [
      { path: PATHS.HOME, element: <Home /> },
      { path: PATHS.ABOUT, element: <About /> },
      { path: PATHS.COURSES, element: <Courses /> },
      { path: PATHS.PRICING, element: <Pricing /> },
      { path: PATHS.LOGIN, element: <Login /> },
      { path: PATHS.REGISTER, element: <Register /> },
    ],
  },
  {
    path: '/student',
    element: (
      <ProtectedRoute role="student">
        <StudentLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: 'enrolled-courses', element: <EnrolledCourses /> },
      { path: 'upcoming-sessions', element: <StudentUpcomingSessions /> },
      { path: 'courses/:id/sessions', element: <StudentSessions /> },
      { 
        path: 'courses/:id/materials',
        children: [
          { path: 'files', element: <StudentFiles /> },
          { path: 'quizez', element: <StudentQuizez /> }
        ]
      },
      { path: '', element: <Navigate to="/student/upcoming-sessions" replace /> },
    ],
  },
  {
    path: '*',
    element: <Navigate to={PATHS.HOME} replace />,
  },
];