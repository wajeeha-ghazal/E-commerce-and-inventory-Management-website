import React, { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './app/router';
import { useAppDispatch } from './app/hooks';
import { fetchMe } from './features/auth/authSlice';

export const App: React.FC = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Restore session on app boot from httpOnly cookie
    dispatch(fetchMe());
  }, [dispatch]);

  return <RouterProvider router={router} />;
};

export default App;
