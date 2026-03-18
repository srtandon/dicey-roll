'use client';

import dynamic from 'next/dynamic';

// react-3d-dice uses Three.js (browser-only), so disable SSR and handle the
// CJS/ESM interop explicitly with .then(m => m.default ?? m).
const Dice3D = dynamic(
    () => import('react-3d-dice').then((m) => (m.default ?? m) as typeof m.default),
    {
        ssr: false,
        loading: () => (
            <div
                className="w-full h-full flex items-center justify-center text-sm"
                style={{ color: 'var(--color-muted)' }}
            >
                Loading…
            </div>
        ),
    }
);

interface DiceAnimationProps {
    sides: number;
    result: number | null;
    isRolling: boolean;
    rollTrigger: number;
}

export default function DiceAnimation({
    sides,
    result,
    isRolling,
    rollTrigger,
}: DiceAnimationProps) {
    const validSides = ([4, 6, 8, 10, 12, 20] as number[]).includes(sides) ? sides : 6;

    return (
        <div className="w-full flex items-center justify-center" style={{ height: 240 }}>
            <Dice3D
                sides={validSides}
                color="#2DA4A8"
                results={result !== null ? [result] : []}
                isRolling={isRolling}
                rollTrigger={rollTrigger}
                animationMode="full"
                height={220}
                style={{ width: '100%' }}
            />
        </div>
    );
}
