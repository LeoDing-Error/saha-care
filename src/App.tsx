// App.tsx is no longer used as the entry point.
// main.tsx mounts <AuthProvider> + <RouterProvider> directly.
// This file is kept as a thin re-export for backward compatibility
// (e.g. legacy tests that import from './App').
export { default } from './router/AppRouter';
