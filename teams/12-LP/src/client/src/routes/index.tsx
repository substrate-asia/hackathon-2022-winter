import React, {lazy} from 'react';
import {RouteProps} from 'react-router';


export type CustomizeRouteProps = {
    key: string;
    lazyElemnt: React.FC;
} & RouteProps;

export const routerConfig: CustomizeRouteProps[] = [
    {
        key: 'home',
        path: '/home',
        lazyElemnt: lazy(() => import('../views/Home'))
    },
];
