import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const COLORS = {
    bg: '#1A3C34',
    bgActive: '#163229',
    bgHover: 'rgba(255,255,255,0.08)',
    border: 'rgba(255,255,255,0.1)',
    textPrimary: '#FFFFFF',
    textMuted: 'rgba(255,255,255,0.7)',
}

const NAV_ITEMS = [
    { path: '/dashboard', icon: 'fa-house', label: 'Dashboard' },
    { path: '/transactions', icon: 'fa-arrow-right-arrow-left', label: 'Transactions' },
    { path: '/settings', icon: 'fa-sliders', label: 'Settings' },
]

const NavItem = ({ path, icon, label, collapsed, active, onClick }) => (
    <div
        onClick={() => onClick(path)}
        style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px 16px',
            cursor: 'pointer',
            borderLeft: active ? '3px solid #FFFFFF' : '3px solid transparent',
            backgroundColor: active ? COLORS.bgActive : 'transparent',
            borderRadius: '0 8px 8px 0',
            transition: 'background-color 0.15s',
            color: active ? COLORS.textPrimary : COLORS.textMuted,
        }}
        onMouseEnter={e => {
            if (!active) e.currentTarget.style.backgroundColor = COLORS.bgHover
        }}
        onMouseLeave={e => {
            if (!active) e.currentTarget.style.backgroundColor = 'transparent'
        }}
    >
        <i
            className={`fa-solid ${icon}`}
            style={{ fontSize: '16px', minWidth: '16px', textAlign: 'center' }}
        />
        {!collapsed && (
            <span style={{ fontSize: '14px', fontWeight: 500, whiteSpace: 'nowrap' }}>
                {label}
            </span>
        )}
    </div>
)

const Sidebar = ({ onCreateTransaction }) => {
    const [collapsed, setCollapsed] = useState(false)
    const navigate = useNavigate()
    const location = useLocation()
    const { signOut } = useAuth()

    const handleNavigate = (path) => {
        navigate(path)
    }

    const handleSignOut = async () => {
        await signOut()
        navigate('/login')
    }

    return (
        <div
            style={{
                width: collapsed ? '64px' : '240px',
                minHeight: '100vh',
                backgroundColor: COLORS.bg,
                display: 'flex',
                flexDirection: 'column',
                transition: 'width 0.2s ease',
                overflow: 'hidden',
                flexShrink: 0,
                borderRight: `1px solid ${COLORS.border}`,
            }}
        >
            {/* Top — logo and toggle */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: collapsed ? 'center' : 'space-between',
                    padding: '20px 16px',
                    borderBottom: `1px solid ${COLORS.border}`,
                }}
            >
                {!collapsed && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <i
                            className="fa-solid fa-gear"
                            style={{ color: COLORS.textPrimary, fontSize: '18px' }}
                        />
                        <span
                            style={{
                                color: COLORS.textPrimary,
                                fontWeight: 700,
                                fontSize: '18px',
                                letterSpacing: '-0.3px',
                            }}
                        >
                            Axle
                        </span>
                    </div>
                )}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: COLORS.textMuted,
                        cursor: 'pointer',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                    }}
                >
                    <i
                        className={`fa-solid ${collapsed ? 'fa-chevron-right' : 'fa-chevron-left'}`}
                        style={{ fontSize: '14px' }}
                    />
                </button>
            </div>

            {/* Middle — nav items */}
            <nav style={{ flex: 1, paddingTop: '12px' }}>
                {NAV_ITEMS.map(item => (
                    <NavItem
                        key={item.path}
                        {...item}
                        collapsed={collapsed}
                        active={location.pathname === item.path}
                        onClick={handleNavigate}
                    />
                ))}
            </nav>

            {/* Bottom — create transaction and sign out */}
            <div
                style={{
                    padding: '16px',
                    borderTop: `1px solid ${COLORS.border}`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                }}
            >
                <button
                    onClick={onCreateTransaction}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: collapsed ? 'center' : 'center',
                        gap: '8px',
                        padding: '10px',
                        backgroundColor: '#FFFFFF',
                        color: COLORS.bg,
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontSize: '14px',
                        width: '100%',
                        transition: 'opacity 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                >
                    <i className="fa-solid fa-plus" style={{ fontSize: '14px' }} />
                    {!collapsed && <span>New Transaction</span>}
                </button>

                <button
                    onClick={handleSignOut}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: collapsed ? 'center' : 'flex-start',
                        gap: '12px',
                        padding: '10px 16px',
                        background: 'none',
                        border: 'none',
                        color: COLORS.textMuted,
                        cursor: 'pointer',
                        fontSize: '14px',
                        width: '100%',
                        borderRadius: '8px',
                        transition: 'background-color 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = COLORS.bgHover}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                    <i className="fa-solid fa-right-from-bracket" style={{ fontSize: '16px', minWidth: '16px' }} />
                    {!collapsed && <span>Sign out</span>}
                </button>
            </div>
        </div>
    )
}

export default Sidebar