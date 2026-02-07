import React, { useState, useRef } from 'react';
import { Chat } from './components/Chat';
import { Sidebar } from './components/Sidebar';
import { ThemeToggle } from './components/ThemeToggle';
import { Sparkles, Menu } from 'lucide-react';

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function App() {
    const [refreshSidebar, setRefreshSidebar] = useState(0);
    const [showSidebar, setShowSidebar] = useState(false);
    const [systemStatus, setSystemStatus] = useState(null);
    const chatRef = useRef(null);

    React.useEffect(() => {
        fetchStatus();
        const interval = setInterval(fetchStatus, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, []);

    const fetchStatus = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/status?t=${new Date().getTime()}`);
            setSystemStatus(res.data);
        } catch (e) {
            console.error("Failed to fetch system status", e);
            setSystemStatus(prev => ({ ...prev, is_online: false }));
        }
    };

    const handleUploadComplete = () => {
        setRefreshSidebar(prev => prev + 1);
    };

    const handleFileDelete = () => {
        chatRef.current?.resetChat();
    };

    return (
        <div className="h-screen flex bg-background text-foreground overflow-hidden">

            {/* Mobile Sidebar Toggle Overlay */}
            <div
                className={`md:hidden fixed inset-0 z-50 bg-background/80 backdrop-blur-sm transition-opacity duration-300 ${showSidebar ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setShowSidebar(false)}
            >
                <div
                    className={`w-64 h-full bg-background border-r transition-transform duration-300 ${showSidebar ? 'translate-x-0' : '-translate-x-full'}`}
                    onClick={e => e.stopPropagation()}
                >
                    <Sidebar
                        refreshTrigger={refreshSidebar}
                        onUploadComplete={handleUploadComplete}
                        onFileDelete={handleFileDelete}
                        systemStatus={systemStatus}
                    />
                </div>
            </div>

            {/* Desktop Sidebar */}
            <div className="hidden md:block h-full w-80 shrink-0">
                <Sidebar
                    refreshTrigger={refreshSidebar}
                    onUploadComplete={handleUploadComplete}
                    onFileDelete={handleFileDelete}
                    systemStatus={systemStatus}
                />
            </div>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-full overflow-hidden relative bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background">

                {/* Header */}
                <header className="flex items-center justify-between p-4 md:p-6 border-b backdrop-blur-sm z-10">
                    <button className="md:hidden p-2 -ml-2 hover:bg-muted/50 rounded-lg" onClick={() => setShowSidebar(true)}>
                        <Menu size={24} />
                    </button>

                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-xl border border-primary/20">
                            <Sparkles className="w-5 h-5 text-primary" />
                        </div>
                        <h1 className="text-xl md:text-2xl font-bold tracking-tight">
                            Hey Docu
                        </h1>
                    </div>

                    <ThemeToggle />
                </header>

                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8">
                    <div className="max-w-4xl mx-auto space-y-8 pb-12">

                        <div className="space-y-2 text-center mb-8 pt-8">
                            <h2 className="text-2xl font-medium text-foreground/90">
                                Chat with your documents
                            </h2>
                            <p className="text-muted-foreground text-sm">
                                Upload a text file to extract knowledge and ask questions via AI.
                            </p>
                        </div>



                        <Chat ref={chatRef} isOnline={systemStatus?.is_online} />

                    </div>
                </div>

                <footer className="py-4 text-center text-[10px] uppercase tracking-widest text-muted-foreground/40">
                    Powered by LlamaIndex & Qdrant
                </footer>
            </main>
        </div>
    );
}

export default App;
