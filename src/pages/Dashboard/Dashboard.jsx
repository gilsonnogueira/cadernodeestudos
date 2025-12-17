import React, { useMemo } from 'react';
import { useQuestions } from '../../contexts/QuestionContext';
import { useAuth } from '../../contexts/AuthContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Activity, Target, CheckCircle, XCircle, BookOpen } from 'lucide-react';

export default function Dashboard() {
    const { userProgress, allQuestions, totalQuestions } = useQuestions();
    const { currentUser } = useAuth();

    // Calculate Stats
    const stats = useMemo(() => {
        const answers = Object.values(userProgress || {});
        const totalAnswered = answers.length;
        const correct = answers.filter(a => a.status === 'correct').length;
        const wrong = totalAnswered - correct;
        const accuracy = totalAnswered > 0 ? Math.round((correct / totalAnswered) * 100) : 0;

        return { totalAnswered, correct, wrong, accuracy };
    }, [userProgress]);

    // Data for Charts
    const pieData = [
        { name: 'Acertos', value: stats.correct, color: '#22c55e' }, // green-500
        { name: 'Erros', value: stats.wrong, color: '#ef4444' },     // red-500
    ];

    // Calculate Performance by Discipline
    const disciplineStats = useMemo(() => {
        if (!userProgress || !allQuestions || !allQuestions.length) return [];

        const discMap = {};

        // Map question ID to discipline
        const qIdToDisc = {};
        allQuestions.forEach(q => qIdToDisc[q.id] = q.discipline);

        Object.entries(userProgress).forEach(([qId, data]) => {
            const disc = qIdToDisc[qId] || 'Outros';
            if (!discMap[disc]) discMap[disc] = { name: disc, total: 0, correct: 0 };

            discMap[disc].total++;
            if (data.status === 'correct') discMap[disc].correct++;
        });

        return Object.values(discMap)
            .map(d => ({ ...d, accuracy: Math.round((d.correct / d.total) * 100) }))
            .sort((a, b) => b.total - a.total)
            .slice(0, 5); // Top 5 disciplines
    }, [userProgress, allQuestions]);


    if (!currentUser) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="bg-blue-50 p-4 rounded-full mb-4">
                    <Activity size={32} className="text-blue-500" />
                </div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">Faça login para ver seu progresso</h2>
                <p className="text-gray-500 max-w-md">
                    Acompanhe suas estatísticas, taxa de acertos e desempenho por disciplina criando uma conta gratuita.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <header className="mb-8">
                <h1 className="text-2xl font-bold text-gray-800">Seu Desempenho</h1>
                <p className="text-gray-500">Visão geral dos seus estudos e métricas de aprendizado.</p>
            </header>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard
                    title="Questões Respondidas"
                    value={stats.totalAnswered}
                    icon={<BookOpen size={20} />}
                    color="blue"
                    subtext={`de ${totalQuestions} totais`}
                />
                <StatCard
                    title="Taxa de Acertos"
                    value={`${stats.accuracy}%`}
                    icon={<Target size={20} />}
                    color="purple"
                    subtext="Média geral"
                />
                <StatCard
                    title="Acertos"
                    value={stats.correct}
                    icon={<CheckCircle size={20} />}
                    color="green"
                />
                <StatCard
                    title="Erros"
                    value={stats.wrong}
                    icon={<XCircle size={20} />}
                    color="red"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Accuracy Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="font-bold text-gray-700 mb-6">Distribuição de Acertos</h3>
                    <div className="h-64 flex items-center justify-center">
                        {stats.totalAnswered > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="text-gray-400 text-sm">Responda questões para ver o gráfico.</p>
                        )}
                    </div>
                </div>

                {/* Discipline Performance */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="font-bold text-gray-700 mb-6">Top Disciplinas Estudadas</h3>
                    <div className="h-64">
                        {disciplineStats.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={disciplineStats} layout="vertical" margin={{ left: 40 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                                    <Tooltip cursor={{ fill: 'transparent' }} />
                                    <Bar dataKey="total" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                                Sem dados suficientes.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon, color, subtext }) {
    const colors = {
        blue: 'bg-blue-50 text-blue-600',
        purple: 'bg-purple-50 text-purple-600',
        green: 'bg-green-50 text-green-600',
        red: 'bg-red-50 text-red-600',
    };

    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-start justify-between">
            <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">{title}</p>
                <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
                {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
            </div>
            <div className={`p-2 rounded-lg ${colors[color]}`}>
                {icon}
            </div>
        </div>
    );
}
