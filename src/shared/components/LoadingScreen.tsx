import { useState, useEffect } from 'react';
import { useTone } from '../../engine/audio';

export function LoadingScreen() {
    const { isReady, start } = useTone();
    const [shouldRender, setShouldRender] = useState(true);
    const [isFading, setIsFading] = useState(false);

    useEffect(() => {
        if (isReady) {
            setIsFading(true);
            const timer = setTimeout(() => {
                setShouldRender(false);
            }, 500); // Match transition duration
            return () => clearTimeout(timer);
        }
    }, [isReady]);

    if (!shouldRender) return null;

    return (
        <div
            id="loading-screen"
            onClick={start}
            style={{
                position: 'fixed',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#000',
                color: '#fff',
                zIndex: 1000,
                cursor: 'pointer',
                userSelect: 'none',
                opacity: isFading ? 0 : 1,
                pointerEvents: isFading ? 'none' : 'auto',
                transition: 'opacity 0.5s ease-out',
            }}
        >
            <h1 style={{ fontSize: '3rem', margin: '0 0 1rem 0', letterSpacing: '0.2em' }}>PRIMITIVES</h1>
            <p style={{ fontSize: '1.2rem', opacity: 0.7 }}>Click anywhere to start</p>
        </div>
    );
}
