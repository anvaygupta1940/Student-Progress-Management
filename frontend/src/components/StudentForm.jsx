import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { validateEmail, validatePhone, validateCodeforcesHandle } from '../utils/helpers';
import LoadingSpinner from './LoadingSpinner';

const StudentForm = ({
    isOpen,
    onClose,
    onSubmit,
    student = null,
    loading = false
}) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        codeforcesHandle: '',
        autoEmailEnabled: true
    });

    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    // Initialize form data when student changes
    useEffect(() => {
        if (student) {
            setFormData({
                name: student.name || '',
                email: student.email || '',
                phone: student.phone || '',
                codeforcesHandle: student.codeforcesHandle || '',
                autoEmailEnabled: student.autoEmailEnabled !== undefined ? student.autoEmailEnabled : true
            });
        } else {
            setFormData({
                name: '',
                email: '',
                phone: '',
                codeforcesHandle: '',
                autoEmailEnabled: true
            });
        }
        setErrors({});
        setTouched({});
    }, [student, isOpen]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleBlur = (e) => {
        const { name } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));
        validateField(name, formData[name]);
    };

    const validateField = (name, value) => {
        let error = '';

        switch (name) {
            case 'name':
                if (!value.trim()) {
                    error = 'Name is required';
                } else if (value.trim().length < 2) {
                    error = 'Name must be at least 2 characters';
                }
                break;

            case 'email':
                if (!value.trim()) {
                    error = 'Email is required';
                } else if (!validateEmail(value)) {
                    error = 'Please enter a valid email address';
                }
                break;

            case 'phone':
                if (!value.trim()) {
                    error = 'Phone number is required';
                } else if (!validatePhone(value)) {
                    error = 'Please enter a valid phone number';
                }
                break;

            case 'codeforcesHandle':

                if (!value.trim()) {
                    error = 'Codeforces handle is required';
                }
                // else if (!validateCodeforcesHandle(value)) {
                //     error = 'Handle must be 3-24 characters (letters, numbers, underscore only)';
                // }
                break;

            default:
                break;
        }

        setErrors(prev => ({ ...prev, [name]: error }));
        return !error;
    };

    const validateForm = () => {
        const fields = ['name', 'email', 'phone', 'codeforcesHandle'];
        let isValid = true;

        fields.forEach(field => {
            const fieldValid = validateField(field, formData[field]);
            if (!fieldValid) isValid = false;
        });

        return isValid;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Mark all fields as touched
        const allFields = ['name', 'email', 'phone', 'codeforcesHandle'];
        setTouched(allFields.reduce((acc, field) => ({ ...acc, [field]: true }), {}));

        if (validateForm()) {
            onSubmit(formData);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                {/* Background overlay */}
                <div
                    className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75"
                    onClick={onClose}
                />

                {/* Modal */}
                <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-2xl">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            {student ? 'Edit Student' : 'Add New Student'}
                        </h3>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Name */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Full Name *
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={`input ${errors.name && touched.name ? 'border-error-500 focus:border-error-500 focus:ring-error-500' : ''}`}
                                placeholder="Enter student's full name"
                            />
                            {errors.name && touched.name && (
                                <p className="mt-1 text-sm text-error-600 dark:text-error-400">{errors.name}</p>
                            )}
                        </div>

                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Email Address *
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={`input ${errors.email && touched.email ? 'border-error-500 focus:border-error-500 focus:ring-error-500' : ''}`}
                                placeholder="student@example.com"
                            />
                            {errors.email && touched.email && (
                                <p className="mt-1 text-sm text-error-600 dark:text-error-400">{errors.email}</p>
                            )}
                        </div>

                        {/* Phone */}
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Phone Number *
                            </label>
                            <input
                                type="tel"
                                id="phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={`input ${errors.phone && touched.phone ? 'border-error-500 focus:border-error-500 focus:ring-error-500' : ''}`}
                                placeholder="+1 (555) 123-4567"
                            />
                            {errors.phone && touched.phone && (
                                <p className="mt-1 text-sm text-error-600 dark:text-error-400">{errors.phone}</p>
                            )}
                        </div>

                        {/* Codeforces Handle */}
                        <div>
                            <label htmlFor="codeforcesHandle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Codeforces Handle *
                            </label>
                            <input
                                type="text"
                                id="codeforcesHandle"
                                name="codeforcesHandle"
                                value={formData.codeforcesHandle}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={`input ${errors.codeforcesHandle && touched.codeforcesHandle ? 'border-error-500 focus:border-error-500 focus:ring-error-500' : ''}`}
                                placeholder="username"
                            />
                            {errors.codeforcesHandle && touched.codeforcesHandle && (
                                <p className="mt-1 text-sm text-error-600 dark:text-error-400">{errors.codeforcesHandle}</p>
                            )}
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                This will be used to fetch data from Codeforces API
                            </p>
                        </div>

                        {/* Auto Email Toggle */}
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="autoEmailEnabled"
                                name="autoEmailEnabled"
                                checked={formData.autoEmailEnabled}
                                onChange={handleChange}
                                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                            />
                            <label htmlFor="autoEmailEnabled" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                                Enable automatic email reminders
                            </label>
                        </div>

                        {/* Buttons */}
                        <div className="flex items-center justify-end space-x-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="btn-secondary"
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn-primary"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <LoadingSpinner size="sm" className="mr-2" />
                                        {student ? 'Updating...' : 'Creating...'}
                                    </>
                                ) : (
                                    student ? 'Update Student' : 'Create Student'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default StudentForm;