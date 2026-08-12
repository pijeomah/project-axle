import { useState, useEffect, useCallback } from 'react'
import apiFetch from '../services/api'

const SIDEBAR_GREEN = '#1A3C34'

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

const iconButtonStyle = (color) => ({
  background: 'none',
  border: '1px solid #E5E7EB',
  borderRadius: '6px',
  width: '30px',
  height: '30px',
  minWidth: '30px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  color,
  fontSize: '13px',
})


const TAG_TYPES = ['income', 'expense', 'transfer']

const TABS = ['Wallets', 'Tags']

const formatType = (type) =>
  (type || '')
    .split('_')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')

// Shared manager for wallets and tags — both expose the same
// list / create / update / deactivate shape from the API.
const ItemManager = ({ title, items, setItems, types, endpoint, showType = true }) => {
  const [newName, setNewName] = useState('')
  const [newType, setNewType] = useState(types?.[0])
  const [creating, setCreating] = useState(false)
  const [formError, setFormError] = useState('')

  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')
  const [editType, setEditType] = useState('')
  const [savingEdit, setSavingEdit] = useState(false)

  const [deletingId, setDeletingId] = useState(null)

  const handleCreate = async () => {
    setFormError('')
    if (!newName.trim()) {
      setFormError('Name is required.')
      return
    }
    setCreating(true)
    try {
      const res = await apiFetch(`${endpoint}/create`, {
        method: 'POST',
        body: { name: newName.trim(), type: showType ? newType : 'asset' },
      })
      const created = res.newWallet || res.newTag
      if (created) setItems(prev => [...prev, created])
      setNewName('')
      setNewType(types[0])
    } catch (err) {
      setFormError(err.message || 'Failed to create.')
    } finally {
      setCreating(false)
    }
  }

  const startEdit = (item) => {
    setFormError('')
    setEditingId(item.id)
    setEditName(item.name)
    setEditType(item.type)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditName('')
    setEditType('')
  }

  const handleSaveEdit = async (id) => {
    if (!editName.trim()) {
      setFormError('Name is required.')
      return
    }
    setSavingEdit(true)
    setFormError('')
    try {
      const res = await apiFetch(`${endpoint}/${id}`, {
        method: 'PUT',
        body: { name: editName.trim(),  type: showType ? editType : 'asset' },
      })
      const updated = res.updateData
      setItems(prev => prev.map(i => (i.id === id ? { ...i, ...updated } : i)))
      cancelEdit()
    } catch (err) {
      setFormError(err.message || 'Failed to update.')
    } finally {
      setSavingEdit(false)
    }
  }

  const handleDeactivate = async (id) => {
    setFormError('')
    setDeletingId(id)
    try {
      await apiFetch(`${endpoint}/${id}`, { method: 'DELETE' })
      // The list endpoints don't filter on is_active, so remove locally
      // rather than refetching (a refetch would bring it right back).
      setItems(prev => prev.filter(i => i.id !== id))
    } catch (err) {
      setFormError(err.message || 'Failed to remove.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: '8px', marginBottom: formError ? '8px' : '20px', alignItems: 'flex-end' }}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Name</label>
          <input
            style={inputStyle}
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder={`New ${title.toLowerCase().slice(0, -1)} name`}
            onKeyDown={e => e.key === 'Enter' && handleCreate()}
          />
        </div>
        {showType && (
        <div style={{ width: '160px' }}>
          <label style={labelStyle}>Type</label>
          <select style={inputStyle} value={newType} onChange={e => setNewType(e.target.value)}>
            {types.map(t => (
              <option key={t} value={t}>{formatType(t)}</option>
            ))}
          </select>
        </div>

        )}
        <button
          onClick={handleCreate}
          disabled={creating}
          style={{
            padding: '9px 16px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: SIDEBAR_GREEN,
            color: '#FFFFFF',
            fontWeight: 600,
            fontSize: '14px',
            cursor: creating ? 'not-allowed' : 'pointer',
            height: '38px',
            opacity: creating ? 0.7 : 1,
          }}
        >
          {creating ? 'Adding…' : 'Add'}
        </button>
      </div>

      {formError && (
        <p style={{ color: '#DC2626', fontSize: '13px', marginBottom: '16px' }}>{formError}</p>
      )}

        {formError && (
  <p style={{ color: '#DC2626', fontSize: '13px', marginBottom: '16px' }}>{formError}</p>
)}

{items.length === 0 ? (
  <div style={{ textAlign: 'center', padding: '32px 0', color: '#9CA3AF' }}>
    No wallets yet.
  </div>
) : (
  items.map(item => (
    <div
      key={item.id}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '12px 0',
        borderBottom: '1px solid #F3F4F6',
      }}
    >
   
   

          <span style={{ flex: 1, fontSize: '14px', fontWeight: 500, color: '#111827' }}>
  {item.name}
</span>
<button
  onClick={() => handleDeactivate(item.id)}
  disabled={deletingId === item.id}
  style={iconButtonStyle('#DC2626')}
  title="Remove"
>
  <i className="fa-solid fa-trash" />
</button>
         
    </div>
        ))
      )}
    </div>
  )
}

const WalletSection = ({ items, setItems, endpoint }) => {
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)
  const [formError, setFormError] = useState('')
  const [openingBalance, setOpeningBalance] = useState('')    
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')
  const [savingEdit, setSavingEdit] = useState(false)

  const [deletingId, setDeletingId] = useState(null)

  const handleCreate = async () => {
  setFormError('')
  if (!newName.trim()) {
    setFormError('Name is required.')
    return
  }
  setCreating(true)
  try {
    const res = await apiFetch(`${endpoint}/create`, {
      method: 'POST',
      body: { name: newName.trim(), type: 'asset' },
    })
    const created = res.newWallet
    if (!created) throw new Error('Failed to create wallet.')

    if (openingBalance && Number(openingBalance) > 0) {
      try {
        await apiFetch('/transactions/create', {
          method: 'POST',
          body: {
            action_type: 'OPENING_BALANCE',
            wallet_id: created.id,
            amount: Number(openingBalance),
            occurred_at: new Date().toISOString(),
            description: 'Opening balance',
          },
        })
      } catch (balanceErr) {
        setFormError(`Wallet created, but opening balance failed: ${balanceErr.message}`)
      }
    }

    setItems(prev => [...prev, created])
    setNewName('')
    setOpeningBalance('')
  } catch (err) {
    setFormError(err.message || 'Failed to create wallet.')
  } finally {
    setCreating(false)
  }
}
const handleDeactivate = async (id) => {
  setFormError('')
  setDeletingId(id)
  try {
    await apiFetch(`${endpoint}/${id}`, { method: 'DELETE' })
    setItems(prev => prev.filter(i => i.id !== id))
  } catch (err) {
    setFormError(err.message || 'Failed to remove.')
  } finally {
    setDeletingId(null)
  }
}

  return (
    <div>
        <div style={{ display: 'flex', gap: '8px', marginBottom: formError ? '8px' : '20px', alignItems: 'flex-end' }}>
  <div style={{ flex: 1 }}>
    <label style={labelStyle}>Name</label>
    <input
      style={inputStyle}
      value={newName}
      onChange={e => setNewName(e.target.value)}
      placeholder="New wallet name"
      onKeyDown={e => e.key === 'Enter' && handleCreate()}
    />
  </div>
  <div style={{ width: '160px' }}>
    <label style={labelStyle}>Opening balance</label>
    <input
      type="number"
      min="0"
      style={inputStyle}
      value={openingBalance}
      onChange={e => setOpeningBalance(e.target.value)}
      placeholder="0.00"
    />
  </div>
  <button
    onClick={handleCreate}
    disabled={creating}
    style={{
      padding: '9px 16px',
      borderRadius: '8px',
      border: 'none',
      backgroundColor: SIDEBAR_GREEN,
      color: '#FFFFFF',
      fontWeight: 600,
      fontSize: '14px',
      cursor: creating ? 'not-allowed' : 'pointer',
      height: '38px',
      opacity: creating ? 0.7 : 1,
    }}
  >
    {creating ? 'Adding…' : 'Add'}
  </button>
</div>



{formError && (
  <p style={{ color: '#DC2626', fontSize: '13px', marginBottom: '16px' }}>{formError}</p>
)}

{items.length === 0 ? (
  <div style={{ textAlign: 'center', padding: '32px 0', color: '#9CA3AF' }}>
    No wallets yet.
  </div>
) : (
  items.map(item => (
    <div
      key={item.id}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '12px 0',
        borderBottom: '1px solid #F3F4F6',
      }}
    >
      <span style={{ flex: 1, fontSize: '14px', fontWeight: 500, color: '#111827' }}>
        {item.name}
      </span>
      <button
        onClick={() => handleDeactivate(item.id)}
        disabled={deletingId === item.id}
        style={iconButtonStyle('#DC2626')}
        title="Remove"
      >
        <i className="fa-solid fa-trash" />
      </button>
    </div>
  ))
)}
    </div>
  )
}

const Settings = () => {
  const [tab, setTab] = useState('Wallets')
  const [wallets, setWallets] = useState([])
  const [tags, setTags] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [walletsRes, tagsRes] = await Promise.all([
        apiFetch('/wallets'),
        apiFetch('/tags'),
      ])
      // System wallet is created/managed by the backend, not the user.
      setWallets((walletsRes.listData || []).filter(w => w.type !== 'system'))
      setTags((tagsRes.data || []).filter(t => t.is_active !== false))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return (
    <div style={{ padding: '32px', maxWidth: '860px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#111827' }}>
          Settings
        </h1>
      </div>

      <div
        style={{
          display: 'flex',
          gap: '6px',
          marginBottom: '24px',
          borderBottom: '1px solid #F3F4F6',
          paddingBottom: '12px',
        }}
      >
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '6px 14px',
              borderRadius: '99px',
              fontSize: '13px',
              fontWeight: tab === t ? 600 : 400,
              cursor: 'pointer',
              border: tab === t ? 'none' : '1px solid #E5E7EB',
              backgroundColor: tab === t ? SIDEBAR_GREEN : 'transparent',
              color: tab === t ? '#FFFFFF' : '#6B7280',
              transition: 'all 0.15s',
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: '#9CA3AF' }}>
          Loading…
        </div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: '#DC2626' }}>
          {error}
        </div>
      ) : tab === 'Wallets' ? (
        <ItemManager
          title="Wallets"
          items={wallets}
          setItems={setWallets}
          showType={false}
          endpoint="/wallets"
        />
      ) : (
        <ItemManager
          title="Tags"
          items={tags}
          setItems={setTags}
          types={TAG_TYPES}
          endpoint="/tags"
        />
      )}
    </div>
  )
}

export default Settings