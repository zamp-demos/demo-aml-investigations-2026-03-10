import React, { useState, useEffect } from 'react';
import { Check, X, Loader2, Play, FileText, Trash2, Sun, AlignLeft, Square } from 'lucide-react';

const FeedbackQueuePanel = ({ isOpen, onClose, triggerRef }) => {
    const [activeTab, setActiveTab] = useState('open'); // 'open', 'queued', 'processing', 'applied'
    const [feedbackItems, setFeedbackItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [applyingId, setApplyingId] = useState(null);
    const [selectedItems, setSelectedItems] = useState(new Set());

    // Fetch queue
    const fetchQueue = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/feedback/queue`);
            if (response.ok) {
                const data = await response.json();
                setFeedbackItems(data.queue || []);
            }
        } catch (error) {
            console.error('Failed to fetch feedback queue:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchQueue();
        }
    }, [isOpen]);

    // Apply feedback
    const handleApplyFeedback = async (id) => {
        try {
            setApplyingId(id);
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/feedback/apply`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ feedbackId: id })
            });

            if (response.ok) {
                await fetchQueue();
                setActiveTab('applied');
            } else {
                console.error('Failed to apply feedback');
            }
        } catch (error) {
            console.error('Error applying feedback:', error);
        } finally {
            setApplyingId(null);
        }
    };

    // Delete feedback
    const handleDeleteFeedback = async (id) => {
        if (!window.confirm('Are you sure you want to delete this feedback?')) return;

        // Optimistic update
        const previousItems = [...feedbackItems];
        setFeedbackItems(prev => prev.filter(item => item.id !== id));

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/feedback/queue/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                console.error('Failed to delete feedback');
                // Rollback on failure
                setFeedbackItems(previousItems);
                alert('Failed to delete feedback. Please try again.');
            }
            // No need to fetchQueue here as we already updated state
        } catch (error) {
            console.error('Error deleting feedback:', error);
            setFeedbackItems(previousItems);
        }
    };

    const handleApplyAll = async () => {
        // Apply all queued items or selected items
        const itemsToApply = selectedItems.size > 0
            ? Array.from(selectedItems)
            : feedbackItems.filter(i => i.status === 'pending').map(i => i.id);

        for (const id of itemsToApply) {
            await handleApplyFeedback(id);
        }
        setSelectedItems(new Set());
    };

    // Filter items based on tab
    const getFilteredItems = () => {
        switch (activeTab) {
            case 'open': return feedbackItems.filter(i => i.status === 'open' || !i.status);
            case 'queued': return feedbackItems.filter(i => i.status === 'pending');
            case 'processing': return feedbackItems.filter(i => i.status === 'processing');
            case 'applied': return feedbackItems.filter(i => i.status === 'applied');
            default: return [];
        }
    };

    const filteredItems = getFilteredItems();
    const counts = {
        open: feedbackItems.filter(i => i.status === 'open' || !i.status).length,
        queued: feedbackItems.filter(i => i.status === 'pending').length,
        processing: feedbackItems.filter(i => i.status === 'processing').length,
        applied: feedbackItems.filter(i => i.status === 'applied').length
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Transparent backdrop to close on click outside */}
            <div className="fixed inset-0 z-40" onClick={onClose} />

            <div className="absolute top-12 right-0 w-[500px] bg-white rounded-xl shadow-xl border border-[#ebebeb] z-50 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-100 origin-top-right">
                {/* Header / Tabs */}
                <div className="flex items-center px-4 pt-4 pb-2 border-b border-[#f0f0f0] gap-4">
                    <button
                        onClick={() => setActiveTab('open')}
                        className={`pb-2 text-[13px] font-medium transition-colors relative ${activeTab === 'open' ? 'text-[#171717]' : 'text-[#8f8f8f] hover:text-[#505050]'}`}
                    >
                        <div className="flex items-center gap-2">
                            <Square size={14} className="text-blue-500" strokeWidth={2.5} />
                            <span>Open</span>
                            <span className="bg-[#f0f0f0] text-[#171717] px-1.5 py-0.5 rounded text-[10px]">{counts.open}</span>
                        </div>
                        {activeTab === 'open' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#171717] rounded-t-full" />}
                    </button>

                    <button
                        onClick={() => setActiveTab('queued')}
                        className={`pb-2 text-[13px] font-medium transition-colors relative ${activeTab === 'queued' ? 'text-[#171717]' : 'text-[#8f8f8f] hover:text-[#505050]'}`}
                    >
                        <div className="flex items-center gap-2">
                            <AlignLeft size={14} className="text-[#666]" strokeWidth={2} />
                            <span>Queued</span>
                            <span className="bg-[#f0f0f0] text-[#171717] px-1.5 py-0.5 rounded text-[10px]">{counts.queued}</span>
                        </div>
                        {activeTab === 'queued' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#171717] rounded-t-full" />}
                    </button>

                    <button
                        onClick={() => setActiveTab('processing')}
                        className={`pb-2 text-[13px] font-medium transition-colors relative ${activeTab === 'processing' ? 'text-[#171717]' : 'text-[#8f8f8f] hover:text-[#505050]'}`}
                    >
                        <div className="flex items-center gap-2">
                            <Sun className="w-3.5 h-3.5 text-[#666]" />
                            <span>Processing</span>
                            <span className="bg-[#f0f0f0] text-[#171717] px-1.5 py-0.5 rounded text-[10px]">{counts.processing}</span>
                        </div>
                        {activeTab === 'processing' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#171717] rounded-t-full" />}
                    </button>

                    <button
                        onClick={() => setActiveTab('applied')}
                        className={`pb-2 text-[13px] font-medium transition-colors relative ${activeTab === 'applied' ? 'text-[#171717]' : 'text-[#8f8f8f] hover:text-[#505050]'}`}
                    >
                        <div className="flex items-center gap-2">
                            <Check className="w-3.5 h-3.5 text-orange-600" />
                            <span>Applied</span>
                            <span className="bg-[#fff3e0] text-[#e65100] px-1.5 py-0.5 rounded text-[10px]">{counts.applied}</span>
                        </div>
                        {activeTab === 'applied' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#e65100] rounded-t-full" />}
                    </button>

                    <div className="ml-auto">
                        <button onClick={onClose} className="p-1 hover:bg-[#f5f5f5] rounded">
                            <X className="w-4 h-4 text-[#8f8f8f]" />
                        </button>
                    </div>
                </div>

                {/* Content List */}
                <div className="max-h-[400px] overflow-y-auto p-2">
                    {filteredItems.length === 0 ? (
                        <div className="py-12 text-center text-[#8f8f8f] text-[13px]">
                            No items in {activeTab}.
                        </div>
                    ) : (
                        filteredItems.map(item => (
                            <div key={item.id} className="flex gap-3 p-3 hover:bg-[#fafafa] rounded-lg group transition-colors border-b border-transparent hover:border-[#f0f0f0]">
                                <div className="pt-1">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 rounded border-[#d1d1d1] text-[#171717] focus:ring-0 focus:ring-offset-0 cursor-pointer"
                                        checked={selectedItems.has(item.id)}
                                        onChange={(e) => {
                                            const newSet = new Set(selectedItems);
                                            if (e.target.checked) newSet.add(item.id);
                                            else newSet.delete(item.id);
                                            setSelectedItems(newSet);
                                        }}
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-[14px] font-medium text-[#171717] leading-tight mb-1">
                                        {item.title || item.summary?.slice(0, 60) || "Untitled Feedback"}
                                    </div>
                                    <div className="text-[11px] text-[#8f8f8f] mb-1.5">
                                        {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Just now'} • {item.user || 'Unknown'}
                                    </div>
                                    <div className="text-[13px] text-[#525252] leading-relaxed line-clamp-2">
                                        {item.summary || item.feedback}
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDeleteFeedback(item.id); }}
                                        className="p-1.5 text-[#8f8f8f] hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                                        title="Delete feedback"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                    {item.status === 'pending' && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleApplyFeedback(item.id); }}
                                            disabled={applyingId === item.id}
                                            className="p-1.5 text-[#8f8f8f] hover:text-[#171717] hover:bg-[#f0f0f0] rounded-md transition-colors"
                                            title="Apply feedback"
                                        >
                                            {applyingId === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                {activeTab === 'queued' && (
                    <div className="p-4 border-t border-[#f0f0f0] bg-[#FAFAFA] flex items-center justify-between">
                        <div className="text-[12px] text-[#8f8f8f]">
                            Select feedback to test only some of them
                        </div>
                        <button
                            className="bg-[#171717] hover:bg-[#2e2e2e] text-white text-[13px] font-medium px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-colors"
                            onClick={handleApplyAll}
                            disabled={filteredItems.length === 0}
                        >
                            <Play className="w-3.5 h-3.5 fill-current" />
                            {selectedItems.size > 0 ? 'Apply' : 'Apply all'}
                        </button>
                    </div>
                )}
            </div>
        </>
    );
};

export default FeedbackQueuePanel;

