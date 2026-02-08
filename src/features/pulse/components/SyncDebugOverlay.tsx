import { useSyncStore } from '../stores/sync.store';
import { Html } from '@react-three/drei';
import { useControls } from 'leva';
import { SYNC_HISTORY_SIZE } from '../stores/sync.store';

// thresholds from AC
export const THRESHOLD_PERFECT = 30;
export const THRESHOLD_GOOD = 60;

export const SyncDebugOverlay = () => {
    const { currentDelta, averageDelta, maxDelta, minDelta, history } = useSyncStore();

    const { showDebug } = useControls('Sync Debug', {
        showDebug: false
    });

    if (!showDebug) return null;

    // Color coding based on delta (thresholds from AC)
    // Green <= 30ms, Yellow <= 60ms, Red > 60ms
    const getColor = (val: number) => {
        const absVal = Math.abs(val);
        if (absVal <= THRESHOLD_PERFECT) return '#4ade80'; // Green
        if (absVal <= THRESHOLD_GOOD) return '#facc15'; // Yellow
        return '#ef4444'; // Red
    };

    return (
        <Html position={[0, 0, 0]} fullscreen style={{ pointerEvents: 'none' }}>
            <div style={{
                position: 'absolute',
                top: 20,
                right: 20,
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: '12px',
                borderRadius: '8px',
                fontFamily: 'monospace',
                color: 'white',
                minWidth: '200px',
                pointerEvents: 'auto'
            }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', borderBottom: '1px solid #444' }}>AVG Sync Delta</h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', fontSize: '12px' }}>
                    <span>Current:</span>
                    <span style={{ color: getColor(currentDelta), textAlign: 'right' }}>
                        {currentDelta.toFixed(1)}ms
                    </span>

                    <span>Average ({SYNC_HISTORY_SIZE}):</span>
                    <span style={{ color: getColor(averageDelta), textAlign: 'right' }}>
                        {averageDelta.toFixed(1)}ms
                    </span>

                    <span>Max:</span>
                    <span style={{ color: getColor(maxDelta), textAlign: 'right' }}>
                        {maxDelta.toFixed(1)}ms
                    </span>

                    <span>Min:</span>
                    <span style={{ color: getColor(minDelta), textAlign: 'right' }}>
                        {minDelta.toFixed(1)}ms
                    </span>
                </div>

                <div style={{ marginTop: '8px', height: '30px', display: 'flex', alignItems: 'flex-end', gap: '1px' }}>
                    {history.map((d, i) => (
                        <div key={i} style={{
                            width: '4px',
                            height: `${Math.min(Math.abs(d), 30)}px`,
                            backgroundColor: getColor(d),
                            opacity: 0.8
                        }} />
                    ))}
                </div>
            </div>
        </Html>
    );
};
