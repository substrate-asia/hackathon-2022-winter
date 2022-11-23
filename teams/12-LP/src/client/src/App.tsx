import React, {Suspense} from 'react';
import {BrowserRouter, Routes, Route, Navigate} from 'react-router-dom';
import './App.css';
import {CustomizeRouteProps, routerConfig} from './routes';

function App() {
    return (
        <Suspense fallback={null}>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Navigate replace to="/home" />} />
                    {
                        routerConfig.map(
                            (item: CustomizeRouteProps) => {
                                return (
                                    <Route
                                        path={item.path}
                                        key={item.key}
                                        element={<item.lazyElemnt />}
                                    ></Route>
                                );
                            }
                        )
                    }
                </Routes>
            </BrowserRouter>
        </Suspense>
    );
}

export default App;
