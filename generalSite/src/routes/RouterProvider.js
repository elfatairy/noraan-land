import { Suspense } from 'react';
import { createBrowserRouter, RouterProvider as ReactRouterProvider } from 'react-router-dom';
import { routes } from './routes';

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
  </div>
);

export const RouterProvider = () => {
  const router = createBrowserRouter(routes);

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ReactRouterProvider router={router} />
    </Suspense>
  );
};