import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import {
    Users,
    Settings,
    Sun,
    Moon,
    BarChart3,
    Code2,
    Menu,
    X
} from 'lucide-react';

const Layout = ({ children }) => {
    const { theme, toggleTheme } = useTheme();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = React.useState(false);

    const navigation = [
        {
            name: 'Dashboard',
            href: '/',
            icon: BarChart3,
            current: location.pathname === '/'
        },
        {
            name: 'Settings',
            href: '/settings',
            icon: Settings,
            current: location.pathname === '/settings'
        },
    ];

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Mobile sidebar backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={`  h-[100vh]
        fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
                <div className="flex items-center justify-between h-24 lg:h-[100px] px-6 bg-primary-600 dark:bg-primary-700">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-primary-500 rounded-lg">
                            <Code2 className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-white">
                            <h1 className="text-lg font-bold">Student Progress</h1>
                            <p className="text-xs text-primary-200">Management System</p>
                        </div>
                    </div>

                    {/* Mobile close button */}
                    <button
                        onClick={toggleSidebar}
                        className="lg:hidden p-2 text-white hover:bg-primary-500 rounded-lg"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <nav className="mt-8">
                    <div className="px-3 space-y-1">
                        {navigation.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`
                    group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200
                    ${item.current
                                            ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-200'
                                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
                                        }
                  `}
                                >
                                    <Icon className={`
                    mr-3 flex-shrink-0 h-5 w-5
                    ${item.current
                                            ? 'text-primary-600 dark:text-primary-300'
                                            : 'text-gray-400 group-hover:text-gray-500 dark:text-gray-400 dark:group-hover:text-gray-300'
                                        }
                  `} />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </div>
                </nav>

                {/* Theme toggle */}
                <div className="absolute bottom-4 left-0 right-0 px-3">
                    <button
                        onClick={toggleTheme}
                        className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white rounded-lg transition-colors duration-200"
                    >
                        {theme === 'dark' ? (
                            <Sun className="mr-3 h-5 w-5 text-gray-400" />
                        ) : (
                            <Moon className="mr-3 h-5 w-5 text-gray-400" />
                        )}
                        {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                    </button>
                </div>
            </div>

            {/* Main content */}
            <div className="">
                {/* Top bar */}
                <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
                        <button
                            onClick={toggleSidebar}
                            className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white rounded-lg"
                        >
                            <Menu className="w-5 h-5" />
                        </button>

                        <div className="flex items-center space-x-4">
                            <div className="hidden sm:block">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    {location.pathname === '/' && 'Dashboard'}
                                    {location.pathname.startsWith('/student/') && 'Student Details'}
                                    {location.pathname === '/settings' && 'Settings'}
                                </h2>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                                <Users className="w-4 h-4" />
                                <span className="hidden sm:inline">Codeforces Tracker</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Page content */}
                <main className="flex-1">
                    <div className="py-6">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            {children}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;