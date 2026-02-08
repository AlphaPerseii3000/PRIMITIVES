import { useState, useEffect } from 'react';
import { useTone } from '../../engine/audio';
import './LoadingScreen.css';

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
            className={isFading ? 'fading' : ''}
            style={{
                opacity: isFading ? 0 : 1,
                pointerEvents: isFading ? 'none' : 'auto',
            }}
        >
            <h1>PRIMITIVES</h1>
            <p>Click anywhere to start</p>
        </div>
    );
}
