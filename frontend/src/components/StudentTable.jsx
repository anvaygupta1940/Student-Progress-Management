import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
    Eye,
    Edit,
    Trash2,
    Download,
    RefreshCw,
    Plus,
    Search,
    ArrowUpDown,
    ExternalLink,
    Mail,
    Phone
} from 'lucide-react';
import { formatDate, formatRating, getRatingColor, getRelativeTime } from '../utils/helpers';
import LoadingSpinner from './LoadingSpinner';
import ConfirmDialog from './ConfirmDialog';

const StudentTable = ({
    students = [],
    loading = false,
    onEdit,
    onDelete,
    onSync,
    onExport,
    onAdd
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [sortField, setSortField] = useState('name');
    const [sortDirection, setSortDirection] = useState('asc');
    const [deleteConfirm, setDeleteConfirm] = useState({ show: false, student: null });
    const [syncingStudents, setSyncingStudents] = useState(new Set());

    // Filter and sort students
    const filteredAndSortedStudents = useMemo(() => {
        let filtered = students.filter(student =>
            student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            student.codeforcesHandle.toLowerCase().includes(searchQuery.toLowerCase())
        );

        return filtered.sort((a, b) => {
            let aVal = a[sortField];
            let bVal = b[sortField];

            // Handle different data types
            if (sortField === 'lastSynced') {
                aVal = aVal ? new Date(aVal) : new Date(0);
                bVal = bVal ? new Date(bVal) : new Date(0);
            } else if (typeof aVal === 'string') {
                aVal = aVal.toLowerCase();
                bVal = bVal.toLowerCase();
            }

            if (sortDirection === 'desc') {
                return bVal > aVal ? 1 : bVal < aVal ? -1 : 0;
            }
            return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
        });
    }, [students, searchQuery, sortField, sortDirection]);

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const handleDelete = (student) => {
        setDeleteConfirm({ show: true, student });
    };

    const confirmDelete = async () => {
        if (deleteConfirm.student) {
            await onDelete(deleteConfirm.student._id);
            setDeleteConfirm({ show: false, student: null });
        }
    };

    const handleSync = async (student) => {
        setSyncingStudents(prev => new Set([...prev, student._id]));
        try {
            await onSync(student.codeforcesHandle);
        } finally {
            setSyncingStudents(prev => {
                const next = new Set(prev);
                next.delete(student._id);
                return next;
            });
        }
    };

    const SortButton = ({ field, children }) => (
        <button
            onClick={() => handleSort(field)}
            className="flex items-center space-x-1 text-left font-medium text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
        >
            <span>{children}</span>
            <ArrowUpDown className="w-4 h-4" />
        </button>
    );

    if (loading) {
        return (
            <div className="card p-8">
                <LoadingSpinner size="lg" />
                <p className="text-center text-gray-500 dark:text-gray-400 mt-4">
                    Loading students...
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Students ({students.length})
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Manage student profiles and track their Codeforces progress
                    </p>
                </div>

                <div className="flex items-center space-x-3">
                    <button
                        onClick={onExport}
                        className="btn-secondary"
                        title="Export to CSV"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </button>

                    <button
                        onClick={onAdd}
                        className="btn-primary"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Student
                    </button>
                </div>
            </div>

            {/* Search and filters */}
            <div className="card p-4">
                <div className="flex items-center space-x-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search students..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="input pl-10"
                        />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>
                                    <SortButton field="name">Name</SortButton>
                                </th>
                                <th>
                                    <SortButton field="email">Contact</SortButton>
                                </th>
                                <th>
                                    <SortButton field="codeforcesHandle">Handle</SortButton>
                                </th>
                                <th>
                                    <SortButton field="currentRating">Current Rating</SortButton>
                                </th>
                                <th>
                                    <SortButton field="maxRating">Max Rating</SortButton>
                                </th>
                                <th>
                                    <SortButton field="lastSynced">Last Sync</SortButton>
                                </th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAndSortedStudents.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="text-center py-12">
                                        <div className="text-gray-500 dark:text-gray-400">
                                            {searchQuery ? 'No students found matching your search.' : 'No students added yet.'}
                                        </div>
                                        {!searchQuery && (
                                            <button
                                                onClick={onAdd}
                                                className="btn-primary mt-4"
                                            >
                                                <Plus className="w-4 h-4 mr-2" />
                                                Add First Student
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ) : (
                                filteredAndSortedStudents.map((student) => (
                                    <tr key={student._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <td>
                                            <div className="font-medium text-gray-900 dark:text-white">
                                                {student.name}
                                            </div>
                                        </td>

                                        <td>
                                            <div className="space-y-1">
                                                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                                    <Mail className="w-3 h-3 mr-1" />
                                                    {student.email}
                                                </div>
                                                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                                    <Phone className="w-3 h-3 mr-1" />
                                                    {student.phone}
                                                </div>
                                            </div>
                                        </td>

                                        <td>
                                            <a
                                                href={`https://codeforces.com/profile/${student.codeforcesHandle}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                                            >
                                                {student.codeforcesHandle}
                                                <ExternalLink className="w-3 h-3 ml-1" />
                                            </a>
                                        </td>

                                        <td>
                                            <div className="flex items-center">
                                                <div
                                                    className="w-3 h-3 rounded-full mr-2"
                                                    style={{ backgroundColor: getRatingColor(student.currentRating) }}
                                                />
                                                <span className="font-medium">
                                                    {formatRating(student.currentRating)}
                                                </span>
                                            </div>
                                        </td>

                                        <td>
                                            <div className="flex items-center">
                                                <div
                                                    className="w-3 h-3 rounded-full mr-2"
                                                    style={{ backgroundColor: getRatingColor(student.maxRating) }}
                                                />
                                                <span className="font-medium">
                                                    {formatRating(student.maxRating)}
                                                </span>
                                            </div>
                                        </td>

                                        <td>
                                            <div className="text-sm">
                                                <div className="text-gray-900 dark:text-white">
                                                    {formatDate(student.lastSynced)}
                                                </div>
                                                <div className="text-gray-500 dark:text-gray-400">
                                                    {getRelativeTime(student.lastSynced)}
                                                </div>
                                            </div>
                                        </td>

                                        <td>
                                            <div className="flex items-center justify-end space-x-2">
                                                <Link
                                                    to={`/student/${student._id}`}
                                                    className="p-2 text-gray-400 hover:text-primary-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                                    title="View details"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Link>

                                                <button
                                                    onClick={() => onEdit(student)}
                                                    className="p-2 text-gray-400 hover:text-warning-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                                    title="Edit student"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>

                                                <button
                                                    onClick={() => handleSync(student)}
                                                    disabled={syncingStudents.has(student._id)}
                                                    className="p-2 text-gray-400 hover:text-success-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
                                                    title="Sync Codeforces data"
                                                >
                                                    <RefreshCw className={`w-4 h-4 ${syncingStudents.has(student._id) ? 'animate-spin' : ''}`} />
                                                </button>

                                                <button
                                                    onClick={() => handleDelete(student)}
                                                    className="p-2 text-gray-400 hover:text-error-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                                    title="Delete student"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Delete confirmation dialog */}
            <ConfirmDialog
                isOpen={deleteConfirm.show}
                onClose={() => setDeleteConfirm({ show: false, student: null })}
                onConfirm={confirmDelete}
                title="Delete Student"
                message={`Are you sure you want to delete ${deleteConfirm.student?.name}? This action cannot be undone.`}
                confirmText="Delete"
                confirmButtonClass="btn-danger"
            />
        </div>
    );
};

export default StudentTable;