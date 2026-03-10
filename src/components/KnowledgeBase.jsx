import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ArrowUp, Activity, Link, X, MessageSquare, Send, Loader2, PlusCircle, History } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { chatWithKnowledgeBase } from '../services/geminiService';
import VersionHistoryPanel from './VersionHistoryPanel';
import DiffViewModal from './DiffViewModal';

// Import all knowledge base contents
import kbContent from '../data/knowledgeBase.md?raw';

const KnowledgeBase = () => {
    const currentKb = { label: 'Knowledge Base', shortLabel: 'KB' };
    const knowledgeBaseContent = kbContent;

    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [highlightText, setHighlightText] = useState(null);
    const [viewingVersion, setViewingVersion] = useState(null);
    const [displayContent, setDisplayContent] = useState(knowledgeBaseContent);
    const [latestVersion, setLatestVersion] = useState(null);

    // Diff Modal State
    const [showDiffModal, setShowDiffModal] = useState(false);
    const [isDiffLoading, setIsDiffLoading] = useState(false);
    const [diffData, setDiffData] = useState(null);

    const chatEndRef = useRef(null);
    const contentRef = useRef(null);

    // Initial state: No chat messages = full width content with floating chat box at bottom
    // After first message = split view (Chat left, Content right)
    const hasStartedChat = messages.length > 0;

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        const fetchLatestVersion = async () => {
            try {
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
                const response = await fetch(`${API_URL}/api/kb/versions`);
                if (response.ok) {
                    const data = await response.json();
                    if (data.versions && data.versions.length > 0) {
                        setLatestVersion(data.versions[0]);
                    }
                }
            } catch (error) {
                console.error('Error fetching latest version:', error);
            }
        };
        fetchLatestVersion();
    }, []);

    const handleSendMessage = async () => {
        if (!inputValue.trim() || isLoading) return;

        const userMsg = {
            role: 'user',
            content: inputValue,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setIsLoading(true);

        try {
            const response = await chatWithKnowledgeBase(inputValue, knowledgeBaseContent, messages);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: response,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
        } catch (error) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Encountered an error. Please try again.'
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const ChatMessage = ({ msg }) => {
        const isUser = msg.role === 'user';
        return (
            <div className="flex w-full mb-8 justify-start">
                <div className="flex gap-4 w-full">
                    <div className={`w-8 h-8 rounded flex items-center justify-center flex-shrink-0 mt-0.5 ${isUser ? 'bg-[#FFE2D1]' : 'bg-[#2445ff]'
                        }`}>
                        {isUser ? (
                            <span className="text-[#AF521F] text-xs font-bold font-sans">V</span>
                        ) : (
                            <img src="/adam-icon.svg" alt="Pace" className="w-5 h-5 invert brightness-0" />
                        )}
                    </div>
                    <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <span className="text-[13px] font-bold text-[#171717]">{isUser ? 'Vignesh' : 'Pace'}</span>
                        </div>
                        <div className="text-[13px] text-[#171717] leading-relaxed break-words whitespace-pre-wrap">
                            {msg.content}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="flex h-full bg-[#FAFAFA] font-sans">
            {/* Split View Container */}
            <div className={`flex w-full h-full transition-all duration-500 ease-in-out`}>

                {/* Left Panel: Chat (Appears after chat starts) */}
                <div className={`h-full bg-white border-r border-[#ebebeb] flex flex-col transition-all duration-500 ease-in-out overflow-hidden ${hasStartedChat ? 'w-[400px] opacity-100' : 'w-0 opacity-0'
                    }`}>
                    {/* Chat Header */}
                    <div className="h-12 border-b border-[#ebebeb] flex items-center justify-between px-4 shrink-0">
                        <h2 className="text-[13px] font-bold text-[#171717] transition-all duration-300">
                            {messages[0]?.content || "Chat"}
                        </h2>
                        <button
                            onClick={() => { setMessages([]); setInputValue(''); }}
                            className="p-1 hover:bg-[#00000005] rounded-full text-[#8f8f8f] hover:text-[#171717] transition-all"
                            title="New chat"
                        >
                            <PlusCircle className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Chat Messages */}
                    <div className="flex-1 overflow-y-auto p-6">
                        {messages.map((msg, idx) => <ChatMessage key={idx} msg={msg} />)}
                        {isLoading && (
                            <div className="flex gap-4 mb-8">
                                <div className="w-8 h-8 rounded bg-[#2445ff] flex items-center justify-center flex-shrink-0">
                                    <img src="/adam-icon.svg" alt="Pace" className="w-5 h-5 invert brightness-0" />
                                </div>
                                <div className="flex flex-col gap-2 flex-1">
                                    <span className="text-[13px] font-bold text-[#171717]">Pace</span>
                                    <div className="flex gap-1.5 items-center">
                                        <div className="w-1.5 h-1.5 bg-[#2445ff] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <div className="w-1.5 h-1.5 bg-[#2445ff] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <div className="w-1.5 h-1.5 bg-[#2445ff] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Chat Input (Sticky) */}
                    <div className="p-4 border-t border-[#ebebeb]">
                        <div className="relative">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                placeholder="Ask anything or give feedback..."
                                className="w-full bg-[#fbfbfb] border border-[#ebebeb] rounded-xl pl-4 pr-10 py-3 text-[15px] placeholder-[#8f8f8f] focus:outline-none focus:border-[#c9c9c9] transition-all"
                            />
                            <button
                                onClick={handleSendMessage}
                                disabled={!inputValue.trim() || isLoading}
                                className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all ${inputValue.trim() ? 'bg-black text-white' : 'bg-transparent text-[#cacaca]'
                                    }`}
                            >
                                <ArrowUp className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Panel/Main: Documentation Content */}
                <div className="flex-1 h-full flex flex-col bg-white overflow-hidden relative">
                    <div className="flex-1 overflow-y-auto flex flex-col items-center">
                        <div className="max-w-4xl w-full px-12 py-8 min-h-full">
                            {/* Title Section */}
                            <div className="mb-8">
                                <div className="flex items-center justify-between mb-2">
                                    <h1 className="text-[36px] font-bold text-[#171717]">{currentKb.label}</h1>
                                    {viewingVersion && (
                                        <div className="flex items-center gap-3">
                                            <div className="px-3 py-1 bg-[#2445ff10] text-[#2445ff] text-[12px] font-bold rounded-full border border-[#2445ff20] flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 bg-[#2445ff] rounded-full animate-pulse" />
                                                Viewing Version {viewingVersion.version}
                                            </div>
                                            {viewingVersion && (
                                                <button
                                                    onClick={() => {
                                                        setViewingVersion(null);
                                                        setDisplayContent(knowledgeBaseContent);
                                                        setHighlightText(null);
                                                    }}
                                                    className="flex items-center gap-1.5 px-3 py-1 bg-[#f5f5f5] text-[#8f8f8f] hover:text-[#171717] text-[12px] font-medium rounded-full transition-colors"
                                                >
                                                    <ArrowUp className="w-3 h-3 rotate-180" />
                                                    Back to current
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-6">
                                    <div className="flex items-center gap-10">
                                        <div className="flex items-center gap-2 text-[14px] text-[#666666] w-28">
                                            <Activity className="w-4 h-4" />
                                            <span>Trigger</span>
                                        </div>
                                        <button className="flex items-center gap-2 px-3 py-1.5 rounded border border-[#ebebeb] text-[13px] font-medium text-[#171717] hover:bg-[#fbfbfb]">
                                            <div className="w-4 h-4 rounded-full border border-current flex items-center justify-center">
                                                <div className="w-2 h-2 rounded-full bg-current" />
                                            </div>
                                            Add
                                        </button>
                                    </div>

                                    <div className="flex items-center gap-10">
                                        <div className="flex items-center gap-2 text-[14px] text-[#666666] w-28">
                                            <Link className="w-4 h-4" />
                                            <span>Integration</span>
                                        </div>
                                        <button className="flex items-center gap-2 px-3 py-1.5 rounded border border-[#ebebeb] text-[13px] font-medium text-[#171717] hover:bg-[#fbfbfb]">
                                            <div className="w-4 h-4 rounded-full border border-current flex items-center justify-center">
                                                <div className="w-2 h-2 rounded-full bg-current" />
                                            </div>
                                            Add
                                        </button>
                                    </div>

                                    <div className="flex items-center gap-10">
                                        <div className="flex items-center gap-2 text-[14px] text-[#666666] w-28">
                                            <History className="w-4 h-4" />
                                            <span>History</span>
                                        </div>
                                        <button
                                            onClick={() => setIsHistoryOpen(true)}
                                            className="flex items-center gap-2 px-3 py-1.5 rounded border border-[#ebebeb] text-[13px] font-medium text-[#171717] hover:bg-[#fbfbfb]"
                                        >
                                            View versions
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="h-px bg-[#ebebeb] w-full mb-8" />

                            {/* Markdown Content */}
                            <div className="kb-content" ref={contentRef}>
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    components={{
                                        p: ({ node, ...props }) => {
                                            const content = props.children;
                                            if (typeof content === 'string' && highlightText && content.includes(highlightText)) {
                                                const parts = content.split(new RegExp(`(${highlightText})`, 'gi'));
                                                return (
                                                    <p {...props}>
                                                        {parts.map((part, i) =>
                                                            part.toLowerCase() === highlightText.toLowerCase() ?
                                                                <mark key={i} className="bg-yellow-200 px-1 rounded">{part}</mark> : part
                                                        )}
                                                    </p>
                                                );
                                            }
                                            return <p {...props} />;
                                        },
                                        li: ({ node, ...props }) => {
                                            const content = props.children;
                                            // Recursively handle string children in LI
                                            const processContent = (items) => {
                                                return React.Children.map(items, item => {
                                                    if (typeof item === 'string' && highlightText && item.includes(highlightText)) {
                                                        const parts = item.split(new RegExp(`(${highlightText})`, 'gi'));
                                                        return parts.map((part, i) =>
                                                            part.toLowerCase() === highlightText.toLowerCase() ?
                                                                <mark key={i} className="bg-yellow-200 px-1 rounded">{part}</mark> : part
                                                        );
                                                    }
                                                    return item;
                                                });
                                            };
                                            return <li {...props}>{processContent(props.children)}</li>;
                                        }
                                    }}
                                >
                                    {displayContent}
                                </ReactMarkdown>
                            </div>
                        </div>
                    </div>

                    {/* Floating Chat Box (Only before first message) */}
                    {!hasStartedChat && (
                        <div className="absolute bottom-10 left-0 right-0 w-full flex justify-center px-4 pointer-events-none z-10">
                            <div className="max-w-[600px] w-full bg-white border border-[#ebebeb] rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] p-1 flex items-center pointer-events-auto">
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                    placeholder="Ask away or give feedback to ✦ Pace"
                                    className="flex-1 px-5 py-3.5 text-[17px] text-[#171717] placeholder-[#8f8f8f] focus:outline-none bg-transparent"
                                />
                                <button
                                    onClick={handleSendMessage}
                                    disabled={!inputValue.trim() || isLoading}
                                    className={`mr-2 p-2 rounded-lg transition-all ${inputValue.trim() ? 'bg-[#171717] text-white shadow-sm' : 'bg-transparent text-[#e5e5e5]'
                                        }`}
                                >
                                    <ArrowUp className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <VersionHistoryPanel
                isOpen={isHistoryOpen}
                onClose={() => setIsHistoryOpen(false)}
                onRestore={() => {
                    setIsHistoryOpen(false);
                    window.location.reload();
                }}
                onViewChanges={async (version, index, allVersions) => {
                    const previousVersion = allVersions[index + 1];
                    if (!previousVersion) return;

                    // 1. Open diff modal immediately (immediacy!)
                    setShowDiffModal(true);
                    setIsDiffLoading(true);
                    setDiffData({
                        currentVersion: version,
                        previousVersion: previousVersion,
                        current: '',
                        previous: ''
                    });

                    // 2. Select version in background (background update)
                    handleSelectVersion(version);

                    // 3. Fetch data for diff
                    try {
                        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
                        const [currentRes, previousRes] = await Promise.all([
                            fetch(`${API_URL}/api/kb/content?versionId=${version.id}`),
                            fetch(`${API_URL}/api/kb/content?versionId=${previousVersion.id}`)
                        ]);

                        if (!currentRes.ok || !previousRes.ok) throw new Error('Failed to fetch version content');

                        const currentData = await currentRes.json();
                        const previousData = await previousRes.json();

                        setDiffData({
                            current: currentData.content,
                            previous: previousData.content,
                            currentVersion: version,
                            previousVersion: previousVersion
                        });
                        setIsDiffLoading(false);
                    } catch (error) {
                        console.error('Error fetching versions for diff:', error);
                        setIsDiffLoading(false);
                        setShowDiffModal(false);
                    }
                }}
                onSelectVersion={(version) => {
                    setIsHistoryOpen(false);
                    handleSelectVersion(version);
                }}
            />

            {/* Global Diff Modal (Mounted at root for persistence) */}
            {showDiffModal && diffData && (
                <DiffViewModal
                    diffData={diffData}
                    isLoading={isDiffLoading}
                    onClose={() => {
                        setShowDiffModal(false);
                        setDiffData(null);
                    }}
                />
            )}
        </div >
    );

    async function handleSelectVersion(version) {
        setViewingVersion(version);

        // Fetch version content
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            const response = await fetch(`${API_URL}/api/kb/content?versionId=${version.id}`);
            if (response.ok) {
                const data = await response.json();
                setDisplayContent(data.content || knowledgeBaseContent);

                // Try to find the change to highlight
                if (version.changes && version.changes.length > 0) {
                    // Extract keywords from change summary for highlighting
                    const changeText = version.changes[0];
                    let highlightCandidate = changeText;
                    if (changeText.includes(':')) {
                        highlightCandidate = changeText.split(':')[1].trim();
                    }

                    if (highlightCandidate.length > 60) {
                        highlightCandidate = highlightCandidate.substring(0, 60);
                    }

                    setHighlightText(highlightCandidate);

                    // Scroll to highlighted content after a short delay
                    setTimeout(() => {
                        if (contentRef.current) {
                            const markElement = contentRef.current.querySelector('mark');
                            if (markElement) {
                                markElement.scrollIntoView({
                                    behavior: 'smooth',
                                    block: 'center'
                                });

                                // Subtle flash effect
                                markElement.style.transition = 'background-color 0.5s';
                                const originalColor = markElement.style.backgroundColor;
                                markElement.style.backgroundColor = '#fde047';
                                setTimeout(() => {
                                    markElement.style.backgroundColor = originalColor;
                                }, 1000);
                            }
                        }
                    }, 300); // Reduced delay for better feel
                }
            }
        } catch (error) {
            console.error('Error viewing version:', error);
        }
    }
};

export default KnowledgeBase;
