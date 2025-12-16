import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

export default function Dashboard() {
    const { currentUser } = useAuth();

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <p>Bem-vindo, {currentUser?.displayName || currentUser?.email}!</p>
                <div className="mt-4 p-4 bg-blue-50 text-blue-800 rounded">
                    📊 Seus gráficos de desempenho aparecerão aqui em breve.
                </div>
            </div>
        </div>
    );
}
