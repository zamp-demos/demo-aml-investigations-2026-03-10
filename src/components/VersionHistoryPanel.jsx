import React, { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronDown, Calendar, Loader2, RotateCcw } from 'lucide-react';

const VersionHistoryPanel = ({ isOpen, onClose, onRestore, onSelectVersion, onViewChanges }) => {
    const [versions, setVersions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [expandedVersions, setExpandedVersions] = useState([]);
    const [dateFilter, setDateFilter] = useState(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [restoringId, setRestoringId] = useState(null);

    useEffect(() => {
        if (isOpen) {
            loadVersionHistory();
        }
    }, [isOpen]);

    const loadVersionHistory = async () => {
        setIsLoading(true);
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            const response = await fetch(`${API_URL}/api/kb/versions`);
            if (response.ok) {
                const data = await response.json();
                setVersions(data.versions || []);
            }
        } catch (error) {
            console.error('Error loading version history:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRestore = async (versionId) => {
        setRestoringId(versionId);
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            const response = await fetch(`${API_URL}/api/kb/restore`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ versionId })
            });
            if (response.ok) {
                onRestore?.();
                await loadVersionHistory();
            }
        } catch (error) {
            console.error('Error restoring version:', error);
        } finally {
            setRestoringId(null);
        }
    };

    const toggleExpanded = (versionId) => {
        setExpandedVersions(prev =>
            prev.includes(versionId)
                ? prev.filter(id => id !== versionId)
                : [...prev, versionId]
        );
    };


    const formatDate = (timestamp) => {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        return date.toLocaleString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
            day: 'numeric',
            month: 'short'
        });
    };

    const getFilteredVersions = () => {
        if (!dateFilter) return versions;
        return versions.filter(v => {
            const vDate = new Date(v.timestamp);
            if (dateFilter.from && vDate < new Date(dateFilter.from)) return false;
            if (dateFilter.to && vDate > new Date(dateFilter.to)) return false;
            return true;
        });
    };

    const filteredVersions = getFilteredVersions();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/10"
                onClick={onClose}
            />

            {/* Panel */}
            <div className="relative w-[420px] h-full bg-white shadow-2xl border-l border-[#e5e5e5] animate-in slide-in-from-right duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-[#ebebeb]">
                    <h2 className="text-[14px] font-semibold text-[#171717]">Version history</h2>
                    <div className="flex items-center gap-2">
                        {/* Date Filter */}
                        <div className="relative">
                            <button
                                onClick={() => setShowDatePicker(!showDatePicker)}
                                className={`flex items-center gap-1.5 px-2 py-1 text-[11px] rounded border transition-colors ${dateFilter
                                    ? 'border-[#171717] text-[#171717] bg-[#f5f5f5]'
                                    : 'border-[#e0e0e0] text-[#8f8f8f] hover:border-[#c0c0c0]'
                                    }`}
                            >
                                <Calendar className="w-3 h-3" />
                                {dateFilter ? 'Date ×' : 'Date'}
                            </button>

                            {showDatePicker && (
                                <div className="absolute top-full right-0 mt-1 w-[200px] bg-white border border-[#e0e0e0] rounded-lg shadow-lg p-3 z-10">
                                    <div className="flex gap-2 mb-3 text-[11px]">
                                        {['Day', 'Month', 'Quarter', 'Year'].map(period => (
                                            <button
                                                key={period}
                                                className="px-2 py-1 rounded hover:bg-[#f5f5f5] text-[#666]"
                                            >
                                                {period}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="space-y-2">
                                        <div>
                                            <label className="text-[10px] text-[#8f8f8f]">From</label>
                                            <input
                                                type="date"
                                                className="w-full px-2 py-1 text-[11px] border border-[#e0e0e0] rounded"
                                                onChange={(e) => setDateFilter(prev => ({ ...prev, from: e.target.value }))}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-[#8f8f8f]">To</label>
                                            <input
                                                type="date"
                                                className="w-full px-2 py-1 text-[11px] border border-[#e0e0e0] rounded"
                                                onChange={(e) => setDateFilter(prev => ({ ...prev, to: e.target.value }))}
                                            />
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setDateFilter(null);
                                            setShowDatePicker(false);
                                        }}
                                        className="mt-2 w-full px-2 py-1 text-[11px] text-[#8f8f8f] hover:text-[#171717]"
                                    >
                                        Clear filter
                                    </button>
                                </div>
                            )}
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-[#f5f5f5] rounded transition-colors"
                        >
                            <X className="w-4 h-4 text-[#8f8f8f]" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="overflow-y-auto p-4" style={{ height: 'calc(100% - 56px)' }}>
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-5 h-5 animate-spin text-[#8f8f8f]" />
                        </div>
                    ) : filteredVersions.length === 0 ? (
                        <div className="text-center py-8 text-[#8f8f8f] text-[13px]">
                            No version history yet
                        </div>
                    ) : (
                        <div className="relative">
                            {/* Timeline line */}
                            <div className="absolute left-[7px] top-4 bottom-4 w-[2px] bg-[#ebebeb]" />

                            <div className="space-y-4">
                                {filteredVersions.map((version, index) => (
                                    <div key={version.id} className="relative pl-6">
                                        {/* Timeline dot */}
                                        <div className={`absolute left-0 top-1 w-4 h-4 rounded-full border-2 ${index === 0
                                            ? 'bg-[#16a34a] border-[#16a34a]'
                                            : 'bg-white border-[#d0d0d0]'
                                            }`}>
                                            {index === 0 && (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="w-1.5 h-1.5 bg-white rounded-full" />
                                                </div>
                                            )}
                                        </div>

                                        <div
                                            className="bg-[#fafafa] border border-[#ebebeb] rounded-lg p-3 cursor-pointer hover:border-[#171717] transition-all group"
                                            onClick={() => onSelectVersion?.(version)}
                                        >
                                            {/* Version header */}
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[12px] font-semibold text-[#171717]">
                                                        Version {version.version}
                                                    </span>
                                                    <span className="text-[11px] text-[#8f8f8f]">
                                                        {formatDate(version.timestamp)}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {index === 0 && (
                                                        <span className="px-2 py-0.5 bg-[#e8f5e9] text-[#16a34a] text-[10px] font-medium rounded">
                                                            Current
                                                        </span>
                                                    )}
                                                    <div
                                                        className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-[#2445ff] font-medium cursor-pointer"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onViewChanges?.(version, index, filteredVersions);
                                                        }}
                                                    >
                                                        View changes
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Changes list */}
                                            {version.changes && version.changes.length > 0 && (
                                                <ul className="space-y-1 mb-3">
                                                    {version.changes.map((change, idx) => (
                                                        <li key={idx} className="flex items-start gap-2 text-[12px] text-[#444]">
                                                            <span className="text-[#8f8f8f] mt-1">•</span>
                                                            <span>{change}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}

                                            {/* Contributing feedback */}
                                            {version.contributingFeedback && version.contributingFeedback.length > 0 && (
                                                <div className="mb-3">
                                                    <button
                                                        onClick={() => toggleExpanded(version.id)}
                                                        className="flex items-center gap-1 text-[11px] text-[#8f8f8f] hover:text-[#171717]"
                                                    >
                                                        {expandedVersions.includes(version.id) ? (
                                                            <ChevronDown className="w-3 h-3" />
                                                        ) : (
                                                            <ChevronRight className="w-3 h-3" />
                                                        )}
                                                        Contributing feedback {version.contributingFeedback.length}
                                                    </button>

                                                    {expandedVersions.includes(version.id) && (
                                                        <div className="mt-2 pl-4 space-y-2">
                                                            {version.contributingFeedback.map((fb, idx) => (
                                                                <div key={idx} className="text-[11px] text-[#666]">
                                                                    <span className="font-medium">{fb.title}</span>
                                                                    <div className="text-[#8f8f8f]">
                                                                        Applied {fb.appliedAt} • {fb.user}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Restore button */}
                                            {index !== 0 && (
                                                <button
                                                    onClick={() => handleRestore(version.id)}
                                                    disabled={restoringId === version.id}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 border border-[#e0e0e0] rounded-md text-[11px] text-[#666] hover:bg-[#f5f5f5] hover:text-[#171717] transition-colors disabled:opacity-50"
                                                >
                                                    {restoringId === version.id ? (
                                                        <Loader2 className="w-3 h-3 animate-spin" />
                                                    ) : (
                                                        <RotateCcw className="w-3 h-3" />
                                                    )}
                                                    Restore v.{version.version}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
};

export default VersionHistoryPanel;

