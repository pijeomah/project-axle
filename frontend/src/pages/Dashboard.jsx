import React from "react";
import {useAuth} from '../context/AuthContext'
import {useNavigate} from 'react-router-dom'
import useDashboardSummary from '../hooks/useDashboardSummary'

const formatAmount = (amount) => {
    return  new Intl.NumberFormat('en-us', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount)
}

const StatCard = ({title, amount, color,icon}) => (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <p className={`text-2xl font-bold ${color}`}>{amount}</p>
        {icon && <i className={`fa-solid ${icon} ${color} text-sm`}></i>}
    </div>
)


const WalletRow = ({name, balance})=>(
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
        <p className="text-sm font-medium text-gray-700">{name}</p>
        <p className="text-sm font-bold text-gray-900">{formatAmount(balance)}</p>
    </div>
)

const TransactionRow = ({ description, amount, occurred_at }) => (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
        <div>
            <p className="text-sm font-medium text-gray-700">{description}</p>
            <p className="text-xs text-gray-400">
                {new Date(occurred_at).toLocaleDateString()}
            </p>
        </div>
        <p className="text-sm font-bold text-gray-900">{formatAmount(amount)}</p>
    </div>
)



const Dashboard = ()=>{
    const {user, signOut} = useAuth()
    const navigate = useNavigate()
    const {data , loading, error} = useDashboardSummary()
    const handleLogout = async() => {
        await signOut()
        navigate('/login')

    }

    if(loading) return(
         <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <p className="text-gray-500">Loading...</p>
        </div>
    )

    if(error)return(
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <p className="text-red-500">{error}</p>
        </div>
    )
    
    const {
        totalBalance,
        netThisMonth,
        monthlyIncome,
        wallets,
        recentTransactions,
        monthlyExpenses
    } = data

    return(
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Axle</h1>
                    <p className="text-sm text-gray-500">Welcome back, {user?.email}</p>
                </div>
                <button
                    onClick={handleLogout}
                    className="text-sm text-gray-500 hover:text-gray-900 transition"
                >
                    Sign out
                </button>
            </header>

            <main className="max-w-5xl mx-auto px-6 py-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <StatCard
                        title="Total Balance"
                        amount={formatAmount(totalBalance)}
                        color="text-gray-900"
                       
                    />
                    <StatCard
                        title="Income This Month"
                        amount={formatAmount(monthlyIncome)}
                        color="text-green-600"
                         icon="fa-arrow-trend-up"
                        
                    />
                    <StatCard
                        title="Expenses This Month"
                        amount={formatAmount(monthlyExpenses)}
                        color="text-red-500"
                         icon="fa-arrow-trend-down"
                    />
                    <StatCard
                        title="Net This Month"
                        amount={formatAmount(netThisMonth)}
                        color={netThisMonth >= 0 ? 'text-green-600' : 'text-red-500'}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h2 className="text-sm font-semibold text-gray-900 mb-4">
                            Recent Transactions
                        </h2>
                        {recentTransactions.length === 0 ? (
                            <p className="text-sm text-gray-400">No transactions yet</p>
                        ) : (
                            recentTransactions.map(tx => (
                                <TransactionRow key={tx.id} {...tx} />
                            ))
                        )}
                    </div>
                    
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h2 className="text-sm font-semibold text-gray-900 mb-4">
                            Wallets
                        </h2>
                        {!wallets || wallets.length === 0 ? (
                            <p className="text-sm text-gray-400">No wallets yet</p>
                        ) : (
                            wallets.map(wallet => (
                                <WalletRow
                                    key={wallet.id}
                                    name={wallet.name}
                                    balance={wallet.balance}
                                />
                            ))
                        )}
                    </div>
                </div>
            </main>
        </div>
    
    )
    
}

export default Dashboard