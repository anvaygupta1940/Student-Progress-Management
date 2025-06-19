import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    ArrowLeft,
    RefreshCw,
    ExternalLink,
    Mail,
    Phone,
    Calendar,
    Trophy,
    Target,
    TrendingUp,
    Activity
} from 'lucide-react';
import { studentsAPI, syncAPI } from '../services/api';
import { formatDate, formatRating, getRatingColor, getRatingTitle } from '../utils/helpers';
import { TIME_FILTERS } from '../utils/constants';
import RatingChart from '../components/charts/RatingChart';
import ProblemRatingChart from '../components/charts/ProblemRatingChart';
import SubmissionHeatmap from '../components/charts/SubmissionHeatmap';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const StudentDetail = () => {
    const { id } = useParams();
    const [student, setStudent] = useState(null);
    const [studentData, setStudentData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [contestFilter, setContestFilter] = useState(30);
    const [problemFilter, setProblemFilter] = useState(30);

    useEffect(() => {
        if (id) {
            fetchStudentData();
        }
    }, [id, contestFilter, problemFilter]);

    const fetchStudentData = async () => {
        try {
            setLoading(true);

            const [studentResponse, dataResponse] = await Promise.all([
                studentsAPI.getById(id),
                studentsAPI.getData(id, {
                    contestDays: contestFilter,
                    problemDays: problemFilter
                })
            ]);

            setStudent(studentResponse.data.data);
            setStudentData(dataResponse.data.data);
        } catch (error) {
            console.error('Error fetching student data:', error);
            toast.error('Failed to load student data');
        } finally {
            setLoading(false);
        }
    };

    const handleSync = async () => {
        if (!student) return;

        try {
            setSyncing(true);
            const loadingToast = toast.loading(`Syncing data for ${student.codeforcesHandle}...`);

            await syncAPI.syncStudent(student.codeforcesHandle);

            toast.dismiss(loadingToast);
            toast.success('Data synced successfully');

            // Refresh data
            await fetchStudentData();
        } catch (error) {
            console.error('Error syncing student:', error);
            const message = error.response?.data?.message || 'Failed to sync student data';
            toast.error(message);
        } finally {
            setSyncing(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-96">
                <div className="text-center">
                    <LoadingSpinner size="lg" />
                    <p className="text-gray-500 dark:text-gray-400 mt-4">Loading student data...</p>
                </div>
            </div>
        );
    }

    if (!student || !studentData) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">Student not found</p>
                <Link to="/" className="btn-primary mt-4">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Dashboard
                </Link>
            </div>
        );
    }

    const { contestHistory, problemStats, analytics, ratingBuckets } = studentData;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Link
                        to="/"
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {student.name}
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400">
                            Student Profile & Analytics
                        </p>
                    </div>
                </div>

                <button
                    onClick={handleSync}
                    disabled={syncing}
                    className="btn-primary"
                >
                    <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
                    {syncing ? 'Syncing...' : 'Sync Data'}
                </button>
            </div>

            {/* Student Info Card */}
            <div className="card p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Basic Info */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Contact Information
                        </h3>
                        <div className="space-y-3">
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                <Mail className="w-4 h-4 mr-2" />
                                {student.email}
                            </div>
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                <Phone className="w-4 h-4 mr-2" />
                                {student.phone}
                            </div>
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                <Calendar className="w-4 h-4 mr-2" />
                                Last synced: {formatDate(student.lastSynced)}
                            </div>
                        </div>
                    </div>

                    {/* Codeforces Info */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Codeforces Profile
                        </h3>
                        <div className="space-y-3">
                            <a
                                href={`https://codeforces.com/profile/${student.codeforcesHandle}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                            >
                                {student.codeforcesHandle}
                                <ExternalLink className="w-4 h-4 ml-1" />
                            </a>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                {getRatingTitle(student.currentRating)}
                            </div>
                        </div>
                    </div>

                    {/* Current Rating */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Current Rating
                        </h3>
                        <div className="flex items-center space-x-3">
                            <div
                                className="w-4 h-4 rounded-full"
                                style={{ backgroundColor: getRatingColor(student.currentRating) }}
                            />
                            <span className="text-2xl font-bold text-gray-900 dark:text-white">
                                {formatRating(student.currentRating)}
                            </span>
                        </div>
                    </div>

                    {/* Max Rating */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Max Rating
                        </h3>
                        <div className="flex items-center space-x-3">
                            <div
                                className="w-4 h-4 rounded-full"
                                style={{ backgroundColor: getRatingColor(student.maxRating) }}
                            />
                            <span className="text-2xl font-bold text-gray-900 dark:text-white">
                                {formatRating(student.maxRating)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Analytics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="card p-6">
                    <div className="flex items-center space-x-3">
                        <div className="p-3 bg-primary-100 dark:bg-primary-900 rounded-lg">
                            <Trophy className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {analytics.contestStats.totalContests}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Contests Participated
                            </p>
                        </div>
                    </div>
                </div>

                <div className="card p-6">
                    <div className="flex items-center space-x-3">
                        <div className="p-3 bg-success-100 dark:bg-success-900 rounded-lg">
                            <Target className="w-6 h-6 text-success-600 dark:text-success-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {analytics.problemStats.totalSolved}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Problems Solved
                            </p>
                        </div>
                    </div>
                </div>

                <div className="card p-6">
                    <div className="flex items-center space-x-3">
                        <div className="p-3 bg-warning-100 dark:bg-warning-900 rounded-lg">
                            <TrendingUp className="w-6 h-6 text-warning-600 dark:text-warning-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {analytics.problemStats.averageRating}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Avg Problem Rating
                            </p>
                        </div>
                    </div>
                </div>

                <div className="card p-6">
                    <div className="flex items-center space-x-3">
                        <div className="p-3 bg-secondary-100 dark:bg-secondary-900 rounded-lg">
                            <Activity className="w-6 h-6 text-secondary-600 dark:text-secondary-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {analytics.problemStats.averagePerDay}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Problems per Day
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contest History Section */}
            <div className="card p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Contest History
                    </h2>
                    <select
                        value={contestFilter}
                        onChange={(e) => setContestFilter(Number(e.target.value))}
                        className="input w-auto"
                    >
                        {TIME_FILTERS.CONTEST.map(filter => (
                            <option key={filter.value} value={filter.value}>
                                {filter.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Rating Chart */}
                    <div>
                        <RatingChart
                            data={contestHistory}
                            title="Rating Progress Over Time"
                        />
                    </div>

                    {/* Contest Table */}
                    <div className="overflow-x-auto">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Contest</th>
                                    <th>Rank</th>
                                    <th>Rating Change</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {contestHistory.slice(0, 10).map((contest, index) => (
                                    <tr key={index}>
                                        <td className="max-w-xs truncate" title={contest.contestName}>
                                            {contest.contestName}
                                        </td>
                                        <td className="font-medium">
                                            #{contest.rank}
                                        </td>
                                        <td>
                                            <span className={`font-medium ${contest.ratingChange > 0
                                                    ? 'text-success-600 dark:text-success-400'
                                                    : contest.ratingChange < 0
                                                        ? 'text-error-600 dark:text-error-400'
                                                        : 'text-gray-600 dark:text-gray-400'
                                                }`}>
                                                {contest.ratingChange > 0 ? '+' : ''}{contest.ratingChange}
                                            </span>
                                        </td>
                                        <td className="text-sm text-gray-500 dark:text-gray-400">
                                            {formatDate(contest.date)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {contestHistory.length === 0 && (
                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                No contest history available
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Problem Solving Section */}
            <div className="card p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Problem Solving Analytics
                    </h2>
                    <select
                        value={problemFilter}
                        onChange={(e) => setProblemFilter(Number(e.target.value))}
                        className="input w-auto"
                    >
                        {TIME_FILTERS.PROBLEM.map(filter => (
                            <option key={filter.value} value={filter.value}>
                                {filter.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="space-y-8">
                    {/* Problem Rating Distribution */}
                    <ProblemRatingChart
                        data={ratingBuckets}
                        title="Problems Solved by Rating Range"
                    />

                    {/* Submission Heatmap */}
                    <SubmissionHeatmap
                        data={problemStats}
                        year={new Date().getFullYear()}
                    />
                </div>
            </div>
        </div>
    );
};

export default StudentDetail;