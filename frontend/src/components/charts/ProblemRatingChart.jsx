import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { CHART_COLORS, RATING_BUCKETS } from '../../utils/constants';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const ProblemRatingChart = ({ data = {}, title = 'Problems Solved by Rating' }) => {
    // Ensure all buckets are represented
    const bucketData = RATING_BUCKETS.map(bucket => ({
        label: bucket.label,
        count: data[bucket.label] || 0
    }));

    const chartData = {
        labels: bucketData.map(item => item.label),
        datasets: [
            {
                label: 'Problems Solved',
                data: bucketData.map(item => item.count),
                backgroundColor: [
                    `${CHART_COLORS.success}80`,
                    `${CHART_COLORS.primary}80`,
                    `${CHART_COLORS.secondary}80`,
                    `${CHART_COLORS.warning}80`,
                    `${CHART_COLORS.accent}80`,
                    `${CHART_COLORS.error}80`,
                    `${CHART_COLORS.gray}80`
                ],
                borderColor: [
                    CHART_COLORS.success,
                    CHART_COLORS.primary,
                    CHART_COLORS.secondary,
                    CHART_COLORS.warning,
                    CHART_COLORS.accent,
                    CHART_COLORS.error,
                    CHART_COLORS.gray
                ],
                borderWidth: 2,
                borderRadius: 4,
                borderSkipped: false,
            }
        ]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            title: {
                display: true,
                text: title,
                font: {
                    size: 16,
                    weight: 'bold'
                },
                color: '#374151'
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: '#ffffff',
                bodyColor: '#ffffff',
                borderColor: CHART_COLORS.primary,
                borderWidth: 1,
                cornerRadius: 8,
                displayColors: true,
                callbacks: {
                    label: (context) => {
                        const count = context.parsed.y;
                        const total = bucketData.reduce((sum, item) => sum + item.count, 0);
                        const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
                        return `${count} problems (${percentage}%)`;
                    }
                }
            }
        },
        scales: {
            x: {
                display: true,
                grid: {
                    display: false
                },
                ticks: {
                    color: '#6B7280',
                    font: {
                        size: 12
                    }
                }
            },
            y: {
                display: true,
                grid: {
                    color: '#E5E7EB'
                },
                ticks: {
                    color: '#6B7280',
                    stepSize: 1,
                    callback: function (value) {
                        return Math.round(value);
                    }
                },
                beginAtZero: true
            }
        },
        interaction: {
            mode: 'index',
            intersect: false
        }
    };

    const totalProblems = bucketData.reduce((sum, item) => sum + item.count, 0);

    if (totalProblems === 0) {
        return (
            <div className="chart-container flex items-center justify-center">
                <div className="text-center text-gray-500 dark:text-gray-400">
                    <p className="text-lg font-medium">No problems solved yet</p>
                    <p className="text-sm mt-1">Problem statistics will appear here once data is synced</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="chart-container">
                <Bar data={chartData} options={options} />
            </div>

            {/* Summary stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {totalProblems}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        Total Solved
                    </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {bucketData.filter(item => item.count > 0).length}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        Rating Ranges
                    </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {Math.max(...bucketData.map(item => item.count))}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        Max in Range
                    </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {bucketData.find(item => item.count === Math.max(...bucketData.map(i => i.count)))?.label || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        Most Solved
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProblemRatingChart;