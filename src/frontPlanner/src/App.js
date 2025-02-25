import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { useContext } from 'react';

// Импорт доп.функционала
import { ROUTES_FOR_NOT_AUTH, ROUTES_FOR_AUTH } from './routes/Routes';
import { authContext } from './contexts/auth.context';

export default function App() {
    const { authState } = useContext(authContext);

    // const router = createBrowserRouter([
    //     ...(!auth?.data || Object.keys(auth?.data).length === 0 ? ROUTES_FOR_NOT_AUTH : []),
    //     ...ROUTES_FOR_AUTH
    // ]);

    // const router = createBrowserRouter([...(!authState.accessToken ? ROUTES_FOR_NOT_AUTH : []), ...ROUTES_FOR_AUTH]);
    const router = createBrowserRouter([...ROUTES_FOR_AUTH]);
    return <RouterProvider router={router} />;
}
