import React, { useState, useEffect, useRef } from 'react';
import { X, ArrowUp, Loader2, Play } from 'lucide-react';
import { generateClarifyingQuestions, summarizeFeedback, applyFeedbackToQueue } from '../services/geminiService';
import kbContent from '../data/knowledgeBase.md?raw';

const FeedbackModal = ({ isOpen, onClose }) => {
    const [workflowState, setWorkflowState] = useState('idle');
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [feedbackData, setFeedbackData] = useState({
        originalFeedback: '',
        questions: [],
        answers: [],
        summary: '',
        title: ''
    });
    const chatEndRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen) {
                handleClose();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen]);

    const handleClose = () => {
        setWorkflowState('idle');
        setMessages([]);
        setInputValue('');
        setFeedbackData({
            originalFeedback: '',
            questions: [],
            answers: [],
            summary: '',
            title: ''
        });
        onClose();
    };

    const handleSendMessage = async () => {
        if (!inputValue.trim() || isLoading) return;
        const userMessage = inputValue.trim();
        setInputValue('');

        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

        if (workflowState === 'idle') {
            setWorkflowState('analyzing');
            setIsLoading(true);
            setFeedbackData(prev => ({ ...prev, originalFeedback: userMessage }));
            setMessages(prev => [...prev, { role: 'assistant', content: 'Analysing...', isLoading: true }]);

            try {
                const result = await generateClarifyingQuestions(userMessage, kbContent);
                setMessages(prev => {
                    const filtered = prev.filter(m => !m.isLoading);
                    return [...filtered, {
                        role: 'assistant',
                        content: result.intro,
                        questions: result.questions
                    }];
                });
                setFeedbackData(prev => ({
                    ...prev,
                    questions: result.questions,
                    title: result.title || `Update: ${userMessage.slice(0, 50)}...`
                }));
                setWorkflowState('questions');
            } catch (error) {
                console.error('Error generating questions:', error);
                setMessages(prev => {
                    const filtered = prev.filter(m => !m.isLoading);
                    return [...filtered, { role: 'assistant', content: 'Error analyzing feedback. Please try again.' }];
                });
                setWorkflowState('idle');
            } finally {
                setIsLoading(false);
            }
        } else if (workflowState === 'questions') {
            setWorkflowState('summarizing');
            setIsLoading(true);
            const updatedAnswers = [...feedbackData.answers, userMessage];
            setFeedbackData(prev => ({ ...prev, answers: updatedAnswers }));
            setMessages(prev => [...prev, { role: 'assistant', content: 'Summarizing...', isLoading: true }]);

            try {
                const summary = await summarizeFeedback(feedbackData.originalFeedback, feedbackData.questions, updatedAnswers, kbContent);
                setMessages(prev => {
                    const filtered = prev.filter(m => !m.isLoading);
                    return [...filtered, { role: 'assistant', content: summary, showConfirmation: true }];
                });
                setFeedbackData(prev => ({ ...prev, summary, answers: updatedAnswers }));
                setWorkflowState('confirmed');
            } catch (error) {
                setMessages(prev => {
                    const filtered = prev.filter(m => !m.isLoading);
                    return [...filtered, { role: 'assistant', content: 'Error summarizing. Please try again.' }];
                });
                setWorkflowState('questions');
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleConfirmYes = async () => {
        setIsLoading(true);
        try {
            await applyFeedbackToQueue({
                title: feedbackData.title,
                feedback: feedbackData.originalFeedback,
                questions: feedbackData.questions,
                answers: feedbackData.answers,
                summary: feedbackData.summary,
                status: 'pending',
                createdAt: new Date().toISOString()
            });
            setMessages(prev => [...prev,
            { role: 'user', content: 'Yes' },
            { role: 'assistant', content: 'Feedback queued successfully.', showQueueButton: true }
            ]);
            setWorkflowState('queued');
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: 'Failed to queue feedback.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    // Inline ShimmerText component for simplicity
    const ShimmerText = ({ text }) => (
        <div className="relative inline-block leading-none">
            <span className="text-[13px] font-[450] block leading-[13px] text-[#A3A3A3]">{text}</span>
            <span
                className="text-[13px] font-[450] pointer-events-none absolute top-0 left-0 bg-clip-text leading-[13px] text-transparent animate-[width_1.5s_linear_infinite]"
                style={{
                    backgroundImage: 'linear-gradient(90deg, transparent 0%, transparent 40%, #5E7BFF 50%, transparent 60%, transparent 100%)',
                    backgroundSize: '200% 100%',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: '120% 0%',
                }}
            >
                {text}
            </span>
        </div>
    );

    const PaceAvatar = () => (
        <div className="flex h-4 min-h-4 w-4 min-w-4 items-center justify-center rounded-md bg-[#2445ff] text-white">
            {/* Pace Icon SVG */}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 10 10 0 0 0-5-5 10 10 0 0 1-5-5" /></svg>
        </div>
    );

    const ChatMessage = ({ msg }) => {
        const isUser = msg.role === 'user';
        return (
            <div className="flex w-full mb-6 justify-start">
                <div className="flex gap-3 w-full">
                    {/* Avatar */}
                    {isUser ? (
                        <div className="w-7 h-7 bg-[#FFE2D1] rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-[#AF521F] text-[10px] font-bold">P</span>
                        </div>
                    ) : (
                        <div className="mt-0.5">
                            <PaceAvatar />
                        </div>
                    )}

                    <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                        {/* Sender Name */}
                        <div className="flex items-center gap-2">
                            {isUser ? (
                                <span className="text-[12px] font-bold text-[#171717]">Palak</span>
                            ) : (
                                <span className="text-[12px] font-bold text-[#171717]">Pace</span>
                            )}
                        </div>

                        {/* Content */}
                        {msg.isLoading ? (
                            <div className="flex items-center gap-1.5 text-gray-700">
                                <ShimmerText text="Analysing..." />
                            </div>
                        ) : (
                            <>
                                <div className="text-[13px] text-[#171717] leading-relaxed whitespace-pre-wrap font-[450]">{msg.content}</div>
                                {msg.questions && (
                                    <ol className="mt-3 space-y-2 text-[13px] text-[#171717]">
                                        {msg.questions.map((q, idx) => (
                                            <li key={idx} className="flex gap-2"><span className="font-semibold">{idx + 1}.</span><span>{q}</span></li>
                                        ))}
                                    </ol>
                                )}
                                {msg.showConfirmation && (
                                    <div className="mt-4">
                                        <p className="text-[13px] text-[#171717] mb-3">Is this an accurate understanding of your requirements?</p>
                                        <button onClick={handleConfirmYes} disabled={isLoading} className="px-3 py-1.5 bg-[#171717] text-white text-[12px] font-medium rounded hover:bg-[#333] transition-colors disabled:opacity-50">Yes</button>
                                    </div>
                                )}
                                {msg.showQueueButton && (
                                    <div className="mt-4">
                                        <button onClick={handleClose} className="px-3 py-1.5 bg-white border border-[#e5e5e5] text-[#171717] text-[12px] font-medium rounded hover:bg-[#fafafa] transition-colors flex items-center gap-2">
                                            <span>Close</span>
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    if (!isOpen) return null;

    return (
        // Modal Wrapper - NO BLUR, NO DARK OVERLAY
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
            {/* Actual Modal - Pointer events auto to allow interaction */}
            <div className="pointer-events-auto relative shadow-chatbot-shadow w-[380px] space-y-1.5 rounded-[22px] border border-gray-500 bg-white p-0 animate-in fade-in zoom-in-95 duration-200">
                <div className="bg-white flex max-h-[600px] flex-col rounded-[22px] p-1.5">

                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 shrink-0">
                        <div className="flex items-center gap-2">
                            <span className="text-[13px] font-medium text-[#171717]">
                                {feedbackData.title || 'Work with Pace'}
                            </span>
                        </div>
                        {/* Close button hidden or strictly minimal for cleaner look */}
                        <button onClick={handleClose} className="p-1 hover:bg-black/5 rounded-full transition-colors opacity-50 hover:opacity-100">
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    {/* Content Wrapper */}
                    <div className="shadow-table-filter-menu flex min-h-0 flex-1 flex-col rounded-b-[16px] border-x border-b border-white bg-white">

                        {/* Messages Area */}
                        {messages.length > 0 ? (
                            <div className="min-h-0 flex-1 space-y-6 overflow-y-auto p-4 [&::-webkit-scrollbar]:hidden">
                                {messages.map((msg, idx) => <ChatMessage key={idx} msg={msg} />)}
                                <div ref={chatEndRef} />
                            </div>
                        ) : (
                            /* Empty state */
                            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[200px]">
                                <PaceAvatar />
                                <p className="text-[13px] text-[#8f8f8f] mt-3 font-[450]">Ask a question or provide feedback to improve the process.</p>
                            </div>
                        )}

                        {/* Input Area */}
                        <div className="p-3">
                            <div className="shadow-side-drawer-inner rounded-xl border border-[#e5e5e5] bg-white relative">
                                <textarea
                                    ref={inputRef}
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
                                    placeholder="Ask anything or give feedback..."
                                    disabled={isLoading || workflowState === 'queued'}
                                    className="w-[calc(100%-20px)] text-[13px] font-[450] placeholder:text-[#8f8f8f] text-[#171717] min-h-[20px] max-h-[140px] resize-none border-none bg-transparent m-2.5 p-0 focus:ring-0 focus:outline-none overflow-y-auto shadow-none outline-none leading-[18px]"
                                    rows={1}
                                    style={{ height: 'auto', minHeight: '20px' }}
                                />
                                <div className="flex items-center justify-between py-2.5 pr-2.5 pl-1.5">
                                    <div className="flex items-center gap-1">
                                        <button className="p-1 hover:bg-[#f5f5f5] rounded text-[#171717] hover:bg-gray-300">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" x2="12" y1="19" y2="22" /></svg>
                                        </button>
                                        <button className="p-1 hover:bg-[#f5f5f5] rounded text-[#171717] hover:bg-gray-300">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" /></svg>
                                        </button>
                                    </div>
                                    <button
                                        onClick={handleSendMessage}
                                        disabled={!inputValue.trim() || isLoading}
                                        className={`p-1.5 rounded-full transition-colors flex items-center justify-center !size-5 [&_svg]:size-3 ${inputValue.trim() && !isLoading ? 'bg-[#171717] text-white' : 'bg-transparent text-[#e5e5e5]'}`}
                                    >
                                        <ArrowUp className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default FeedbackModal;

