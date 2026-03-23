import { CircleMarker, Popup } from 'react-leaflet';
import type { Report } from '../../types';

// Consistent color palette for diseases
const DISEASE_COLORS: Record<string, string> = {
    'Acute Watery Diarrhea': '#1976d2',
    'Bloody Diarrhea': '#d32f2f',
    'Acute Respiratory Infection': '#ed6c02',
    'Measles': '#9c27b0',
    'Meningitis': '#2e7d32',
    'Acute Jaundice Syndrome': '#f9a825',
    'Acute Flaccid Paralysis': '#00695c',
    'Neonatal Tetanus': '#5d4037',
};

const DEFAULT_COLORS = ['#0288d1', '#c62828', '#ef6c00', '#7b1fa2', '#388e3c', '#fbc02d', '#00796b', '#4e342e'];

export function getDiseaseColor(disease: string): string {
    if (DISEASE_COLORS[disease]) return DISEASE_COLORS[disease];
    // Deterministic fallback based on string hash
    let hash = 0;
    for (let i = 0; i < disease.length; i++) {
        hash = disease.charCodeAt(i) + ((hash << 5) - hash);
    }
    return DEFAULT_COLORS[Math.abs(hash) % DEFAULT_COLORS.length];
}

const STATUS_BADGE_CLASS: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-800 border border-amber-300',
    verified: 'bg-green-100 text-green-800 border border-green-300',
    rejected: 'bg-red-100 text-red-800 border border-red-300',
};

interface DiseaseMarkerProps {
    report: Report;
}

export default function DiseaseMarker({ report }: DiseaseMarkerProps) {
    const color = getDiseaseColor(report.disease);

    return (
        <CircleMarker
            center={[report.location.lat, report.location.lng]}
            radius={8}
            pathOptions={{ color, fillColor: color, fillOpacity: 0.7, weight: 2 }}
        >
            <Popup>
                <div className="min-w-[160px]">
                    <p className="text-sm font-semibold">{report.disease}</p>
                    <p className="text-xs text-gray-500 block">{report.createdAt.toLocaleDateString()}</p>
                    <span
                        className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE_CLASS[report.status] || 'bg-gray-100 text-gray-700 border border-gray-300'}`}
                    >
                        {report.status}
                    </span>
                    {report.location.name && (
                        <p className="text-xs block mt-1">{report.location.name}</p>
                    )}
                </div>
            </Popup>
        </CircleMarker>
    );
}
