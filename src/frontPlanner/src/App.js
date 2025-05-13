import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { useContext } from 'react';
import { ToastContainer } from 'react-toastify';

// Импорт доп.функционала
import { ROUTES_FOR_NOT_AUTH, ROUTES_FOR_AUTH } from './routes/Routes';

// Импорт контекстов
import { socket, SocketContext } from './contexts/socket.context';
import { authContext } from './contexts/auth.context';
import { HistoryProvider } from './contexts/history.context';

// Импорт стилей
import 'react-toastify/dist/ReactToastify.css';

export default function App() {
    const { authState } = useContext(authContext);

    // const router = createBrowserRouter([
    //     ...(!auth?.data || Object.keys(auth?.data).length === 0 ? ROUTES_FOR_NOT_AUTH : []),
    //     ...ROUTES_FOR_AUTH
    // ]);

    const router = createBrowserRouter([...(!authState.accessToken ? ROUTES_FOR_NOT_AUTH : []), ...ROUTES_FOR_AUTH]);

    return (
        <SocketContext.Provider value={socket}>
            <HistoryProvider>
                <RouterProvider router={router} />
                <ToastContainer />
            </HistoryProvider>
        </SocketContext.Provider>
    );
}
