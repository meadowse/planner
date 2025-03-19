import { lazy, Suspense } from 'react';
import { Navigate, defer } from 'react-router-dom';
import axios from 'axios';

// Импорт компонетов
import ProtectedRoute from './ProtectedRoute';
import UserInfo from '@components/pages/data_user/UserInfo';
import Layout from '@components/layout/Layout';
import Authentication from '../authentication/Authentication';
import Preloader from '@components/auxiliary_pages/loader/Preloader';

// Импорт сервисов
import DataDisplayService from '@services/data_display.service';
import DataFormService from '@services/data_form.service';

const DataDisplayPage = lazy(() => import('@components/pages/data_display/DataDisplayPage'));
const DataForm = lazy(() => import('@components/pages/data_display/data_form/DataForm'));
const DataFormNew = lazy(() => import('@components/pages/data_display/data_form/DataFormNew'));
const TasksPage = lazy(() => import('@components/pages/tasks/TasksPage'));
const ChatPage = lazy(() => import('@components/pages/chat/ChatPage'));
//
const TabGeneral = lazy(() => import('@components/pages/data_display/data_form/tabs/tab_general/TabGeneral'));
const TabWorkNew = lazy(() => import('@components/pages/data_display/data_form/tabs/tab_work/TabWorkNew'));

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
            {
                path: '/auth',
                element: <Authentication />
            },
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
                        loader: () => {
                            return defer({ uploadedData: DataDisplayService.loadData('company') });
                        },
                        shouldRevalidate: () => false,
                        element: (
                            <Suspense fallback={<Preloader />}>
                                <DataDisplayPage partition="company" additClass="company" />
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
                        path: 'dataform/*',
                        element: (
                            <Suspense fallback={<Preloader />}>
                                <DataFormNew />
                            </Suspense>
                        ),
                        loader: async () => {
                            return await DataFormService.loadData('general', {
                                contractId: JSON.parse(localStorage.getItem('idContract'))
                            });
                        },
                        children: [
                            {
                                path: 'general/',
                                element: (
                                    <Suspense fallback={<Preloader />}>
                                        <TabGeneral />
                                    </Suspense>
                                )
                            },
                            {
                                path: 'works/:id',
                                loader: async ({ params }) => {
                                    const { id } = params;
                                    return {
                                        uploadedData: await DataFormService.loadData('works', { contractId: id })
                                    };
                                },
                                element: (
                                    <Suspense fallback={<Preloader />}>
                                        <TabWorkNew />
                                        {/* <p>TabWork</p> */}
                                    </Suspense>
                                )
                            }
                        ]
                    }
                ]
            }
        ]
    }
];

export { ROUTES_FOR_NOT_AUTH, ROUTES_FOR_AUTH };
