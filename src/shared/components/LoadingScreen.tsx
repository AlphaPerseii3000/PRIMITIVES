import { useState, useEffect } from 'react';
import { useTone } from '../../engine/audio';
import './LoadingScreen.css';

export function LoadingScreen() {
    const { isReady, start } = useTone();
    const [shouldRender, setShouldRender] = useState(true);
    const [isFading, setIsFading] = useState(false);

    useEffect(() => {
        if (isReady) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setIsFading(true);
        }
    }, [isReady]);

    useEffect(() => {
        if (isFading) {
            const timer = setTimeout(() => {
                setShouldRender(false);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [isFading]);

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
