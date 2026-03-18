'use client';

interface RollResultProps {
    result: number | null;
    dieType: string;
    rolledAt: string | null;
}

export default function RollResult({ result, dieType, rolledAt }: RollResultProps) {
    return (
        <div className="flex flex-col items-center gap-2 py-4">
            <p
                className="text-xs font-semibold uppercase tracking-widest"
                style={{ color: 'var(--color-muted)' }}
            >
                {result !== null ? `Last roll · ${dieType.toUpperCase()}` : 'No roll yet'}
            </p>
            <div
                className="w-24 h-24 rounded-2xl flex items-center justify-center text-5xl font-bold transition-all duration-300"
                style={{
                    background: result !== null
                        ? 'linear-gradient(135deg, var(--color-senary), var(--color-quaternary))'
                        : 'var(--color-die-idle)',
                    border: '1px solid var(--color-panel-border)',
                    boxShadow: result !== null ? '0 0 32px var(--color-panel-glow)' : 'none',
                    color: result !== null ? '#0A0924' : 'var(--color-muted)',
                }}
            >
                {result !== null ? result : '—'}
            </div>
            {rolledAt && (
                <p
                    className="text-xs"
                    style={{ color: 'var(--color-muted)' }}
                >
                    {new Date(rolledAt).toLocaleTimeString()}
                </p>
            )}
        </div>
    );
}
