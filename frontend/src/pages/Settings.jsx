import React, { useState, useEffect } from 'react';
import {
    Clock,
    Mail,
    Database,
    RefreshCw,
    Save,
    AlertCircle,
    CheckCircle,
    Settings as SettingsIcon
} from 'lucide-react';
import { cronAPI, syncAPI, healthAPI } from '../services/api';
import { CRON_PRESETS } from '../utils/constants';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const Settings = () => {
    const [cronSchedule, setCronSchedule] = useState('');
    const [customSchedule, setCustomSchedule] = useState('');
    const [useCustom, setUseCustom] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [healthStatus, setHealthStatus] = useState(null);

    useEffect(() => {
        fetchSettings();
        checkHealth();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const response = await cronAPI.getSchedule();
            const schedule = response.data.data.schedule;

            setCronSchedule(schedule);

            // Check if it's a preset or custom
            const isPreset = CRON_PRESETS.some(preset => preset.value === schedule);
            if (!isPreset) {
                setUseCustom(true);
                setCustomSchedule(schedule);
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
            toast.error('Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    const checkHealth = async () => {
        try {
            const response = await healthAPI.check();
            setHealthStatus(response.data);
        } catch (error) {
            console.error('Health check failed:', error);
            setHealthStatus({ status: 'ERROR', error: error.message });
        }
    };

    const handleSaveSchedule = async () => {
        try {
            setSaving(true);
            const scheduleToSave = useCustom ? customSchedule : cronSchedule;

            if (!scheduleToSave.trim()) {
                toast.error('Please enter a valid cron schedule');
                return;
            }

            await cronAPI.updateSchedule(scheduleToSave);
            toast.success('Cron schedule updated successfully');

            // Refresh settings
            await fetchSettings();
        } catch (error) {
            console.error('Error saving schedule:', error);
            const message = error.response?.data?.message || 'Failed to update schedule';
            toast.error(message);
        } finally {
            setSaving(false);
        }
    };

    const handleSyncAll = async () => {
        try {
            setSyncing(true);
            const loadingToast = toast.loading('Syncing all students...');

            const response = await syncAPI.syncAll();
            const result = response.data.data;

            toast.dismiss(loadingToast);
            toast.success(`Sync completed: ${result.successful} successful, ${result.failed} failed`);
        } catch (error) {
            console.error('Error syncing all students:', error);
            const message = error.response?.data?.message || 'Failed to sync students';
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
                    <p className="text-gray-500 dark:text-gray-400 mt-4">Loading settings...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Settings
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                    Configure system settings and automation
                </p>
            </div>

            {/* System Health */}
            <div className="card p-6">
                <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-lg">
                        <SettingsIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        System Health
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <div className="flex items-center space-x-2">
                            {healthStatus?.status === 'OK' ? (
                                <CheckCircle className="w-5 h-5 text-success-600" />
                            ) : (
                                <AlertCircle className="w-5 h-5 text-error-600" />
                            )}
                            <span className="font-medium text-gray-900 dark:text-white">
                                API Status
                            </span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {healthStatus?.status || 'Unknown'}
                        </p>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <div className="flex items-center space-x-2">
                            <Database className="w-5 h-5 text-primary-600" />
                            <span className="font-medium text-gray-900 dark:text-white">
                                Environment
                            </span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {healthStatus?.environment || 'Unknown'}
                        </p>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <div className="flex items-center space-x-2">
                            <Clock className="w-5 h-5 text-secondary-600" />
                            <span className="font-medium text-gray-900 dark:text-white">
                                Uptime
                            </span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {healthStatus?.uptime ? `${Math.round(healthStatus.uptime)}s` : 'Unknown'}
                        </p>
                    </div>
                </div>

                <button
                    onClick={checkHealth}
                    className="btn-secondary mt-4"
                >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh Status
                </button>
            </div>

            {/* Cron Schedule Settings */}
            <div className="card p-6">
                <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-warning-100 dark:bg-warning-900 rounded-lg">
                        <Clock className="w-5 h-5 text-warning-600 dark:text-warning-400" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Automatic Sync Schedule
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Configure when to automatically sync student data from Codeforces
                        </p>
                    </div>
                </div>

                <div className="space-y-4">
                    {/* Schedule Type Toggle */}
                    <div className="flex items-center space-x-4">
                        <label className="flex items-center">
                            <input
                                type="radio"
                                name="scheduleType"
                                checked={!useCustom}
                                onChange={() => setUseCustom(false)}
                                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                            />
                            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                Use preset schedule
                            </span>
                        </label>

                        <label className="flex items-center">
                            <input
                                type="radio"
                                name="scheduleType"
                                checked={useCustom}
                                onChange={() => setUseCustom(true)}
                                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                            />
                            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                Custom cron expression
                            </span>
                        </label>
                    </div>

                    {/* Preset Schedule */}
                    {!useCustom && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Select Schedule
                            </label>
                            <select
                                value={cronSchedule}
                                onChange={(e) => setCronSchedule(e.target.value)}
                                className="input"
                            >
                                {CRON_PRESETS.map(preset => (
                                    <option key={preset.value} value={preset.value}>
                                        {preset.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Custom Schedule */}
                    {useCustom && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Cron Expression
                            </label>
                            <input
                                type="text"
                                value={customSchedule}
                                onChange={(e) => setCustomSchedule(e.target.value)}
                                placeholder="0 2 * * *"
                                className="input"
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Format: minute hour day month weekday (e.g., "0 2 * * *" for daily at 2 AM)
                            </p>
                        </div>
                    )}

                    <button
                        onClick={handleSaveSchedule}
                        disabled={saving}
                        className="btn-primary"
                    >
                        {saving ? (
                            <>
                                <LoadingSpinner size="sm" className="mr-2" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4 mr-2" />
                                Save Schedule
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Manual Sync */}
            <div className="card p-6">
                <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-success-100 dark:bg-success-900 rounded-lg">
                        <RefreshCw className="w-5 h-5 text-success-600 dark:text-success-400" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Manual Data Sync
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Manually trigger data synchronization for all students
                        </p>
                    </div>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
                    <div className="flex items-start space-x-3">
                        <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                        <div>
                            <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                                Important Note
                            </h3>
                            <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                                Manual sync may take several minutes depending on the number of students.
                                The process will fetch the latest data from Codeforces for all active students.
                            </p>
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleSyncAll}
                    disabled={syncing}
                    className="btn-primary"
                >
                    {syncing ? (
                        <>
                            <LoadingSpinner size="sm" className="mr-2" />
                            Syncing All Students...
                        </>
                    ) : (
                        <>
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Sync All Students Now
                        </>
                    )}
                </button>
            </div>

            {/* Email Settings Info */}
            <div className="card p-6">
                <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-secondary-100 dark:bg-secondary-900 rounded-lg">
                        <Mail className="w-5 h-5 text-secondary-600 dark:text-secondary-400" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Email Notifications
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Automatic email reminders for inactive students
                        </p>
                    </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                        <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                        <div>
                            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                                Email Configuration
                            </h3>
                            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                                Email settings are configured on the server side. Students who haven't
                                submitted problems for 7+ days will automatically receive reminder emails
                                if they have email notifications enabled.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;