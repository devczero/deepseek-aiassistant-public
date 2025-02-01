'use client';

import { useState, useRef, useEffect } from 'react';
import { generateDeepSeekContent } from '@/app/utils/api';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { SyntaxHighlighterProps } from 'react-syntax-highlighter';
import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';

type Message = {
    role: 'system' | 'user' | 'assistant';
    content: string;
    copied?: boolean;
};

export default function YourComponent() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [selectedModel, setSelectedModel] = useState<'reasoner' | 'chat'>('reasoner');
    const [systemPrompt, setSystemPrompt] = useState('You are a helpful AI assistant.');
    const [designerMode, setDesignerMode] = useState(false);
    const [activeTemplate, setActiveTemplate] = useState<string | null>(null);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
    
    const [templates] = useState([
        {
            category: "Authentication",
            items: [
                {
                    name: "Clerk Setup",
                    prompt: "Generate a Clerk authentication setup for Next.js including installation, env setup, middleware, and protected routes using TypeScript and App Router."
                }
            ]
        },
        {
            category: "Payments",
            items: [
                {
                    name: "Stripe Integration",
                    prompt: "Create a complete Stripe payment integration for Next.js including:\n1. Checkout session setup\n2. Webhook handling\n3. Subscription management\n4. Error handling\nUse TypeScript and App Router."
                }
            ]
        },
        {
            category: "Database",
            items: [
                {
                    name: "Prisma Schema",
                    prompt: "Generate Prisma schema models for User and Subscription with:\n1. Core authentication fields\n2. Subscription status tracking\n3. Relationships between models\n4. Example query methods"
                }
            ]
        },
        {
            category: "Environment Templates",
            items: [
                {
                    name: "Supabase ENV",
                    prompt: "Generate .env file template for Supabase integration with Next.js including all required environment variables with comments."
                },
                {
                    name: "Stripe ENV",
                    prompt: "Create .env template for Stripe integration containing both client-side and server-side required variables."
                }
            ]
        }
    ]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Auto-resize textarea
    const adjustTextareaHeight = () => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
            
            // Scroll to cursor position when exceeding visible area
            const cursorPosition = textarea.selectionStart;
            const textBeforeCursor = textarea.value.substring(0, cursorPosition);
            const tempElement = document.createElement('div');
            tempElement.style.width = `${textarea.offsetWidth}px`;
            tempElement.style.whiteSpace = 'pre-wrap';
            tempElement.style.visibility = 'hidden';
            tempElement.textContent = textBeforeCursor;
            document.body.appendChild(tempElement);
            
            if (tempElement.offsetHeight > textarea.offsetHeight) {
                textarea.scrollTop = tempElement.offsetHeight - textarea.offsetHeight;
            }
            
            document.body.removeChild(tempElement);
        }
    };

    const copyToClipboard = async (text: string, index: number) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedIndex(index);
            setTimeout(() => setCopiedIndex(null), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Allow empty submissions only for template triggers
        if (!inputText.trim() && !activeTemplate) {
            return;
        }

        setLoading(true);
        try {
            const finalPrompt = designerMode ? 
                `\n${inputText}\n\nEnhance this UI code following design guidelines.` : 
                inputText;

            const result = await generateDeepSeekContent([
                { role: 'system', content: systemPrompt },
                ...messages,
                { role: 'user', content: finalPrompt }
            ], selectedModel);
            
            setMessages([
                ...messages,
                { role: 'user' as const, content: finalPrompt, copied: false },
                { role: 'assistant' as const, content: result.content, copied: false }
            ]);
            setInputText('');
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
            }
        } catch (error) {
            console.error('Failed to generate:', error);
        } finally {
            setActiveTemplate(null);
            setLoading(false);
        }
    };

    const applyTemplate = (templatePrompt: string, templateId: string) => {
        if (activeTemplate === templateId) {
            handleSubmit(new Event('submit') as unknown as React.FormEvent);
            setActiveTemplate(null);
        } else {
            setInputText(templatePrompt);
            setActiveTemplate(templateId);
        }
    };

    const components: Components = {
        code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
                <SyntaxHighlighter
                    {...(props as SyntaxHighlighterProps)}
                    style={vscDarkPlus as any}
                    language={match[1]}
                    PreTag="div"
                    className="rounded-md !bg-[#1a1a1a] max-w-full overflow-x-auto"
                >
                    {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
            ) : (
                <code className="bg-[#1a1a1a] rounded px-1 py-0.5 break-words overflow-x-auto" {...props}>
                    {children}
                </code>
            );
        },
        pre({ node, children, ...props }) {
            return <pre className="max-w-full overflow-x-auto" {...props}>{children}</pre>
        }
    };
    const MessageContent = ({ content, role, index }: { 
        content: string; 
        role: 'user' | 'assistant';
        index: number;
    }) => (
        <div className="group relative w-full max-w-full">
            <ReactMarkdown
                className="prose prose-invert max-w-full break-words"
                components={components}
            >
                {content}
            </ReactMarkdown>
            {role === 'assistant' && (
                <button
                    onClick={() => copyToClipboard(content, index)}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 bg-white/10 rounded-md hover:bg-white/20"
                    aria-label="Copy to clipboard"
                >
                    {copiedIndex === index ? (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 text-green-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                    ) : (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 text-gray-300"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                        </svg>
                    )}
                </button>
            )}
        </div>
    );

    useEffect(() => {
        if (designerMode) {
            setSystemPrompt(`You are a senior UI/UX engineer. When given code, return ONLY:
1. Enhanced version using Tailwind CSS
2. No explanations or comments
3. Keep existing functionality
4. Use modern styling like ShadCN UI
5. Add proper dark/light mode support
6. Ensure responsive design`);
        } else {
            setSystemPrompt('You are a helpful AI assistant.');
        }
    }, [designerMode]);

    return (
        <div className="w-full h-full flex ">
            {/* Template Sidebar */}
            <div className="rounded-l-3xl w-64 border-r border-white/5 bg-[#1a1a1a] backdrop-blur-lg p-4 overflow-y-auto">
                <div className="space-y-6">
                    {/* Designer Toggle */}
                    <div className="mb-8">
                        <button
                            onClick={() => setDesignerMode(!designerMode)}
                            className={`w-full py-3 rounded-xl transition-all duration-300 ${
                                designerMode 
                                    ? 'bg-emerald-600/80 hover:bg-emerald-600 shadow-lg shadow-emerald-500/20' 
                                    : 'bg-[#1a1a1a] hover:bg-[#171717] border border-gray-700/50'
                            }`}
                        >
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                                {designerMode ? 'Design Mode Active ✨' : 'Activate Design Mode'}
                            </span>
                        </button>
                    </div>

                    {/* Template Categories */}
                    {templates.map((category, catIndex) => (
                        <div key={catIndex} className="space-y-2">
                            <h3 className="text-xs font-semibold text-gray-400/80 uppercase tracking-wider">
                                {category.category}
                            </h3>
                            {category.items.map((template, tplIndex) => {
                                const templateId = `${catIndex}-${tplIndex}`;
                                const isActive = activeTemplate === templateId;
                                return (
                                    <button
                                        key={templateId}
                                        onClick={() => applyTemplate(template.prompt, templateId)}
                                        className={`w-full p-3 text-left text-sm rounded-xl transition-all duration-300 ${
                                            isActive 
                                                ? 'bg-cyan-600/20 border-2 border-cyan-500/60 animate-pulse-slow shadow-lg shadow-cyan-500/10'
                                                : 'bg-[#1a1a1a]/30 hover:bg-[#1a1a1a]/40 border border-gray-700/30 hover:border-cyan-500/30'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className={`${
                                                isActive ? 'text-cyan-400' : 'text-gray-200'
                                            }`}>
                                                {template.name}
                                            </span>
                                            {isActive && (
                                                <span className="text-xs bg-cyan-500/20 text-cyan-400 px-2 py-1 rounded-md">
                                                    Confirm
                                                </span>
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="rounded-3xl flex-1 flex flex-col yy ">
                {/* Model Selection Header */}
                <div className="border-b rounded-tr-3xl border-white/5 p-4 bg-[#1a1a1a]">
                    <select
                        value={selectedModel}
                        onChange={(e) => setSelectedModel(e.target.value as 'reasoner' | 'chat')}
                        className="bg-[#1a1a1a]/40 text-gray-200 px-4 py-2.5 rounded-xl border border-white/5 focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20"
                    >
                        <option value="reasoner" className="bg-[#1a1a1a]">🧠 DeepSeek Reasoner</option>
                        <option value="chat" className="bg-[#1a1a1a]">💬 DeepSeek Chat</option>
                    </select>
                </div>

                {/* Chat messages */}
                <div className="bg-[#1a1a1a] flex-1 overflow-y-auto p-4 space-y-4 w-[calc(100vh-178px)]">
                    {messages.map((message, index) => (
                        <div 
                            key={index} 
                            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`max-w-[85%] ${
                                message.role === 'user' 
                                    ? 'bg-gradient-to-br from-sky-600/10 to-emerald-700/20 text-cyan-100 border border-cyan-700/30 rounded-3xl'
                                    : 'bg-[#1a1a1a]/10 border border-white/5 rounded-3xl backdrop-blur-sm'
                            } p-4 shadow-xl bg-white/5 break-words whitespace-pre-wrap overflow-x-auto max-w-full`}>
                                <div className="w-full overflow-x-hidden">
                                    <MessageContent 
                                        content={message.content} 
                                        role={message.role as 'user' | 'assistant'} 
                                        index={index}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex items-center space-x-2 text-gray-400">
                            <div className="animate-bounce">●</div>
                            <div className="animate-bounce delay-100">●</div>
                            <div className="animate-bounce delay-200">●</div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input form */}
                <div className="rounded-br-3xl border-t border-white/5 p-4 bg-[#1a1a1a]">
                    <form onSubmit={handleSubmit} className="flex flex-col-reverse gap-3">
                        <div className="flex items-end gap-3">
                            <textarea
                                ref={textareaRef}
                                rows={1}
                                value={inputText}
                                onChange={(e) => {
                                    setInputText(e.target.value);
                                    adjustTextareaHeight();
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSubmit(e);
                                    }
                                }}
                                placeholder="Type your message here... (Shift + Enter for new line)"
                                className="flex-1 p-3.5 bg-gradient-to-t from-[#1a1a1a] via-[#232323] to-[#2a2a2a] text-white/90 rounded-xl focus:outline-none  resize-none min-h-[56px] max-h-[200px] overflow-y-auto transition-[height] duration-200 ease-in-out placeholder-white/40 shadow-inner shadow-black/20 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent"
                            />
                            <button 
                                type="submit"
                                disabled={loading || !inputText.trim()}
                                className="p-3 bg-white/30 text-white rounded-xl hover:from-lime-600 hover:to-lime-700 transition-all shadow-md shadow-lime-500/10 disabled:opacity-50 disabled:pointer-events-none mb-1"
                            >
                                {loading ? (
                                    <div className="w-6 h-6 relative">
                                        <div className="absolute w-full h-full border-4 border-white/30 rounded-full" />
                                        <div className="absolute w-full h-full border-4 border-white border-t-transparent rounded-full animate-spin" />
                                    </div>
                                ) : (
                                    <svg 
                                        xmlns="http://www.w3.org/2000/svg" 
                                        viewBox="0 0 20 20" 
                                        fill="currentColor" 
                                        className="w-6 h-6"
                                    >
                                        <path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.925A1.5 1.5 0 005.135 9.25h6.115a.75.75 0 010 1.5H5.135a1.5 1.5 0 00-1.442 1.086l-1.414 4.926a.75.75 0 00.826.95 28.896 28.896 0 0015.293-7.154.75.75 0 000-1.115A28.897 28.897 0 003.105 2.289z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
} 