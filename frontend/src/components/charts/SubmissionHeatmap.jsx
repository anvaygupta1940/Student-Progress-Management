import React, { useMemo } from 'react';
import { format, startOfYear, endOfYear, eachDayOfInterval, parseISO } from 'date-fns';
import { HEATMAP_COLORS } from '../../utils/constants';

const SubmissionHeatmap = ({ data = [], year = new Date().getFullYear() }) => {
    const heatmapData = useMemo(() => {
        const yearStart = startOfYear(new Date(year, 0, 1));
        const yearEnd = endOfYear(new Date(year, 0, 1));
        const allDays = eachDayOfInterval({ start: yearStart, end: yearEnd });

        // Group submissions by date
        const submissionsByDate = data.reduce((acc, submission) => {
            const date = format(parseISO(submission.date), 'yyyy-MM-dd');
            acc[date] = (acc[date] || 0) + 1;
            return acc;
        }, {});

        // Create heatmap data for each day
        return allDays.map(day => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const count = submissionsByDate[dateStr] || 0;

            return {
                date: dateStr,
                count,
                intensity: Math.min(count, 5) // Cap at 5 for color intensity
            };
        });
    }, [data, year]);

    const getIntensityColor = (intensity) => {
        return HEATMAP_COLORS[intensity] || HEATMAP_COLORS[0];
    };

    const months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Group days by weeks
    const weeks = [];
    let currentWeek = [];

    heatmapData.forEach((day, index) => {
        const dayOfWeek = new Date(day.date).getDay();

        if (index === 0) {
            // Fill empty days at the beginning of the first week
            for (let i = 0; i < dayOfWeek; i++) {
                currentWeek.push(null);
            }
        }

        currentWeek.push(day);

        if (currentWeek.length === 7) {
            weeks.push(currentWeek);
            currentWeek = [];
        }
    });

    // Add the last partial week if it exists
    if (currentWeek.length > 0) {
        // Fill empty days at the end of the last week
        while (currentWeek.length < 7) {
            currentWeek.push(null);
        }
        weeks.push(currentWeek);
    }

    const totalSubmissions = data.length;
    const activeDays = heatmapData.filter(day => day.count > 0).length;
    const maxStreak = useMemo(() => {
        let currentStreak = 0;
        let maxStreak = 0;

        heatmapData.forEach(day => {
            if (day.count > 0) {
                currentStreak++;
                maxStreak = Math.max(maxStreak, currentStreak);
            } else {
                currentStreak = 0;
            }
        });

        return maxStreak;
    }, [heatmapData]);

    if (totalSubmissions === 0) {
        return (
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Submission Activity ({year})
                </h3>
                <div className="flex items-center justify-center h-32 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-center text-gray-500 dark:text-gray-400">
                        <p className="font-medium">No submissions found</p>
                        <p className="text-sm mt-1">Activity will appear here once data is synced</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Submission Activity ({year})
                </h3>
                <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                    <span>{totalSubmissions} submissions</span>
                    <span>{activeDays} active days</span>
                    <span>{maxStreak} day streak</span>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                {/* Month labels */}
                <div className="flex mb-2">
                    <div className="w-8"></div> {/* Space for weekday labels */}
                    <div className="flex-1 grid grid-cols-12 gap-1 text-xs text-gray-500 dark:text-gray-400">
                        {months.map(month => (
                            <div key={month} className="text-center">
                                {month}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Heatmap grid */}
                <div className="flex">
                    {/* Weekday labels */}
                    <div className="flex flex-col justify-between text-xs text-gray-500 dark:text-gray-400 pr-2">
                        {weekdays.map((day, index) => (
                            <div key={day} className="h-3 flex items-center">
                                {index % 2 === 1 ? day : ''}
                            </div>
                        ))}
                    </div>

                    {/* Heatmap cells */}
                    <div className="flex-1">
                        <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${weeks.length}, 1fr)` }}>
                            {weeks.map((week, weekIndex) => (
                                <div key={weekIndex} className="grid grid-rows-7 gap-1">
                                    {week.map((day, dayIndex) => (
                                        <div
                                            key={`${weekIndex}-${dayIndex}`}
                                            className={`w-3 h-3 rounded-sm ${day ? 'cursor-pointer hover:ring-2 hover:ring-primary-500' : ''}`}
                                            style={{
                                                backgroundColor: day ? getIntensityColor(day.intensity) : 'transparent'
                                            }}
                                            title={day ? `${day.date}: ${day.count} submissions` : ''}
                                        />
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Legend */}
                <div className="flex items-center justify-between mt-4 text-xs text-gray-500 dark:text-gray-400">
                    <span>Less</span>
                    <div className="flex items-center space-x-1">
                        {Object.entries(HEATMAP_COLORS).map(([intensity, color]) => (
                            <div
                                key={intensity}
                                className="w-3 h-3 rounded-sm"
                                style={{ backgroundColor: color }}
                                title={`${intensity} submissions`}
                            />
                        ))}
                    </div>
                    <span>More</span>
                </div>
            </div>

            {/* Stats summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {totalSubmissions}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        Total Submissions
                    </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {activeDays}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        Active Days
                    </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {maxStreak}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        Longest Streak
                    </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {Math.round((activeDays / 365) * 100)}%
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        Year Coverage
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SubmissionHeatmap;