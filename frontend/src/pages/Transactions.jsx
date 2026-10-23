import { useState, useEffect, useCallback } from 'react'
import apiFetch from '../services/api'

const SIDEBAR_GREEN = '#1A3C34'

const formatAmount = (amount) =>
  new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

const FILTERS = ['All', 'Income', 'Expense', 'Transfer']

const TransactionRow = ({ description, amount, occurred_at, transaction_type }) => {
  const isExpense = transaction_type === 'expense'
  const isIncome = transaction_type === 'income'

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto auto',
        alignItems: 'center',
        gap: '16px',
        padding: '14px 0',
        borderBottom: '1px solid #F3F4F6',
      }}
    >
      <div>
        <p style={{ margin: 0, fontSize: '14px', fontWeight: 500, color: '#111827' }}>
          {description}
        </p>
        <p style={{ margin: 0, fontSize: '12px', color: '#9CA3AF', marginTop: '2px' }}>
          {formatDate(occurred_at)}
        </p>
      </div>

      <span
        style={{
          fontSize: '11px',
          fontWeight: 500,
          padding: '3px 8px',
          borderRadius: '99px',
          backgroundColor:
            isExpense ? '#FEF2F2' : isIncome ? '#F0FDF4' : '#EFF6FF',
          color:
            isExpense ? '#DC2626' : isIncome ? '#16A34A' : '#2563EB',
          textTransform: 'capitalize',
        }}
      >
        {transaction_type ?? 'transfer'}
      </span>

      <p
        style={{
          margin: 0,
          fontSize: '14px',
          fontWeight: 600,
          color: isExpense ? '#DC2626' : isIncome ? '#16A34A' : '#111827',
          minWidth: '80px',
          textAlign: 'right',
        }}
      >
        {isExpense ? '-' : isIncome ? '+' : ''}
        {formatAmount(amount)}
      </p>
    </div>
  )
}

const Transactions = () => {
  const [transactions, setTransactions] = useState([])
  const [pagination, setPagination] = useState(null)
  const [page, setPage] = useState(1)
  const [filter, setFilter] = useState('All')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchTransactions = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await apiFetch(`/transactions?page=${page}&limit=10`)
      setTransactions(result.data ?? [])
      setPagination(result.pagination)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  const filtered =
    filter === 'All'
      ? transactions
      : transactions.filter(
          (t) => t.transaction_type === filter.toLowerCase()
        )

  return (
    <div style={{ padding: '32px', maxWidth: '860px', margin: '0 auto' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px',
        }}
      >
        <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#111827' }}>
          Transactions
        </h1>
        {pagination && (
          <p style={{ margin: 0, fontSize: '13px', color: '#9CA3AF' }}>
            {pagination.total_records} total
          </p>
        )}
      </div>

      {/* Filter tabs */}
      <div
        style={{
          display: 'flex',
          gap: '6px',
          marginBottom: '24px',
          borderBottom: '1px solid #F3F4F6',
          paddingBottom: '12px',
        }}
      >
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '6px 14px',
              borderRadius: '99px',
              fontSize: '13px',
              fontWeight: filter === f ? 600 : 400,
              cursor: 'pointer',
              border: filter === f ? 'none' : '1px solid #E5E7EB',
              backgroundColor: filter === f ? SIDEBAR_GREEN : 'transparent',
              color: filter === f ? '#FFFFFF' : '#6B7280',
              transition: 'all 0.15s',
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: '#9CA3AF' }}>
          Loading…
        </div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: '#DC2626' }}>
          {error}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: '#9CA3AF' }}>
          No transactions found.
        </div>
      ) : (
        filtered.map((tx) => <TransactionRow key={tx.id} {...tx} />)
      )}

      {/* Pagination */}
      {pagination && pagination.total_pages > 1 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '24px',
          }}
        >
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '13px',
              cursor: page === 1 ? 'not-allowed' : 'pointer',
              border: '1px solid #E5E7EB',
              backgroundColor: 'transparent',
              color: page === 1 ? '#D1D5DB' : '#6B7280',
            }}
          >
            ← Previous
          </button>

          <p style={{ margin: 0, fontSize: '13px', color: '#9CA3AF' }}>
            Page {pagination.current_page} of {pagination.total_pages}
          </p>

          <button
            disabled={page === pagination.total_pages}
            onClick={() => setPage((p) => p + 1)}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '13px',
              cursor: page === pagination.total_pages ? 'not-allowed' : 'pointer',
              border: '1px solid #E5E7EB',
              backgroundColor: 'transparent',
              color: page === pagination.total_pages ? '#D1D5DB' : '#6B7280',
            }}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  )
}

export default Transactions