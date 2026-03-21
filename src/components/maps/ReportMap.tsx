import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './leafletSetup';
import { GAZA_CENTER, GAZA_ZOOM } from './leafletSetup';
import { useDashboard } from '../../hooks/useDashboard';
import HeatmapLayer from './HeatmapLayer';
import HeatmapLegend from './HeatmapLegend';
import ChartWrapper from '../charts/ChartWrapper';

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
