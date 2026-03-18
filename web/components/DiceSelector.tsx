'use client';

const DIE_TYPES = ['d4', 'd6', 'd8', 'd10', 'd12', 'd20'] as const;
export type DieType = (typeof DIE_TYPES)[number];

interface DiceSelectorProps {
    selected: DieType;
    onChange: (die: DieType) => void;
    disabled?: boolean;
}

export default function DiceSelector({ selected, onChange, disabled }: DiceSelectorProps) {
    return (
        <div className="flex flex-col gap-3 w-full">
            <p
                className="text-xs font-semibold uppercase tracking-widest mb-1"
                style={{ color: 'var(--color-muted)' }}
            >
                Select Die
            </p>
            {DIE_TYPES.map((die) => {
                const isActive = die === selected;
                return (
                    <button
                        key={die}
                        onClick={() => onChange(die)}
                        disabled={disabled}
                        className="relative w-full py-3 rounded-xl text-sm font-semibold tracking-wide transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                            background: isActive
                                ? 'var(--color-die-active)'
                                : 'var(--color-die-idle)',
                            color: isActive ? '#0A0924' : 'var(--color-text)',
                            border: `1px solid ${isActive ? 'var(--color-die-active)' : 'var(--color-panel-border)'}`,
                            boxShadow: isActive
                                ? '0 0 16px var(--color-panel-glow)'
                                : 'none',
                        }}
                    >
                        {die.toUpperCase()}
                    </button>
                );
            })}
        </div>
    );
}
