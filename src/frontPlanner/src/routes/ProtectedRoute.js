import { useContext, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

// import { authContext } from '../contexts/AuthContext';
import { authContext } from '../contexts/auth.context';

export default function ProtectedRoute() {
    const { authState } = useContext(authContext);
    console.log(`authState: ${JSON.stringify(authState, null, 4)}`);
    // return <Outlet />;
    return authState.accessToken ? <Outlet /> : <Navigate to="auth" />;
}
