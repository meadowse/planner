import React from 'react';
import ReactDOM from 'react-dom/client';

// Импорт компонентов
import App from './App';
// import AuthProvider from './contexts/AuthContext';
import AuthProvider from './contexts/auth.context';

// Импорт стилей
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <AuthProvider>
        <App />
    </AuthProvider>
);
