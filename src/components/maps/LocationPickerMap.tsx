import { useCallback, useMemo, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { Box, Button, Typography } from '@mui/material';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import CheckIcon from '@mui/icons-material/Check';
import 'leaflet/dist/leaflet.css';
import './leafletSetup';
import { GAZA_CENTER, GAZA_ZOOM } from './leafletSetup';
import { getCurrentPosition, getGeoErrorMessage } from '../../utils/location';
import type { ReportLocation } from '../../types';
import type { Marker as LeafletMarker } from 'leaflet';

interface LocationPickerMapProps {
    initialPosition?: { lat: number; lng: number };
    onLocationSelect: (location: ReportLocation) => void;
}

function ClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
    useMapEvents({
        click(e) {
            onMapClick(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
}

export default function LocationPickerMap({ initialPosition, onLocationSelect }: LocationPickerMapProps) {
    const [markerPos, setMarkerPos] = useState<{ lat: number; lng: number } | null>(
        initialPosition ?? null
    );
    const [gpsLoading, setGpsLoading] = useState(false);
    const [error, setError] = useState('');
    const markerRef = useRef<LeafletMarker>(null);

    const handleMapClick = useCallback((lat: number, lng: number) => {
        setMarkerPos({ lat, lng });
        setError('');
    }, []);

    const handleDragEnd = useCallback(() => {
        const marker = markerRef.current;
        if (marker) {
            const pos = marker.getLatLng();
            setMarkerPos({ lat: pos.lat, lng: pos.lng });
        }
    }, []);

    const handleGPS = async () => {
        setGpsLoading(true);
        setError('');
        const result = await getCurrentPosition();
        if (result.location) {
            setMarkerPos({ lat: result.location.lat, lng: result.location.lng });
        } else {
            setError(getGeoErrorMessage(result.error));
        }
        setGpsLoading(false);
    };

    const handleConfirm = () => {
        if (markerPos) {
            onLocationSelect({ lat: markerPos.lat, lng: markerPos.lng });
        }
    };

    const center = useMemo(() => {
        if (markerPos) return [markerPos.lat, markerPos.lng] as [number, number];
        return GAZA_CENTER;
    }, [markerPos]);

    return (
        <Box>
            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <Button
                    size="small"
                    variant="outlined"
                    startIcon={<MyLocationIcon />}
                    onClick={handleGPS}
                    disabled={gpsLoading}
                >
                    {gpsLoading ? 'Getting GPS\u2026' : 'Use Current GPS'}
                </Button>
                {markerPos && (
                    <Button
                        size="small"
                        variant="contained"
                        startIcon={<CheckIcon />}
                        onClick={handleConfirm}
                    >
                        Confirm Location
                    </Button>
                )}
            </Box>
            {error && (
                <Typography variant="body2" color="error" sx={{ mb: 1 }}>
                    {error}
                </Typography>
            )}
            <MapContainer
                center={center}
                zoom={markerPos ? 14 : GAZA_ZOOM}
                style={{ height: 300, width: '100%', borderRadius: 4 }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <ClickHandler onMapClick={handleMapClick} />
                {markerPos && (
                    <Marker
                        position={[markerPos.lat, markerPos.lng]}
                        draggable
                        ref={markerRef}
                        eventHandlers={{ dragend: handleDragEnd }}
                    />
                )}
            </MapContainer>
            {markerPos && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    Selected: {markerPos.lat.toFixed(6)}, {markerPos.lng.toFixed(6)}
                </Typography>
            )}
        </Box>
    );
}
