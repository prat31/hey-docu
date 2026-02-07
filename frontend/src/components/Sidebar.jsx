import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FileText, Trash2, Database, Cpu, Activity } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload } from './Upload';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export function Sidebar({ refreshTrigger, onUploadComplete, onFileDelete, systemStatus }) {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    useEffect(() => {
        fetchFiles();
    }, [refreshTrigger]);

    const fetchFiles = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/files?t=${new Date().getTime()}`);
            setFiles(res.data.files || []);
        } catch (e) {
            console.error("Failed to fetch files", e);
        }
    };

    const handleDeleteClick = (filename) => {
        if (deletingId === filename) {
            // Actually delete
            deleteFile(filename);
        } else {
            // Show confirmation
            setDeletingId(filename);
            // Reset confirmation after 3 seconds
            setTimeout(() => setDeletingId(null), 3000);
        }
    };

    const deleteFile = async (filename) => {
        setLoading(true);
        // Clear confirming state
        setDeletingId(null);
        try {
            await axios.delete(`${API_URL}/api/files/${filename}`);
            fetchFiles();
            if (onFileDelete) onFileDelete();
        } catch (e) {
            alert("Failed to delete file");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full md:w-64 flex flex-col gap-6 p-4 border-r bg-card/30 backdrop-blur-md h-full">
            {/* Status Section */}
            <div className="space-y-3">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">System Status</h3>
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-sm p-2 rounded-lg bg-background/50 border shadow-sm">
                        <Cpu size={14} className="text-primary" />
                        <span className="font-medium">{systemStatus?.llm_provider === 'openai' ? 'OpenAI' : 'Ollama'}</span>
                        <div className="ml-auto flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">{systemStatus?.model}</span>
                            <span className={cn("flex h-2 w-2 rounded-full", systemStatus?.is_online ? "bg-green-500 animate-pulse" : "bg-destructive")} />
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm p-2 rounded-lg bg-background/50 border shadow-sm">
                        <Database size={14} className="text-green-500" />
                        <span className="font-medium">Qdrant</span>
                        <div className="ml-auto flex items-center gap-2">
                            <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Upload Section */}
            <div className="space-y-3">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Add Document</h3>
                <Upload onUploadComplete={onUploadComplete} />
            </div>

            {/* Files Section */}
            <div className="flex-1 flex flex-col mt-4">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Ingested Documents</h3>

                <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                    <AnimatePresence>
                        {files.length === 0 ? (
                            <p className="text-sm text-muted-foreground italic text-center py-4">No documents yet.</p>
                        ) : (
                            files.map((file) => (
                                <motion.div
                                    key={file}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 10 }}
                                    className="group flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border"
                                >
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <FileText size={14} className="text-primary shrink-0" />
                                        <span className="text-sm truncate" title={file}>{file}</span>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteClick(file)}
                                        disabled={loading}
                                        className={cn(
                                            "transition-all p-1 rounded-md",
                                            deletingId === file
                                                ? "bg-destructive text-destructive-foreground opacity-100"
                                                : "opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                                        )}
                                        title={deletingId === file ? "Click to confirm delete" : "Delete"}
                                    >
                                        <Trash2 size={14} />
                                        {deletingId === file && <span className="ml-1 text-[10px] font-bold">Sure?</span>}
                                    </button>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
