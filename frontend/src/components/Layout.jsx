import { useState } from "react";
import Sidebar from "./Sidebar";

const Layout = ({children}) => {

const [modalOpen, setModalOpen] = useState(false)
    const handleCreateTransaction = ()=> {
    setModalOpen(true)
    }
        return(
            <div style={{
                display: "flex",
                minHeight: '100vh'
            }}>
                <Sidebar onCreateTransaction={handleCreateTransaction}  /> 

                <main style={{ flex: 1, overflowY: 'auto' }}>

                {children}
                 </main>

                 {
                    modalOpen && (
                        <div style={{
                            position: 'fixed',
                            inset: 0,
                            backgroundColor: 'rgba(0,0,0,0.4)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 50
                            }}
                            onClick = {() => setModalOpen(false)}
                            >
                            <div style={{
                            backgroundColor: '#FFFFFF',
                            borderRadius: '16px',
                            padding: '32px',
                            width: '100%',
                            maxWidth: '480px',
                        }}
                        onClick={e => e.stopPropagation()}>
                            <p>
                             Create Transaction Form — coming soon   
                            </p>
                        <button onClick={() => setModalOpen(false)}>
                        Close
                        </button>
                            </div>

                        </div>
                    )
                 }

            </div>
        )


}



export default Layout