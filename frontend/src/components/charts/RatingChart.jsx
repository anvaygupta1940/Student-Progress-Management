import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { formatDate } from '../../utils/helpers';
import { CHART_COLORS } from '../../utils/constants';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const RatingChart = ({ data = [], title = 'Rating Progress' }) => {
    const chartData = {
        labels: data.map(item => formatDate(item.date, 'MMM dd')),
        datasets: [
            {
                label: 'Rating',
                data: data.map(item => item.newRating),
                borderColor: CHART_COLORS.primary,
                backgroundColor: `${CHART_COLORS.primary}20`,
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointHoverRadius: 6,
                pointBackgroundColor: CHART_COLORS.primary,
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
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
                mode: 'index',
                intersect: false,
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: '#ffffff',
                bodyColor: '#ffffff',
                borderColor: CHART_COLORS.primary,
                borderWidth: 1,
                cornerRadius: 8,
                displayColors: false,
                callbacks: {
                    title: (context) => {
                        const index = context[0].dataIndex;
                        return formatDate(data[index]?.date, 'MMM dd, yyyy');
                    },
                    label: (context) => {
                        const index = context.dataIndex;
                        const contest = data[index];
                        const rating = context.parsed.y;
                        const change = contest?.ratingChange || 0;
                        const changeText = change > 0 ? `+${change}` : `${change}`;

                        return [
                            `Rating: ${rating}`,
                            `Change: ${changeText}`,
                            `Contest: ${contest?.contestName || 'Unknown'}`
                        ];
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
                    maxTicksLimit: 8,
                    color: '#6B7280'
                }
            },
            y: {
                display: true,
                grid: {
                    color: '#E5E7EB'
                },
                ticks: {
                    color: '#6B7280',
                    callback: function (value) {
                        return Math.round(value);
                    }
                }
            }
        },
        interaction: {
            mode: 'nearest',
            axis: 'x',
            intersect: false
        },
        elements: {
            point: {
                hoverRadius: 8
            }
        }
    };

    if (!data || data.length === 0) {
        return (
            <div className="chart-container flex items-center justify-center">
                <div className="text-center text-gray-500 dark:text-gray-400">
                    <p className="text-lg font-medium">No contest data available</p>
                    <p className="text-sm mt-1">Contest history will appear here once data is synced</p>
                </div>
            </div>
        );
    }

    return (
        <div className="chart-container">
            <Line data={chartData} options={options} />
        </div>
    );
};

export default RatingChart;