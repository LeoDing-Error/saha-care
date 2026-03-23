import type { ReactNode } from 'react';

interface ChartWrapperProps {
    title: string;
    subtitle?: string;
    loading: boolean;
    height?: number;
    children: ReactNode;
    action?: ReactNode;
    isEmpty?: boolean;
}

export default function ChartWrapper({
    title,
    subtitle,
    loading,
    height = 300,
    children,
    action,
    isEmpty = false,
}: ChartWrapperProps) {
    return (
        <div className="bg-white rounded-lg shadow border h-full">
            <div className="p-4">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="text-base font-semibold">{title}</h3>
                        {subtitle && (
                            <p className="text-sm text-gray-500">{subtitle}</p>
                        )}
                    </div>
                    {action}
                </div>

                {loading ? (
                    <div
                        className="rounded bg-gray-200 animate-pulse"
                        style={{ height }}
                    />
                ) : isEmpty ? (
                    <div className="mt-2 flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
                        <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        No data available for the selected filters.
                    </div>
                ) : (
                    children
                )}
            </div>
        </div>
    );
}
