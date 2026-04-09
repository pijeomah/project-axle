import { useState, useEffect } from 'react'
import apiFetch from '../services/api'

const ACTION_TYPES = ['EXPENSE', 'INCOME', 'TRANSFER']

const COLORS = {
  EXPENSE: { bg: '#1A3C34', text: '#FFFFFF' },
  INCOME:  { bg: '#1A3C34', text: '#FFFFFF' },
  TRANSFER:{ bg: '#1A3C34', text: '#FFFFFF' },
}

const today = () => new Date().toISOString().split('T')[0]

const inputStyle = {
  width: '100%',
  padding: '9px 12px',
  fontSize: '14px',
  border: '1px solid #D1D5DB',
  borderRadius: '8px',
  outline: 'none',
  boxSizing: 'border-box',
  color: '#111827',
  backgroundColor: '#FFFFFF',
}

const labelStyle = {
  display: 'block',
  fontSize: '12px',
  fontWeight: 500,
  color: '#6B7280',
  marginBottom: '4px',
}

const SIDEBAR_GREEN = '#1A3C34'

const CreateTransactionModal = ({ isOpen, onClose, onSuccess }) => {
  const [actionType, setActionType] = useState('EXPENSE')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(today())
  const [description, setDescription] = useState('')
  const [walletId, setWalletId] = useState('')
  const [sourceWalletId, setSourceWalletId] = useState('')
  const [destinationWalletId, setDestinationWalletId] = useState('')
  const [tagId, setTagId] = useState('')

  const [wallets, setWallets] = useState([])
  const [tags, setTags] = useState([])
  const [loadingData, setLoadingData] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Fetch wallets and tags when modal opens
  useEffect(() => {
    if (!isOpen) return

    const fetchFormData = async () => {
      setLoadingData(true)
      try {
        const [walletsRes, tagsRes] = await Promise.all([
          apiFetch('/wallets'),
          apiFetch('/tags'),
        ])
        // wallets returns { listData: [...] }, filter out system wallets
        const allWallets = walletsRes.listData || []
        setWallets(allWallets.filter(w => w.type !== 'system'))
        setTags(tagsRes.data || [])
      } catch (err) {
        setError('Failed to load form data. Please try again.')
      } finally {
        setLoadingData(false)
      }
    }

    fetchFormData()
  }, [isOpen])

  // Filter tags by the current action type (tags have type: 'expense'|'income'|'transfer')
  const filteredTags = tags.filter(
    t => t.type === actionType.toLowerCase() && t.is_active !== false
  )

  const resetForm = () => {
    setActionType('EXPENSE')
    setAmount('')
    setDate(today())
    setDescription('')
    setWalletId('')
    setSourceWalletId('')
    setDestinationWalletId('')
    setTagId('')
    setError('')
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleSubmit = async () => {
    setError('')

    // Basic validation
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError('Please enter a valid amount greater than 0.')
      return
    }
    if (!description.trim()) {
      setError('Description is required.')
      return
    }
    if (!date) {
      setError('Date is required.')
      return
    }
    if (actionType === 'TRANSFER') {
      if (!sourceWalletId || !destinationWalletId) {
        setError('Please select both source and destination wallets.')
        return
      }
      if (sourceWalletId === destinationWalletId) {
        setError('Source and destination wallets must be different.')
        return
      }
    } else {
      if (!walletId) {
        setError('Please select a wallet.')
        return
      }
    }
    if (!tagId) {
      setError('Please select a tag.')
      return
    }

    const payload = {
      action_type: actionType,
      amount: Math.round(Number(amount)), // backend requires integer
      occurred_at: new Date(date).toISOString(),
      description: description.trim(),
      tag_id: tagId,
      ...(actionType === 'TRANSFER'
        ? { source_wallet_id: sourceWalletId, destination_wallet_id: destinationWalletId }
        : actionType === 'EXPENSE'
        ? { source_wallet_id: walletId }
        : { destination_wallet_id: walletId }),
    }

    setSubmitting(true)
    try {
      await apiFetch('/transactions/create', { method: 'POST', body: payload })
      resetForm()
      onSuccess?.()
      onClose()
    } catch (err) {
      setError(err.message || 'Failed to create transaction.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!isOpen) return null

  const isTransfer = actionType === 'TRANSFER'

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
        padding: '16px',
      }}
      onClick={handleClose}
    >
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          padding: '28px',
          width: '100%',
          maxWidth: '480px',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, fontSize: '17px', fontWeight: 600, color: '#111827' }}>
            New transaction
          </h2>
          <button
            onClick={handleClose}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '20px', color: '#9CA3AF', lineHeight: 1, padding: '2px 6px',
            }}
          >
            ×
          </button>
        </div>

        {/* Action type selector */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', marginBottom: '20px' }}>
          {ACTION_TYPES.map(type => (
            <button
              key={type}
              onClick={() => { setActionType(type); setTagId(''); setWalletId(''); setSourceWalletId(''); setDestinationWalletId('') }}
              style={{
                padding: '8px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: actionType === type ? 600 : 400,
                cursor: 'pointer',
                border: actionType === type ? `2px solid ${SIDEBAR_GREEN}` : '1px solid #E5E7EB',
                backgroundColor: actionType === type ? SIDEBAR_GREEN : 'transparent',
                color: actionType === type ? '#FFFFFF' : '#6B7280',
                transition: 'all 0.15s',
              }}
            >
              {type.charAt(0) + type.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {loadingData ? (
          <p style={{ textAlign: 'center', color: '#9CA3AF', fontSize: '14px', padding: '24px 0' }}>
            Loading…
          </p>
        ) : (
          <>
            {/* Amount + Date */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <div>
                <label style={labelStyle}>Amount (XOF)</label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  placeholder="0"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  style={{ ...inputStyle, fontWeight: 600, fontSize: '16px' }}
                />
              </div>
              <div>
                <label style={labelStyle}>Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Description */}
            <div style={{ marginBottom: '12px' }}>
              <label style={labelStyle}>Description</label>
              <input
                type="text"
                placeholder="What was this for?"
                value={description}
                onChange={e => setDescription(e.target.value)}
                style={inputStyle}
              />
            </div>

            {/* Wallet(s) */}
            {isTransfer ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 24px 1fr', gap: '8px', alignItems: 'end', marginBottom: '12px' }}>
                <div>
                  <label style={labelStyle}>From wallet</label>
                  <select
                    value={sourceWalletId}
                    onChange={e => setSourceWalletId(e.target.value)}
                    style={inputStyle}
                  >
                    <option value="">Select</option>
                    {wallets.map(w => (
                      <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                  </select>
                </div>
                <div style={{ textAlign: 'center', color: '#9CA3AF', paddingBottom: '10px', fontSize: '14px' }}>→</div>
                <div>
                  <label style={labelStyle}>To wallet</label>
                  <select
                    value={destinationWalletId}
                    onChange={e => setDestinationWalletId(e.target.value)}
                    style={inputStyle}
                  >
                    <option value="">Select</option>
                    {wallets.map(w => (
                      <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <div style={{ marginBottom: '12px' }}>
                <label style={labelStyle}>Wallet</label>
                <select
                  value={walletId}
                  onChange={e => setWalletId(e.target.value)}
                  style={inputStyle}
                >
                  <option value="">Select wallet</option>
                  {wallets.map(w => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Tags */}
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Tag</label>
              {filteredTags.length === 0 ? (
                <p style={{ fontSize: '13px', color: '#9CA3AF', marginTop: '4px' }}>
                  No {actionType.toLowerCase()} tags yet. Create one in Settings.
                </p>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                  {filteredTags.map(tag => (
                    <button
                      key={tag.id}
                      onClick={() => setTagId(tagId === tag.id ? '' : tag.id)}
                      style={{
                        padding: '5px 12px',
                        borderRadius: '99px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        border: tagId === tag.id ? `2px solid ${SIDEBAR_GREEN}` : '1px solid #E5E7EB',
                        backgroundColor: tagId === tag.id ? SIDEBAR_GREEN : 'transparent',
                        color: tagId === tag.id ? '#FFFFFF' : '#6B7280',
                        fontWeight: tagId === tag.id ? 500 : 400,
                        transition: 'all 0.15s',
                      }}
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Error */}
            {error && (
              <div style={{
                padding: '10px 12px',
                backgroundColor: '#FEF2F2',
                border: '1px solid #FECACA',
                borderRadius: '8px',
                fontSize: '13px',
                color: '#DC2626',
                marginBottom: '16px',
              }}>
                {error}
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={handleClose}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  border: '1px solid #E5E7EB',
                  backgroundColor: 'transparent',
                  color: '#6B7280',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                style={{
                  flex: 2,
                  padding: '10px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  border: 'none',
                  backgroundColor: submitting ? '#9CA3AF' : SIDEBAR_GREEN,
                  color: '#FFFFFF',
                  transition: 'background-color 0.15s',
                }}
              >
                {submitting ? 'Saving…' : `Save ${actionType.charAt(0) + actionType.slice(1).toLowerCase()}`}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default CreateTransactionModal