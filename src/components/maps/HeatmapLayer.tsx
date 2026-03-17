import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';
import type { Report } from '../../types';

interface HeatmapLayerProps {
    reports: Report[];
}

export default function HeatmapLayer({ reports }: HeatmapLayerProps) {
    const map = useMap();

    useEffect(() => {
        // Build heat data: [lat, lng, intensity]
        // Weight by personsCount so clusters with more cases glow hotter
        const points: [number, number, number][] = reports.map((r) => [
            r.location.lat,
            r.location.lng,
            r.personsCount || 1,
        ]);

        const heat = (L as any).heatLayer(points, {
            radius: 25,
            blur: 15,
            maxZoom: 14,
            max: Math.max(...points.map((p) => p[2]), 1),
            gradient: {
                0.2: '#ffffb2',
                0.4: '#fecc5c',
                0.6: '#fd8d3c',
                0.8: '#f03b20',
                1.0: '#bd0026',
            },
        });

        heat.addTo(map);

        return () => {
            map.removeLayer(heat);
        };
    }, [map, reports]);

    return null;
}
