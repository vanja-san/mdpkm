import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { Home, NotFound, InstanceSplash } from './pages';

const Tauri = window.__TAURI__;
const rootElement = document.getElementById('root');
ReactDOM.render(
    <BrowserRouter>
        <Routes>
            <Route exact path="/" element={<Home/>}/>
            <Route exact path="/instance-splash" element={<InstanceSplash/>}/>
            <Route path="/*" element={<NotFound/>}/>
        </Routes>
    </BrowserRouter>,
    rootElement
);

if (Tauri) {
    rootElement.classList.add("root-tauri");
    document.body.classList.add("body-tauri");
}