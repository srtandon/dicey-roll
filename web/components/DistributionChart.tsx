'use client';

import {
    Bar,
    BarChart,
    BarRectangleItem,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

interface BarEntry {
    face: number;
    count: number;
}

interface CustomBarProps {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    face?: number;
    lastResult: number | null;
}

function CustomBar({ x = 0, y = 0, width = 0, height = 0, face, lastResult }: CustomBarProps) {
    if (width <= 0 || height <= 0) return null;
    const r = Math.min(3, width / 2);
    const fill = face === lastResult
        ? 'var(--color-chart-bar)'
        : 'var(--color-chart-bar-dim)';
    const d = [
        `M ${x + r} ${y}`,
        `H ${x + width - r}`,
        `A ${r} ${r} 0 0 1 ${x + width} ${y + r}`,
        `V ${y + height}`,
        `H ${x}`,
        `V ${y + r}`,
        `A ${r} ${r} 0 0 1 ${x + r} ${y}`,
        'Z',
    ].join(' ');
    return <path d={d} fill={fill} />;
}

interface DistributionChartProps {
    distribution: Record<string, number>;
    dieType: string;
    lastResult: number | null;
}

export default function DistributionChart({
    distribution,
    dieType,
    lastResult,
}: DistributionChartProps) {
    const sides = parseInt(dieType.replace('d', ''), 10);
    const data: BarEntry[] = Array.from({ length: sides }, (_, i) => {
        const face = String(i + 1);
        return { face: i + 1, count: distribution[face] ?? 0 };
    });

    const totalRolls = data.reduce((sum, d) => sum + d.count, 0);

    return (
        <div className="flex flex-col gap-3 h-full">
            <div className="flex items-center justify-between">
                <p
                    className="text-xs font-semibold uppercase tracking-widest"
                    style={{ color: 'var(--color-muted)' }}
                >
                    Distribution · {dieType.toUpperCase()}
                </p>
                {totalRolls > 0 && (
                    <span
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{
                            background: 'var(--color-die-idle)',
                            color: 'var(--color-senary)',
                            border: '1px solid var(--color-divider)',
                        }}
                    >
                        {totalRolls} roll{totalRolls !== 1 ? 's' : ''}
                    </span>
                )}
            </div>

            {totalRolls === 0 ? (
                <div
                    className="flex-1 flex items-center justify-center rounded-xl text-sm"
                    style={{
                        background: 'var(--color-die-idle)',
                        border: '1px solid var(--color-divider)',
                        color: 'var(--color-muted)',
                    }}
                >
                    Roll the {dieType.toUpperCase()} to see results
                </div>
            ) : (
                <div className="flex-1 min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={data}
                            margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
                        >
                            <XAxis
                                dataKey="face"
                                tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }}
                                axisLine={{ stroke: 'rgba(45,164,168,0.2)' }}
                                tickLine={false}
                            />
                            <YAxis
                                tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }}
                                axisLine={false}
                                tickLine={false}
                                allowDecimals={false}
                            />
                            <Tooltip
                                cursor={{ fill: 'rgba(45,164,168,0.08)' }}
                                contentStyle={{
                                    background: '#1E1C46',
                                    border: '1px solid rgba(45,164,168,0.35)',
                                    borderRadius: '8px',
                                    color: '#fff',
                                    fontSize: '12px',
                                }}
                                formatter={(value) => [value, 'rolls']}
                                labelFormatter={(label) => `Face ${label}`}
                            />
                            <Bar
                                dataKey="count"
                                shape={(props: BarRectangleItem) => (
                                    <CustomBar
                                        x={props.x}
                                        y={props.y}
                                        width={props.width}
                                        height={props.height}
                                        face={(props as BarRectangleItem & BarEntry).face}
                                        lastResult={lastResult}
                                    />
                                )}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
}
