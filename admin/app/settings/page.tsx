'use client';

import ProtectedLayout from '../components/ProtectedLayout';
import { useState } from 'react';
import { Save, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState<'general' | 'fees' | 'verification' | 'security'>('general');

    // Mock settings state
    const [settings, setSettings] = useState({
        platformName: "One'N'Move",
        supportEmail: 'support@onenmove.jm',
        supportPhone: '+1 (876) 555-0198',
        commissionRate: 15, // percentage
        minWithdrawal: 5000,
        lateCancelFee: 1500,
        docExpiryWarningDays: 30,
        autoSuspendExpiringDocs: false,
        requireAdmin2FA: true,
        sessionTimeoutMinutes: 30,
    });

    const [isSaving, setIsSaving] = useState(false);

    const handleSave = () => {
        setIsSaving(true);
        // Simulate API call
        setTimeout(() => {
            setIsSaving(false);
            toast.success('Settings saved successfully');
        }, 800);
    };

    const handleChange = (field: keyof typeof settings, value: string | number | boolean) => {
        setSettings(prev => ({ ...prev, [field]: value }));
    };

    return (
        <ProtectedLayout requirePermission="manageSettings">
            <div className="animate-in">
                <div className="page-header">
                    <div>
                        <h1>Platform Settings</h1>
                        <p>Global configuration and business rules for the platform.</p>
                    </div>
                </div>

                <div className="tabs" style={{ marginBottom: 24 }}>
                    <button
                        className={`tab ${activeTab === 'general' ? 'active' : ''}`}
                        onClick={() => setActiveTab('general')}
                    >
                        General
                    </button>
                    <button
                        className={`tab ${activeTab === 'fees' ? 'active' : ''}`}
                        onClick={() => setActiveTab('fees')}
                    >
                        Fees & Commission
                    </button>
                    <button
                        className={`tab ${activeTab === 'verification' ? 'active' : ''}`}
                        onClick={() => setActiveTab('verification')}
                    >
                        Verification Rules
                    </button>
                    <button
                        className={`tab ${activeTab === 'security' ? 'active' : ''}`}
                        onClick={() => setActiveTab('security')}
                    >
                        Security & Access
                    </button>
                </div>

                <div className="card" style={{ maxWidth: 800 }}>
                    <div className="card-header">
                        <h3>
                            {activeTab === 'general' && 'General Information'}
                            {activeTab === 'fees' && 'Financial Settings'}
                            {activeTab === 'verification' && 'Document & Verification Rules'}
                            {activeTab === 'security' && 'Admin Security Policies'}
                        </h3>
                    </div>

                    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 24 }}>
                        {activeTab === 'general' && (
                            <>
                                <div className="form-group">
                                    <label className="form-label">Platform Name</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={settings.platformName}
                                        onChange={e => handleChange('platformName', e.target.value)}
                                    />
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>
                                        The primary brand name displayed to users.
                                    </p>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                                    <div className="form-group">
                                        <label className="form-label">Support Email Address</label>
                                        <input
                                            type="email"
                                            className="form-input"
                                            value={settings.supportEmail}
                                            onChange={e => handleChange('supportEmail', e.target.value)}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Support Phone Number</label>
                                        <input
                                            type="tel"
                                            className="form-input"
                                            value={settings.supportPhone}
                                            onChange={e => handleChange('supportPhone', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        {activeTab === 'fees' && (
                            <>
                                <div style={{ background: 'var(--warning-muted)', border: '1px solid var(--warning-border)', padding: 16, borderRadius: 'var(--radius)', display: 'flex', gap: 12, marginBottom: 8 }}>
                                    <AlertTriangle size={20} color="var(--warning)" style={{ flexShrink: 0 }} />
                                    <div>
                                        <h4 style={{ color: 'var(--warning-text)', margin: '0 0 4px', fontSize: '0.9rem' }}>Proceed with caution</h4>
                                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>Changes to financial structures affect immediately all upcoming jobs and owner payouts.</p>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Platform Commission Rate (%)</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={settings.commissionRate}
                                        onChange={e => handleChange('commissionRate', Number(e.target.value))}
                                        min="0"
                                        max="100"
                                    />
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>
                                        Percentage taken by One'N'Move from owner earnings.
                                    </p>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                                    <div className="form-group">
                                        <label className="form-label">Minimum Withdrawal (J$)</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            value={settings.minWithdrawal}
                                            onChange={e => handleChange('minWithdrawal', Number(e.target.value))}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Late Cancellation Fee (J$)</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            value={settings.lateCancelFee}
                                            onChange={e => handleChange('lateCancelFee', Number(e.target.value))}
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        {activeTab === 'verification' && (
                            <>
                                <div className="form-group">
                                    <label className="form-label">Document Expiry Warning Threshold (Days)</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={settings.docExpiryWarningDays}
                                        onChange={e => handleChange('docExpiryWarningDays', Number(e.target.value))}
                                    />
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>
                                        How many days before expiration to alert the user automatically.
                                    </p>
                                </div>

                                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <input
                                        type="checkbox"
                                        id="autoSuspend"
                                        checked={settings.autoSuspendExpiringDocs}
                                        onChange={e => handleChange('autoSuspendExpiringDocs', e.target.checked)}
                                        style={{ width: 18, height: 18, accentColor: 'var(--primary)' }}
                                    />
                                    <label htmlFor="autoSuspend" style={{ fontWeight: 500, cursor: 'pointer' }}>
                                        Auto-suspend users with expired documents
                                    </label>
                                </div>
                            </>
                        )}

                        {activeTab === 'security' && (
                            <>
                                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <input
                                        type="checkbox"
                                        id="requireAdmin2FA"
                                        checked={settings.requireAdmin2FA}
                                        onChange={e => handleChange('requireAdmin2FA', e.target.checked)}
                                        style={{ width: 18, height: 18, accentColor: 'var(--primary)' }}
                                    />
                                    <label htmlFor="requireAdmin2FA" style={{ fontWeight: 500, cursor: 'pointer' }}>
                                        Require Two-Factor Authentication (2FA) for all Admins
                                    </label>
                                </div>

                                <div className="form-group" style={{ marginTop: 16 }}>
                                    <label className="form-label">Admin Session Timeout (Minutes)</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={settings.sessionTimeoutMinutes}
                                        onChange={e => handleChange('sessionTimeoutMinutes', Number(e.target.value))}
                                        min="5"
                                        max="1440"
                                    />
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>
                                        Automatically log out inactive administrator accounts.
                                    </p>
                                </div>
                            </>
                        )}

                        <div style={{ marginTop: 16, paddingTop: 20, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
                            <button
                                className="btn btn-primary"
                                onClick={handleSave}
                                disabled={isSaving}
                                style={{ minWidth: 140 }}
                            >
                                {isSaving ? 'Saving...' : <><Save size={16} /> Save Changes</>}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedLayout>
    );
}
