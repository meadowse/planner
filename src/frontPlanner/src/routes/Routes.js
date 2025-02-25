import { lazy, Suspense } from 'react';
import { Navigate, defer } from 'react-router-dom';

// Импорт компонетов
import ProtectedRoute from './ProtectedRoute';
import UserInfo from '@components/pages/data_user/UserInfo';
import Layout from '@components/layout/Layout';
import Authentication from '../authentication/Authentication';
import Preloader from '@components/auxiliary_pages/loader/Preloader';

// Импорт сервисов
import DataDisplayService from '@services/data_display.service';

const DataDisplayPage = lazy(() => import('@components/pages/data_display/DataDisplayPage'));
const DataForm = lazy(() => import('@components/pages/data_display/data_form/DataForm'));
const TasksPage = lazy(() => import('@components/pages/tasks/TasksPage'));
const ChatPage = lazy(() => import('@components/pages/chat/ChatPage'));

// Маршруты для пользователей, которые не зарегестрированы
const ROUTES_FOR_NOT_AUTH = [
    {
        path: '/auth',
        element: <Authentication />
    }
];

// Маршруты для пользователей, которые зарегестрировались
const ROUTES_FOR_AUTH = [
    {
        path: '/',
        element: <ProtectedRoute />,
        children: [
            // {
            //     path: '/auth',
            //     element: <Authentication />
            // },
            {
                path: '',
                element: <Layout />,
                children: [
                    {
                        index: true,
                        element: <Navigate to="/department/" replace />
                    },
                    {
                        path: 'department/*',
                        // loader: () => {
                        //     return defer({ department: DataDisplayService.loadData() });
                        // },
                        loader: () => {
                            return defer({ uploadedData: DataDisplayService.loadData('department') });
                        },
                        shouldRevalidate: () => false,
                        element: (
                            <Suspense fallback={<Preloader />}>
                                {/* <DataDisplayPage additClass="department" /> */}
                                <DataDisplayPage partition="department" additClass="department" />
                            </Suspense>
                        )
                    },
                    {
                        path: 'equipment/*',
                        // loader: () => {
                        //     return defer({ equipment: EquipmentService.loadData() });
                        // },
                        loader: () => {
                            return defer({ uploadedData: DataDisplayService.loadData('equipment') });
                        },
                        shouldRevalidate: () => false,
                        element: (
                            <Suspense fallback={<Preloader />}>
                                <DataDisplayPage partition="equipment" additClass="equipment" />
                                {/* <EquipmentPage additClass="equipment" /> */}
                            </Suspense>
                        )
                    },
                    {
                        path: 'company/*',
                        // loader: () => {
                        //     return defer({
                        //         structure: CompanyService.loadData('structure'),
                        //         employees: CompanyService.loadData('employees')
                        //     });
                        // },
                        loader: () => {
                            return defer({ uploadedData: DataDisplayService.loadData('company') });
                        },
                        shouldRevalidate: () => false,
                        element: (
                            <Suspense fallback={<Preloader />}>
                                <DataDisplayPage partition="company" additClass="company" />
                                {/* <CompanyPage additClass="company" /> */}
                            </Suspense>
                        )
                    },
                    {
                        path: 'tasks/',
                        element: (
                            <Suspense fallback={<Preloader />}>
                                <TasksPage additClass="tasks" />
                            </Suspense>
                        )
                    },
                    {
                        path: 'chat/',
                        element: (
                            <Suspense fallback={<Preloader />}>
                                <ChatPage additClass="chat" />
                            </Suspense>
                        )
                    },
                    {
                        path: 'users/:id',
                        element: (
                            <Suspense fallback={<Preloader />}>
                                <UserInfo />
                            </Suspense>
                        )
                    },
                    {
                        path: 'dataform/',
                        loader: () => {
                            const sections = DataDisplayService.getSections();
                            const subsections = DataDisplayService.getSubsections(sections[0]);
                            return defer({
                                sections: sections,
                                subsections: subsections
                            });
                        },
                        element: (
                            <Suspense fallback={<Preloader />}>
                                <DataForm />
                            </Suspense>
                        )
                    }
                ]
            }
        ]
    }
];

export { ROUTES_FOR_NOT_AUTH, ROUTES_FOR_AUTH };
