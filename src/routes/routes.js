import { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import { PATHS } from './paths';
import { ProtectedRoute } from './ProtectedRoute';

// Lazy load layouts
const AdminLayout = lazy(() => import('../pages/admin/layout/Layout'));
// Lazy load admin pages
const AdminLogin = lazy(() => import('../pages/admin/login/login'));
const AdminCalendar = lazy(() => import('../pages/admin/calender/calender'));
const CoursesManagement = lazy(() => import('../pages/admin/coursesManagment/coursesManagment'));
const Students = lazy(() => import('../pages/admin/students/students'));
const Sessions = lazy(() => import('../pages/admin/sessions/sessions'));
const Materials = lazy(() => import('../pages/admin/materials/materials'));
const Quizez = lazy(() => import('../pages/admin/quizez/quizez'));
const Files = lazy(() => import('../pages/admin/files/files'));
const UpcomingSessions = lazy(() => import('../pages/admin/upcomingSessions/upcomingSessions'));

export const routes = [
  {
    path: '/admin',
    element: (
      <ProtectedRoute role="admin">
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: 'login', element: <AdminLogin /> },
      { path: 'calendar', element: <AdminCalendar /> },
      { 
        path: 'courses',
        children: [
          { path: '', element: <CoursesManagement /> },
          { 
            path: ':id',
            children: [
              { path: 'students', element: <Students /> },
              { path: 'sessions', element: <Sessions /> },
              { 
                path: 'materials',
                children: [
                  { path: '', element: <Materials /> },
                  { path: 'files', element: <Files /> },
                  { path: 'quizez', element: <Quizez /> },
                ]
              },
            ]
          }
        ]
      },
      { path: 'upcoming-sessions', element: <UpcomingSessions /> },
      { path: '', element: <Navigate to="/admin/upcoming-sessions" replace /> },
    ],
  },
  {
    path: '*',
    element: <Navigate to='/admin/login' replace />,
  },
];