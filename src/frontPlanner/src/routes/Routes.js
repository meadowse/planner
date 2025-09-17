import { lazy, Suspense } from 'react';
import { Navigate, defer } from 'react-router-dom';

// Импорт компонетов
import ProtectedRoute from './ProtectedRoute';
// import UserInfo from '@components/pages/data_user/UserInfo';
import Layout from '@components/layout/Layout';
import Authentication from '../authentication/Authentication';

// Импорт сервисов
import DataDisplayService from '@services/data_display.service';
import DataFormService from '@services/data_form.service';
import UserService from '@services/user.service';
import Preloader from '../components/auxiliary_pages/loader/Preloader';
import UserInfo from '../components/pages/data_user/UserInfo';
import { queryClient } from '../query/queryClient';
// import UserInfoNew from '../components/pages/data_user/UserInfoNew';

const DataDisplayPage = lazy(() => import('@components/pages/data_display/DataDisplayPage'));
const DataForm = lazy(() => import('@components/pages/data_display/data_form/DataForm'));
const DataFormNew = lazy(() => import('@components/pages/data_display/data_form/DataFormNew'));
const TasksPage = lazy(() => import('@components/pages/tasks/TasksPage'));
const ChatPage = lazy(() => import('@components/pages/chat/ChatPage'));
// const UserInfo = lazy(() => import('@components/pages/data_user/UserInfo'));
// const UserInfoNew = lazy(() => import('@components/pages/data_user/UserInfoNew'));
const TabGeneral = lazy(() => import('@components/pages/data_display/data_form/tabs/tab_general/TabGeneral'));
const TabWorkNew = lazy(() => import('@components/pages/data_display/data_form/tabs/tab_work/TabWorkNew'));
const TabEquipment = lazy(() => import('@components/pages/data_display/data_form/tabs/tab_equipment/TabEquipment'));

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
                // path: 'user/*',
                path: 'user/:idEmployee/:tab/*',
                loader: ({ params }) => {
                    const { tab, idEmployee } = params;
                    return defer({ uploadedData: UserService.loadData(tab, idEmployee) });
                },
                element: <UserInfo />
                // element: <UserInfoNew />
            },
            {
                path: '',
                element: <Layout />,
                children: [
                    // Если путь не указан или указан неверно
                    // перенаправлять по адресу
                    {
                        index: true,
                        // element: <Navigate to="/personal/" replace />
                        element: (
                            <Navigate
                                to={JSON.parse(localStorage.getItem('itemSideMenu'))?.path ?? '/personal/'}
                                replace
                            />
                        )
                    },
                    {
                        path: 'department/*',
                        loader: () => {
                            return defer({ uploadedData: DataDisplayService.loadData('department') });
                        },
                        // loader: () => {
                        //     return defer({
                        //         uploadedData: queryClient.ensureQueryData({
                        //             queryKey: ['department'],
                        //             queryFn: () => DataDisplayService.loadData('department')
                        //         })
                        //     });
                        // },
                        shouldRevalidate: () => false,
                        element: <DataDisplayPage partition="department" additClass="department" />
                    },
                    {
                        path: 'equipment/*',
                        loader: () => {
                            return defer({ uploadedData: DataDisplayService.loadData('equipment') });
                        },
                        shouldRevalidate: () => false,
                        element: <DataDisplayPage partition="equipment" additClass="equipment" />
                    },
                    {
                        path: 'company/*',
                        loader: () => {
                            return defer({ uploadedData: DataDisplayService.loadData('company') });
                        },
                        shouldRevalidate: () => false,
                        element: <DataDisplayPage partition="company" additClass="company" />
                    },
                    {
                        path: 'personal/*',
                        index: true,
                        loader: () => {
                            return defer({ uploadedData: DataDisplayService.loadData('tasks') });
                        },
                        shouldRevalidate: () => false,
                        element: <DataDisplayPage partition="personal" additClass="tasks" />
                    },
                    // {
                    //     path: 'user/',
                    //     // loader: async ({ params }) => {
                    //     //     const { tab, id } = params;
                    //     //     return defer({ uploadedData: await UserService.loadData(tab, id) });
                    //     // },
                    //     element: <UserInfo />
                    // },
                    {
                        path: 'dataform/*',
                        // path: 'dataform/:key/*',
                        element: <DataFormNew />,
                        loader: async ({ params }) => {
                            const { key } = params;
                            // console.log(`DataFormNew key: ${key}`);

                            // const LOAD_DATA_CONF = {
                            //     contract: async () => {
                            //         return await DataFormService.loadData('general', {
                            //             contractId: JSON.parse(localStorage.getItem('idContract'))
                            //         });
                            //     },
                            //     tool: () => {
                            //         return DataFormService.loadData('equipment', {
                            //             equipmentId: -1
                            //         });
                            //     }
                            // };

                            // return LOAD_DATA_CONF[key] ? LOAD_DATA_CONF[key]() : {};

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
                                    </Suspense>
                                )
                            },
                            {
                                path: 'equipment',
                                element: (
                                    <Suspense fallback={<Preloader />}>
                                        <TabEquipment />
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
