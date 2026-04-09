import { useState } from "react"
import Sidebar from "./Sidebar"
import CreateTransactionModal from "./CreateTransactionModal"

const Layout = ({ children, onTransactionCreated }) => {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <div style={{ display: "flex", minHeight: '100vh' }}>
      <Sidebar onCreateTransaction={() => setModalOpen(true)} />

      <main style={{ flex: 1, overflowY: 'auto' }}>
        {children}
      </main>

      <CreateTransactionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => {
          onTransactionCreated?.()
        }}
      />
    </div>
  )
}

export default Layout