'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import DiceSelector, { DieType } from '@/components/DiceSelector';
import RollResult from '@/components/RollResult';
import DistributionChart from '@/components/DistributionChart';
import DiceAnimation from '@/components/dice-animation';

const API_BASE = '/api/v1/dice-rtr';

// ─── API types ──────────────────────────────────────────────────────────────

interface SessionResponse {
    sessionId: string;
    createdAt: string;
}

interface RollResponse {
    dieType: string;
    result: number;
    id: string;
    sessionId: string;
    createdAt: string;
}

interface DieStats {
    count: number;
    average: number;
    min: number;
    max: number;
    distribution: Record<string, number>;
}

interface StatsResponse {
    totalRolls: number;
    byDieType: Record<string, DieStats>;
}

type StatsScope = 'all' | 'session';

// ─── API helpers ─────────────────────────────────────────────────────────────

async function createSession(): Promise<SessionResponse> {
    const res = await fetch(`${API_BASE}/session`, { method: 'POST' });
    if (!res.ok) throw new Error(`Session creation failed: ${res.status}`);
    return res.json();
}

async function postRoll(dieType: DieType, sessionId: string): Promise<RollResponse> {
    const res = await fetch(`${API_BASE}/roll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dieType, sessionId }),
    });
    if (!res.ok) throw new Error(`Roll failed: ${res.status}`);
    return res.json();
}

async function fetchStats(scope: StatsScope, sessionId: string | null): Promise<StatsResponse> {
    const params = new URLSearchParams({ scope });
    if (scope === 'session' && sessionId) params.set('sessionId', sessionId);
    const res = await fetch(`${API_BASE}/stats?${params}`);
    if (!res.ok) throw new Error(`Stats failed: ${res.status}`);
    return res.json();
}

// ─── Compact session-id display ──────────────────────────────────────────────

function shortId(id: string) {
    return id.slice(0, 8).toUpperCase();
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function Home() {
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [sessionCreatedAt, setSessionCreatedAt] = useState<string | null>(null);
    const [creatingSession, setCreatingSession] = useState(false);
    const [sessionError, setSessionError] = useState<string | null>(null);

    const [selectedDie, setSelectedDie] = useState<DieType>('d6');
    const [lastResult, setLastResult] = useState<number | null>(null);
    const [lastRollAt, setLastRollAt] = useState<string | null>(null);
    const [isRolling, setIsRolling] = useState(false);
    const [rollTrigger, setRollTrigger] = useState(0);
    const [rollError, setRollError] = useState<string | null>(null);

    const [statsScope, setStatsScope] = useState<StatsScope>('all');
    const [stats, setStats] = useState<StatsResponse | null>(null);
    const [statsError, setStatsError] = useState(false);

    const animationTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const sides = parseInt(selectedDie.replace('d', ''), 10);
    const distribution = stats?.byDieType[selectedDie]?.distribution ?? {};
    const canRoll = !!sessionId && !isRolling;

    // Load stats whenever scope or sessionId changes
    const loadStats = useCallback(async () => {
        try {
            const data = await fetchStats(statsScope, sessionId);
            setStats(data);
            setStatsError(false);
        } catch {
            setStatsError(true);
        }
    }, [statsScope, sessionId]);

    useEffect(() => {
        loadStats();
    }, [loadStats]);

    // Create session
    const handleCreateSession = async () => {
        setCreatingSession(true);
        setSessionError(null);
        setLastResult(null);
        setLastRollAt(null);
        try {
            const data = await createSession();
            setSessionId(data.sessionId);
            setSessionCreatedAt(data.createdAt);
            // Switch to session scope so the chart tracks the new session immediately
            setStatsScope('session');
        } catch (err) {
            setSessionError(err instanceof Error ? err.message : 'Failed to create session');
        } finally {
            setCreatingSession(false);
        }
    };

    // Roll dice
    const handleRoll = async () => {
        if (!canRoll) return;
        setRollError(null);
        setIsRolling(true);
        setRollTrigger((t) => t + 1);

        try {
            const data = await postRoll(selectedDie, sessionId!);
            if (animationTimer.current) clearTimeout(animationTimer.current);
            // Let animation play (~900 ms) then reveal result and refresh chart
            animationTimer.current = setTimeout(() => {
                setLastResult(data.result);
                setLastRollAt(data.createdAt);
                setIsRolling(false);
                loadStats();
            }, 900);
        } catch (err) {
            setRollError(err instanceof Error ? err.message : 'Roll failed');
            setIsRolling(false);
        }
    };

    const handleDieChange = (die: DieType) => {
        if (!isRolling) {
            setSelectedDie(die);
            setLastResult(null);
            setLastRollAt(null);
        }
    };

    const handleScopeChange = (scope: StatsScope) => {
        if (scope === 'session' && !sessionId) return;
        setStatsScope(scope);
    };

    return (
        <main
            className="min-h-screen flex items-center justify-center p-4"
            style={{ background: 'var(--color-background)' }}
        >
            {/* Radial glow */}
            <div
                className="fixed inset-0 pointer-events-none"
                style={{
                    background:
                        'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(45,164,168,0.07) 0%, transparent 70%)',
                }}
            />

            {/* Main card */}
            <div
                className="relative w-full max-w-4xl rounded-3xl overflow-hidden"
                style={{
                    background: 'var(--color-panel)',
                    border: '1px solid var(--color-panel-border)',
                    boxShadow: '0 0 60px var(--color-panel-glow), 0 24px 80px rgba(0,0,0,0.6)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                }}
            >
                {/* ── Header ── */}
                <div
                    className="px-6 py-4 flex items-center justify-between gap-4 flex-wrap"
                    style={{ borderBottom: '1px solid var(--color-divider)' }}
                >
                    {/* Title */}
                    <h1
                        className="text-xl font-bold tracking-tight shrink-0"
                        style={{ color: 'var(--color-senary)' }}
                    >
                        Dice Roller
                    </h1>

                    {/* Session section */}
                    <div className="flex items-center gap-3 flex-wrap">
                        {sessionId ? (
                            <div
                                className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs"
                                style={{
                                    background: 'var(--color-die-idle)',
                                    border: '1px solid var(--color-panel-border)',
                                }}
                            >
                                <span
                                    className="w-1.5 h-1.5 rounded-full shrink-0"
                                    style={{ background: 'var(--color-senary)' }}
                                />
                                <span style={{ color: 'var(--color-muted)' }}>Session</span>
                                <span
                                    className="font-mono font-semibold"
                                    style={{ color: 'var(--color-text)' }}
                                    title={sessionId}
                                >
                                    {shortId(sessionId)}
                                </span>
                                {sessionCreatedAt && (
                                    <span style={{ color: 'var(--color-muted)' }}>
                                        · {new Date(sessionCreatedAt).toLocaleTimeString()}
                                    </span>
                                )}
                            </div>
                        ) : (
                            <span
                                className="text-xs px-3 py-1.5 rounded-xl"
                                style={{
                                    background: 'var(--color-die-idle)',
                                    color: 'var(--color-muted)',
                                    border: '1px dashed var(--color-divider)',
                                }}
                            >
                                No active session
                            </span>
                        )}

                        <button
                            onClick={handleCreateSession}
                            disabled={creatingSession}
                            className="px-4 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{
                                background: 'var(--color-die-idle)',
                                color: 'var(--color-senary)',
                                border: '1px solid var(--color-panel-border)',
                            }}
                        >
                            {creatingSession ? 'Creating…' : sessionId ? 'New Session' : 'Create Session'}
                        </button>

                        {sessionError && (
                            <span className="text-xs text-red-400">{sessionError}</span>
                        )}

                        {stats && (
                            <span
                                className="text-xs px-3 py-1 rounded-full"
                                style={{
                                    background: 'var(--color-die-idle)',
                                    color: 'var(--color-muted)',
                                    border: '1px solid var(--color-divider)',
                                }}
                            >
                                {stats.totalRolls.toLocaleString()} {statsScope === 'session' ? 'session' : 'total'} rolls
                            </span>
                        )}
                    </div>
                </div>

                {/* ── Three-column body ── */}
                <div className="flex" style={{ minHeight: '520px' }}>
                    {/* Left: Die selector */}
                    <div
                        className="w-36 shrink-0 p-5 flex flex-col"
                        style={{ borderRight: '1px solid var(--color-divider)' }}
                    >
                        <DiceSelector
                            selected={selectedDie}
                            onChange={handleDieChange}
                            disabled={isRolling}
                        />
                    </div>

                    {/* Centre: animation + result + roll button */}
                    <div className="flex-1 flex flex-col items-center justify-between p-6 gap-4">
                        {/* 3D Dice */}
                        <div className="flex-1 w-full flex items-center justify-center">
                            <DiceAnimation
                                sides={sides}
                                result={lastResult}
                                isRolling={isRolling}
                                rollTrigger={rollTrigger}
                            />
                        </div>

                        {/* Result badge */}
                        <RollResult
                            result={lastResult}
                            dieType={selectedDie}
                            rolledAt={lastRollAt}
                        />

                        {rollError && (
                            <p className="text-xs text-red-400 text-center">{rollError}</p>
                        )}

                        {/* Roll button */}
                        <div className="flex flex-col items-center gap-2 w-full">
                            {!sessionId && (
                                <p
                                    className="text-xs text-center"
                                    style={{ color: 'var(--color-muted)' }}
                                >
                                    Create a session to start rolling
                                </p>
                            )}
                            <button
                                onClick={handleRoll}
                                disabled={!canRoll}
                                className="w-48 py-4 rounded-2xl text-base font-bold tracking-wide transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                style={{
                                    background: canRoll
                                        ? 'linear-gradient(135deg, var(--color-senary), var(--color-quaternary))'
                                        : 'var(--color-die-idle)',
                                    color: canRoll ? '#0A0924' : 'var(--color-muted)',
                                    boxShadow: canRoll && !isRolling ? '0 0 24px rgba(45,164,168,0.4)' : 'none',
                                    border: canRoll ? 'none' : '1px solid var(--color-divider)',
                                }}
                            >
                                {isRolling ? 'Rolling…' : `Roll ${selectedDie.toUpperCase()}`}
                            </button>
                        </div>
                    </div>

                    {/* Right: Distribution chart */}
                    <div
                        className="w-72 shrink-0 p-5 flex flex-col gap-3"
                        style={{ borderLeft: '1px solid var(--color-divider)' }}
                    >
                        {/* Scope toggle */}
                        <div
                            className="flex rounded-xl overflow-hidden text-xs font-semibold"
                            style={{ border: '1px solid var(--color-divider)' }}
                        >
                            {(['all', 'session'] as StatsScope[]).map((scope) => {
                                const isActive = statsScope === scope;
                                const isDisabled = scope === 'session' && !sessionId;
                                return (
                                    <button
                                        key={scope}
                                        onClick={() => handleScopeChange(scope)}
                                        disabled={isDisabled}
                                        className="flex-1 py-1.5 transition-all duration-150 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                        style={{
                                            background: isActive ? 'var(--color-die-active)' : 'transparent',
                                            color: isActive ? '#0A0924' : 'var(--color-muted)',
                                        }}
                                    >
                                        {scope === 'all' ? 'All Rolls' : 'This Session'}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Chart */}
                        {statsError ? (
                            <div
                                className="flex-1 flex flex-col items-center justify-center gap-2 text-xs rounded-xl"
                                style={{
                                    background: 'var(--color-die-idle)',
                                    border: '1px solid var(--color-divider)',
                                    color: 'var(--color-muted)',
                                }}
                            >
                                <span>Could not load stats.</span>
                                <button
                                    onClick={loadStats}
                                    className="underline cursor-pointer"
                                    style={{ color: 'var(--color-senary)' }}
                                >
                                    Retry
                                </button>
                            </div>
                        ) : (
                            <DistributionChart
                                distribution={distribution}
                                dieType={selectedDie}
                                lastResult={lastResult}
                            />
                        )}

                        {/* Die stats summary */}
                        {stats?.byDieType[selectedDie] && (
                            <div
                                className="grid grid-cols-2 gap-2 text-xs rounded-xl p-3"
                                style={{
                                    background: 'var(--color-die-idle)',
                                    border: '1px solid var(--color-divider)',
                                }}
                            >
                                {[
                                    ['Rolls', stats.byDieType[selectedDie].count],
                                    ['Avg', stats.byDieType[selectedDie].average.toFixed(1)],
                                    ['Min', stats.byDieType[selectedDie].min],
                                    ['Max', stats.byDieType[selectedDie].max],
                                ].map(([label, value]) => (
                                    <div key={String(label)} className="flex flex-col">
                                        <span style={{ color: 'var(--color-muted)' }}>{label}</span>
                                        <span
                                            className="font-semibold"
                                            style={{ color: 'var(--color-octonary)' }}
                                        >
                                            {value}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
