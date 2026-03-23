const GRADIENT_STOPS = [
    { color: '#bd0026', label: 'High' },
    { color: '#fd8d3c', label: '' },
    { color: '#fecc5c', label: 'Medium' },
    { color: '#ffffb2', label: 'Low' },
];

export default function HeatmapLegend() {
    return (
        <div className="absolute bottom-4 right-4 z-[1000] bg-white rounded-lg shadow p-3 border max-w-[160px]">
            <span className="text-xs font-semibold block mb-1">Case Intensity</span>
            <div className="flex items-stretch gap-2">
                <div
                    className="w-4 rounded"
                    style={{
                        background: `linear-gradient(to bottom, ${GRADIENT_STOPS.map((s) => s.color).join(', ')})`,
                    }}
                />
                <div className="flex flex-col justify-between">
                    {GRADIENT_STOPS.filter((s) => s.label).map((stop) => (
                        <span key={stop.label} className="text-xs">{stop.label}</span>
                    ))}
                </div>
            </div>
        </div>
    );
}
