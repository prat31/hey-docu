import React, { useState, useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import axios from 'axios';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const Chat = forwardRef((props, ref) => {
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Hello! Upload a document to start chatting.' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    useImperativeHandle(ref, () => ({
        resetChat() {
            setMessages([{ role: 'assistant', content: 'Hello! Upload a document to start chatting.' }]);
            setInput('');
        }
    }));

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            const response = await axios.post(`${API_URL}/api/chat`, { question: userMessage });
            const answer = response.data.answer;
            setMessages(prev => [...prev, { role: 'assistant', content: answer }]);
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I encountered an error answering that." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full w-full max-w-5xl mx-auto bg-transparent md:bg-card/30 md:backdrop-blur-sm rounded-none md:rounded-2xl border-0 md:border md:shadow-sm overflow-hidden mt-4 mb-4">

            <div className="flex-1 overflow-y-auto p-4 space-y-4">

                {messages.map((msg, index) => (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={index}
                        className={cn(
                            "flex gap-3",
                            msg.role === 'user' ? "flex-row-reverse" : "flex-row"
                        )}
                    >
                        <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                            msg.role === 'user' ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                        )}>
                            {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                        </div>

                        <div className={cn(
                            "p-3 rounded-2xl max-w-[80%]",
                            msg.role === 'user'
                                ? "bg-primary text-primary-foreground rounded-tr-none"
                                : "bg-muted text-foreground rounded-tl-none"
                        )}>
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                        </div>
                    </motion.div>
                ))}
                {isLoading && (
                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center shrink-0">
                            <Bot size={16} />
                        </div>
                        <div className="bg-muted p-3 rounded-2xl rounded-tl-none flex items-center">
                            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSubmit} className="p-4 bg-background/50 border-t backdrop-blur-sm">
                <div className="relative flex items-center max-w-4xl mx-auto">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask a question about your document..."
                        className="w-full bg-muted/50 border-none rounded-full py-3.5 pl-5 pr-12 focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className="absolute right-2 p-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        <Send size={16} />
                    </button>
                </div>
            </form>
        </div>
    );
});

Chat.displayName = 'Chat';
