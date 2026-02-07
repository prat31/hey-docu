import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FileText, Trash2, Database, Cpu, Activity } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload } from './Upload';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export function Sidebar({ refreshTrigger, onUploadComplete, onFileDelete }) {
    const [files, setFiles] = useState([]);
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchFiles();
        fetchStatus();
    }, [refreshTrigger]);

    const fetchFiles = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/files`);
        } catch (e) {
            console.error("Failed to fetch files", e);
        }
    };

    const fetchStatus = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/status`);
            setStatus(res.data);
        } catch (e) {
            console.error("Failed to fetch status", e);
        }
    };

    const deleteFile = async (filename) => {
        if (!confirm(`Are you sure you want to delete ${filename}?`)) return;
        setLoading(true);
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
                        <span className="font-medium">{status?.llm_provider === 'openai' ? 'OpenAI' : 'Ollama'}</span>
                        <span className="text-xs text-muted-foreground ml-auto">{status?.model}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm p-2 rounded-lg bg-background/50 border shadow-sm">
                        <Database size={14} className="text-green-500" />
                        <span className="font-medium">Qdrant</span>
                        <span className="flex h-2 w-2 rounded-full bg-green-500 ml-auto animate-pulse" />
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
                                        onClick={() => deleteFile(file)}
                                        disabled={loading}
                                        className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive transition-all"
                                    >
                                        <Trash2 size={14} />
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
