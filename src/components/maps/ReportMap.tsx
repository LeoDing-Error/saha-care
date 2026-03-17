import { MapContainer, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useDashboard } from '../../hooks/useDashboard';
import HeatmapLayer from './HeatmapLayer';
import HeatmapLegend from './HeatmapLegend';
import ChartWrapper from '../charts/ChartWrapper';

// Fix Leaflet default marker icon paths for bundlers
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

// Gaza Strip center coordinates
const GAZA_CENTER: L.LatLngExpression = [31.45, 34.40];
const GAZA_ZOOM = 10;

export default function ReportMap() {
    const { filteredReports, loading } = useDashboard();

    const reportsWithLocation = filteredReports.filter(
        (r) => r.location && r.location.lat && r.location.lng
    );

    return (
        <ChartWrapper
            title="Disease Heatmap"
            loading={loading}
            isEmpty={reportsWithLocation.length === 0}
            height={400}
        >
            <div style={{ position: 'relative' }}>
                <MapContainer
                    center={GAZA_CENTER}
                    zoom={GAZA_ZOOM}
                    style={{ height: 400, width: '100%', borderRadius: 4 }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <HeatmapLayer reports={reportsWithLocation} />
                </MapContainer>
                <HeatmapLegend />
            </div>
        </ChartWrapper>
    );
}
