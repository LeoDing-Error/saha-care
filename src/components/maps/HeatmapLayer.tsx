import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import type { Report } from '../../types';

// leaflet.heat is a CJS side-effect plugin that attaches to window.L.
// Set global L before importing so it can find and augment it.
(window as any).L = L;
import('leaflet.heat');

interface HeatmapLayerProps {
    reports: Report[];
}

export default function HeatmapLayer({ reports }: HeatmapLayerProps) {
    const map = useMap();
    const layerRef = useRef<L.Layer | null>(null);

    useEffect(() => {
        if (layerRef.current) {
            map.removeLayer(layerRef.current);
            layerRef.current = null;
        }

        if (reports.length === 0) return;

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
        layerRef.current = heat;

        return () => {
            if (layerRef.current) {
                map.removeLayer(layerRef.current);
                layerRef.current = null;
            }
        };
    }, [map, reports]);

    return null;
}
