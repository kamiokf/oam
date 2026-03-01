'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '../context/AdminAuthContext';
import { Shield, Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [totpCode, setTotpCode] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [step, setStep] = useState<'credentials' | '2fa'>('credentials');
    const { login, isLoading } = useAdminAuth();
    const router = useRouter();

    const handleCredentials = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!email || !password) {
            setError('Please enter your email and password');
            return;
        }
        setStep('2fa');
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const result = await login(email, password, totpCode);
        if (result.success) {
            router.push('/dashboard');
        } else {
            setError(result.error || 'Login failed');
            if (result.error?.includes('email') || result.error?.includes('password')) {
                setStep('credentials');
            }
        }
    };

    return (
        <div
            style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--bg)',
                padding: 20,
            }}
        >
            <div
                style={{
                    width: '100%',
                    maxWidth: 420,
                    animation: 'slideUp 400ms ease',
                }}
            >
                {/* Brand */}
                <div style={{ textAlign: 'center', marginBottom: 36 }}>
                    <div
                        style={{
                            width: 64,
                            height: 64,
                            borderRadius: 16,
                            background: 'var(--primary-muted)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 16px',
                            boxShadow: 'var(--shadow-glow)',
                        }}
                    >
                        <Shield size={32} color="var(--primary)" />
                    </div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--primary)' }}>
                        One&apos;N&apos;Move
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 4 }}>
                        Admin Panel
                    </p>
                </div>

                {/* Login Card */}
                <div className="card" style={{ padding: 28 }}>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 4 }}>
                        {step === 'credentials' ? 'Sign In' : 'Two-Factor Authentication'}
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: 24 }}>
                        {step === 'credentials'
                            ? 'Enter your admin credentials to continue'
                            : 'Enter the 6-digit code from your authenticator app'}
                    </p>

                    {error && (
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                padding: '10px 14px',
                                background: 'var(--error-muted)',
                                borderRadius: 'var(--radius)',
                                marginBottom: 20,
                                fontSize: '0.82rem',
                                color: 'var(--error)',
                            }}
                        >
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    {step === 'credentials' ? (
                        <form onSubmit={handleCredentials}>
                            <div className="form-group">
                                <label className="form-label">Email Address</label>
                                <input
                                    type="email"
                                    className="form-input"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="admin@onenMove.jm"
                                    autoFocus
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Password</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        className="form-input"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        placeholder="••••••••••••"
                                        style={{ paddingRight: 42 }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{
                                            position: 'absolute',
                                            right: 12,
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            background: 'none',
                                            border: 'none',
                                            color: 'var(--text-muted)',
                                            cursor: 'pointer',
                                            padding: 0,
                                            display: 'flex',
                                        }}
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 8 }}>
                                Continue
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleLogin}>
                            <div className="form-group">
                                <label className="form-label">Authenticator Code</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={totpCode}
                                    onChange={e => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    placeholder="000000"
                                    maxLength={6}
                                    autoFocus
                                    style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.3em', fontWeight: 700 }}
                                />
                                <p className="form-hint">Enter any 6 digits for demo purposes</p>
                            </div>
                            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => { setStep('credentials'); setError(''); }}
                                    style={{ flex: 1 }}
                                >
                                    Back
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={isLoading || totpCode.length !== 6}
                                    style={{ flex: 2 }}
                                >
                                    {isLoading ? 'Signing in...' : 'Sign In'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                {/* Demo Credentials */}
                <div className="card" style={{ marginTop: 16, padding: 16 }}>
                    <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Demo Credentials
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {[
                            { email: 'admin@onenMove.jm', pass: 'Admin@12345!', role: 'Super Admin' },
                            { email: 'mod@onenMove.jm', pass: 'Mod@12345!', role: 'Moderator' },
                            { email: 'support@onenMove.jm', pass: 'Support@12345!', role: 'Support' },
                        ].map(cred => (
                            <button
                                key={cred.email}
                                onClick={() => { setEmail(cred.email); setPassword(cred.pass); setStep('credentials'); setError(''); }}
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '8px 12px',
                                    background: 'var(--surface-light)',
                                    border: '1px solid var(--border)',
                                    borderRadius: 'var(--radius)',
                                    cursor: 'pointer',
                                    color: 'var(--text-secondary)',
                                    fontSize: '0.78rem',
                                    transition: 'all var(--transition)',
                                    fontFamily: 'inherit',
                                }}
                            >
                                <span style={{ fontFamily: 'monospace' }}>{cred.email}</span>
                                <span className="badge badge-neutral" style={{ fontSize: '0.65rem' }}>{cred.role}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
