import { getDiseaseColor } from './DiseaseMarker';

interface MapLegendProps {
    diseases: string[];
}

export default function MapLegend({ diseases }: MapLegendProps) {
    return (
        <div className="absolute bottom-4 right-4 z-[1000] bg-white rounded-lg shadow p-3 border max-w-[200px]">
            <span className="text-xs font-semibold block mb-1">Diseases</span>
            {diseases.map((disease) => (
                <div key={disease} className="flex items-center gap-2 mb-0.5">
                    <div
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: getDiseaseColor(disease) }}
                    />
                    <span className="text-xs truncate">{disease}</span>
                </div>
            ))}
        </div>
    );
}
