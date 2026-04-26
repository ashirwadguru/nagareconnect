import { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { getMapComplaints } from '../../services/complaintService';
import { Link } from 'react-router-dom';

const containerStyle = { width: '100%', height: '100%' };
const defaultCenter = { lat: 19.076, lng: 72.8777 };
const statusColors = { pending: '#fdcb6e', in_progress: '#74b9ff', resolved: '#00b894', rejected: '#ff7675' };
const LIBRARIES = [];

const MapView = ({ role = 'citizen' }) => {
  const [complaints, setComplaints] = useState([]);
  const [selected, setSelected] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [center, setCenter] = useState(defaultCenter);
  const [filter, setFilter] = useState('all');
  const [mapError, setMapError] = useState(null);
  const [locLoading, setLocLoading] = useState(false);
  const [locError, setLocError]   = useState('');
  const mapRef = useRef(null);
  const onMapLoad = useCallback(map => { mapRef.current = map; }, []);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey,
    libraries: LIBRARIES,
  });

  useEffect(() => {
    getMapComplaints().then(r => setComplaints(r.data)).catch(() => {});
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserLocation(loc);
          setCenter(loc);
        },
        () => {}
      );
    }
  }, []);

  const goToMyLocation = () => {
    setLocError('');
    if (!navigator.geolocation) { setLocError('Geolocation not supported'); return; }
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(loc);
        setLocLoading(false);
        if (mapRef.current) {
          mapRef.current.panTo(loc);
          mapRef.current.setZoom(15);
        } else {
          setCenter(loc);
        }
      },
      () => { setLocError('Location access denied'); setLocLoading(false); },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const filtered = filter === 'all' ? complaints : complaints.filter(c => c.status === filter);

  if (!apiKey) {
    return (
      <div className="page-wrapper">
        <div className="alert alert-info" style={{ marginBottom: '16px' }}>
          🗺️ Google Maps API key not configured. Set <code>VITE_GOOGLE_MAPS_API_KEY</code> in <code>frontend/.env</code>.
        </div>
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: '16px' }}>📍 Complaint Locations (List View)</h3>
          {filtered.map(c => (
            <div key={c.id} style={{ display: 'flex', gap: '12px', padding: '10px 0', borderBottom: '1px solid var(--border-light)', alignItems: 'center' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: statusColors[c.status], flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: 600 }}>{c.title}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{c.address || `${c.lat}, ${c.lng}`}</div>
              </div>
              <span className={`badge badge-${c.status}`}>{c.status.replace('_', ' ')}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="page-wrapper">
        <div className="alert alert-error" style={{ marginBottom: '16px' }}>
          ⚠️ Google Maps failed to load. Please ensure:
          <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
            <li>Your API key is valid</li>
            <li><strong>Maps JavaScript API</strong> is enabled in Google Cloud Console</li>
            <li>Billing is enabled on your Google Cloud project</li>
          </ul>
        </div>
        <div className="card">
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            Go to: <a href="https://console.cloud.google.com/apis/library/maps-backend.googleapis.com" target="_blank" style={{ color: 'var(--primary)' }}>
              Enable Maps JavaScript API →
            </a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', padding: '24px', gap: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 800 }}>🗺️ Complaints Map</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{filtered.length} complaints shown</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {['all', 'pending', 'in_progress', 'resolved'].map(s => (
            <button key={s} onClick={() => setFilter(s)} className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-ghost'}`}>
              {s === 'all' ? 'All' : s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border)' }}>
        {!isLoaded ? (
          <div className="spinner-overlay" style={{ height: '100%' }}><div className="spinner" /></div>
        ) : (
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={13}
            onLoad={onMapLoad}
            options={{
              styles: darkMapStyle,
              zoomControl: true,
              mapTypeControl: false,
              streetViewControl: false,
              fullscreenControl: true,
            }}
          >
            {/* User location marker */}
            {userLocation && (
              <Marker
                position={userLocation}
                title="📍 Your Location"
                icon={{
                  path: window.google.maps.SymbolPath.CIRCLE,
                  scale: 10,
                  fillColor: '#00b894',
                  fillOpacity: 1,
                  strokeColor: '#ffffff',
                  strokeWeight: 3,
                }}
              />
            )}

            {/* Complaint markers */}
            {filtered.map(c => (
              <Marker
                key={c.id}
                position={{ lat: parseFloat(c.lat), lng: parseFloat(c.lng) }}
                onClick={() => setSelected(c)}
                icon={{
                  path: window.google.maps.SymbolPath.CIRCLE,
                  scale: 8,
                  fillColor: statusColors[c.status] || '#999',
                  fillOpacity: 0.9,
                  strokeColor: '#ffffff',
                  strokeWeight: 2,
                }}
              />
            ))}

            {/* Info window */}
            {selected && (
              <InfoWindow
                position={{ lat: parseFloat(selected.lat), lng: parseFloat(selected.lng) }}
                onCloseClick={() => setSelected(null)}
              >
                <div style={{ padding: '4px', maxWidth: '240px' }}>
                  <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '4px', color: '#1a2332' }}>{selected.title}</div>
                  {selected.address && <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>{selected.address.substring(0, 80)}</div>}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{
                      fontSize: '11px', fontWeight: 700, padding: '2px 8px',
                      borderRadius: '999px',
                      background: statusColors[selected.status] + '25',
                      color: statusColors[selected.status],
                      border: `1px solid ${statusColors[selected.status]}50`,
                      textTransform: 'capitalize',
                    }}>
                      {selected.status.replace('_', ' ')}
                    </span>
                    {role === 'citizen' && (
                      <Link to={`/citizen/complaints/${selected.id}`} style={{ fontSize: '12px', color: '#00897b', fontWeight: 600 }}>View →</Link>
                    )}
                    {role === 'worker' && (
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${selected.lat},${selected.lng}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ fontSize: '12px', color: '#00897b', fontWeight: 600 }}
                      >
                        Navigate →
                      </a>
                    )}
                  </div>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>

            {/* ── My Location FAB ── */}
            <button
              onClick={goToMyLocation}
              disabled={locLoading}
              title="Go to my location"
              style={{
                position: 'absolute',
                bottom: 80,
                right: 12,
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: locLoading ? '#1a2a3a' : '#0d1b2a',
                border: '2px solid #22c55e',
                boxShadow: '0 0 0 3px rgba(34,197,94,0.2), 0 4px 18px rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: locLoading ? 'wait' : 'pointer',
                zIndex: 10,
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.08)'; e.currentTarget.style.boxShadow = '0 0 0 5px rgba(34,197,94,0.3), 0 6px 24px rgba(0,0,0,0.6)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(34,197,94,0.2), 0 4px 18px rgba(0,0,0,0.5)'; }}
            >
              {locLoading ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="#22c55e" strokeWidth="2" strokeDasharray="31.4" strokeDashoffset="10">
                    <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.8s" repeatCount="indefinite" />
                  </circle>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3" fill="#22c55e" />
                  <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
                  <circle cx="12" cy="12" r="7" />
                </svg>
              )}
            </button>
            {locError && (
              <div style={{ position: 'absolute', bottom: 132, right: 12, background: '#1a0a0a', border: '1px solid #ef444455', borderRadius: 8, padding: '6px 12px', fontSize: 11, color: '#ef4444', whiteSpace: 'nowrap', zIndex: 10 }}>
                ⚠️ {locError}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
        {Object.entries(statusColors).map(([s, c]) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: c, flexShrink: 0 }} />
            <span style={{ textTransform: 'capitalize' }}>{s.replace('_', ' ')}</span>
          </div>
        ))}
        {userLocation && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#00b894', border: '2px solid white', flexShrink: 0 }} />
            <span>Your Location</span>
          </div>
        )}
        <div style={{ marginLeft: 'auto', fontSize: '12px', color: 'var(--text-muted)' }}>
          Click any marker for details
        </div>
      </div>
    </div>
  );
};

const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#1d2c3e' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8b949e' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1d2c3e' }] },
  { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#30405a' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#243447' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#1d2c3e' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#2d4060' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0d1117' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#4a6280' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
];

export default MapView;
