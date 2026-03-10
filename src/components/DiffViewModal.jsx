import React, { useMemo, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

const DiffViewModal = ({ diffData, onClose, isLoading }) => {
    const { currentVersion, previousVersion } = diffData || {};
    const contentRef = useRef(null);

    // Generate line-by-line diff with context
    const diff = useMemo(() => {
        if (!diffData || isLoading) return [];
        const { current, previous } = diffData;

        // Helper to fix \u00A0 and trim
        const cleanText = (text) => (text || '').replace(/\\u00A0/g, ' ');

        const oldLines = previous.split('\n');
        const newLines = current.split('\n');
        const rawDiff = [];

        let oldIndex = 0;
        let newIndex = 0;

        // Basic line-by-line diffing
        while (oldIndex < oldLines.length || newIndex < newLines.length) {
            const oldLine = oldLines[oldIndex];
            const newLine = newLines[newIndex];

            if (oldLine === newLine) {
                rawDiff.push({
                    type: 'unchanged',
                    content: cleanText(oldLine),
                    oldLineNum: oldIndex + 1,
                    newLineNum: newIndex + 1
                });
                oldIndex++;
                newIndex++;
            } else {
                let foundMatch = false;
                const lookAhead = 5;

                for (let i = 1; i <= lookAhead && newIndex + i < newLines.length; i++) {
                    if (oldLine === newLines[newIndex + i]) {
                        for (let j = 0; j < i; j++) {
                            rawDiff.push({
                                type: 'added',
                                content: cleanText(newLines[newIndex + j]),
                                newLineNum: newIndex + j + 1
                            });
                        }
                        newIndex += i;
                        foundMatch = true;
                        break;
                    }
                }

                if (!foundMatch) {
                    for (let i = 1; i <= lookAhead && oldIndex + i < oldLines.length; i++) {
                        if (newLine === oldLines[oldIndex + i]) {
                            for (let j = 0; j < i; j++) {
                                rawDiff.push({
                                    type: 'deleted',
                                    content: cleanText(oldLines[oldIndex + j]),
                                    oldLineNum: oldIndex + j + 1
                                });
                            }
                            oldIndex += i;
                            foundMatch = true;
                            break;
                        }
                    }
                }

                if (!foundMatch) {
                    if (oldIndex < oldLines.length) {
                        rawDiff.push({
                            type: 'deleted',
                            content: cleanText(oldLine),
                            oldLineNum: oldIndex + 1
                        });
                        oldIndex++;
                    }
                    if (newIndex < newLines.length) {
                        rawDiff.push({
                            type: 'added',
                            content: cleanText(newLine),
                            newLineNum: newIndex + 1
                        });
                        newIndex++;
                    }
                }
            }
        }

        // Apply context-aware filtering
        const contextLines = 3;
        const result = [];
        const diffMask = new Array(rawDiff.length).fill(false);

        // Mark lines to show
        rawDiff.forEach((line, i) => {
            if (line.type === 'added' || line.type === 'deleted') {
                for (let j = Math.max(0, i - contextLines); j <= Math.min(rawDiff.length - 1, i + contextLines); j++) {
                    diffMask[j] = true;
                }
            }
        });

        // Assemble result with ellipsis
        let isLastHidden = false;
        rawDiff.forEach((line, i) => {
            if (diffMask[i]) {
                result.push(line);
                isLastHidden = false;
            } else if (!isLastHidden) {
                result.push({ type: 'ellipsis' });
                isLastHidden = true;
            }
        });

        return result;
    }, [diffData, isLoading]);

    // Auto-scroll to first change
    useEffect(() => {
        if (!isLoading && diff.length > 0) {
            setTimeout(() => {
                if (contentRef.current) {
                    const firstChange = contentRef.current.querySelector('.bg-green-50\\/50, .bg-red-50\\/50');
                    if (firstChange) {
                        firstChange.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }
            }, 300);
        }
    }, [diff, isLoading]);

    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-[#f0f0f0] bg-white">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 bg-[#f5f5f5] text-[#8f8f8f] text-[10px] font-bold rounded uppercase tracking-wider">Comparison</span>
                            <h2 className="text-[18px] font-bold text-[#171717]">
                                Version {previousVersion?.version} <span className="text-[#c0c0c0] font-normal mx-1">→</span> Version {currentVersion?.version}
                            </h2>
                        </div>
                        <p className="text-[13px] text-[#555] font-medium">
                            {currentVersion?.summary?.[0] || 'Version comparison report'}
                        </p>
                        <p className="text-[11px] text-[#8f8f8f] mt-1 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                            {currentVersion?.timestamp && formatDate(currentVersion.timestamp)}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-[#f5f5f5] rounded-full transition-all group"
                    >
                        <X className="w-6 h-6 text-[#8f8f8f] group-hover:text-[#171717]" />
                    </button>
                </div>

                {/* Diff Content */}
                <div
                    ref={contentRef}
                    className="flex-1 overflow-y-auto p-6 bg-[#fafafa] scroll-smooth"
                >
                    {isLoading ? (
                        <div className="flex-1 flex flex-col items-center justify-center py-32">
                            <div className="w-10 h-10 border-3 border-[#2445ff] border-t-transparent rounded-full animate-spin mb-4" />
                            <p className="text-[15px] font-medium text-[#8f8f8f]">Calculating differences...</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl border border-[#e5e5e5] shadow-sm overflow-hidden min-h-full">
                            <div className="font-mono text-[13px] leading-relaxed">
                                {diff.map((line, index) => {
                                    if (line.type === 'ellipsis') {
                                        return (
                                            <div key={`ellipsis-${index}`} className="flex items-center justify-center py-4 bg-[#fcfcfc] border-y border-[#f0f0f0] text-[#c0c0c0] text-[11px] font-bold tracking-[4px] select-none">
                                                <span>••••••••••••••••••••••••••••</span>
                                            </div>
                                        );
                                    }

                                    const isAdded = line.type === 'added';
                                    const isDeleted = line.type === 'deleted';

                                    return (
                                        <div
                                            key={index}
                                            className={`flex transition-colors ${isAdded ? 'bg-green-50/50' :
                                                    isDeleted ? 'bg-red-50/50' :
                                                        'hover:bg-[#fcfcfc]'
                                                }`}
                                        >
                                            {/* Line Numbers */}
                                            <div className={`w-14 text-right px-3 py-1 text-[11px] select-none flex-shrink-0 border-r border-[#f0f0f0] font-medium ${isAdded ? 'text-green-600 bg-green-100/30' :
                                                    isDeleted ? 'text-red-400 bg-red-100/30' :
                                                        'text-[#c0c0c0] bg-white'
                                                }`}>
                                                {isAdded ? line.newLineNum : isDeleted ? line.oldLineNum : line.oldLineNum}
                                            </div>

                                            {/* Content */}
                                            <div className={`flex-1 px-4 py-1 whitespace-pre-wrap ${isAdded ? 'text-green-800' :
                                                    isDeleted ? 'text-red-800 line-through decoration-red-300' :
                                                        'text-[#444]'
                                                }`}>
                                                <span className={`inline-block w-4 mr-2 font-bold ${isAdded ? 'text-green-500' :
                                                        isDeleted ? 'text-red-400' :
                                                            'text-transparent'
                                                    }`}>
                                                    {isAdded ? '+' : isDeleted ? '-' : ' '}
                                                </span>
                                                {line.content || ' '}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-6 border-t border-[#f0f0f0] bg-white">
                    <div className="flex items-center gap-6 text-[12px]">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-green-500 rounded-md shadow-sm"></div>
                            <span className="text-[#333] font-medium">Added</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-red-400 rounded-md shadow-sm"></div>
                            <span className="text-[#333] font-medium">Deleted</span>
                        </div>
                        <div className="text-[#8f8f8f] text-[11px] ml-4 italic"> Showing only relevant changes and context</div>
                    </div>
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 bg-[#171717] text-white text-[14px] font-bold rounded-xl hover:bg-black hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md active:shadow-sm"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DiffViewModal;

