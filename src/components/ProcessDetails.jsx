import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FileText, Video, Database, ChevronUp, ChevronDown, Check, Maximize2, Loader2, Star, MonitorPlay, Image as ImageIcon, Table as TableIcon, Send, X, Trash2, ArrowLeft, MoreHorizontal, Minimize2, Bold, Italic, Underline, AlignLeft, List, Link, Asterisk, Presentation, ArrowUp, ArrowDown, Activity, ExternalLink, Search, Minus, Plus as PlusIcon, RotateCw, Download, Printer, Pin, Menu, Filter, Sliders, Layout, LayoutGrid } from 'lucide-react';


const VideoViewer = ({ artifact, onClose }) => {
    return (
        <div className="flex flex-col h-full bg-[#f4f4f4] overflow-hidden flex-1 min-w-[500px]">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
                <div className="flex items-center gap-3">
                    <button className="p-1 hover:bg-gray-100 rounded">
                        <MoreHorizontal className="w-4 h-4 text-gray-500" />
                    </button>
                    <span className="font-medium text-gray-900 text-sm">Video Recording</span>
                </div>
                <div className="flex items-center gap-2">
                    <button className="p-1.5 hover:bg-gray-100 rounded text-gray-400"><Maximize2 className="w-4 h-4" /></button>
                    <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded text-gray-400"><X className="w-5 h-5" /></button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 flex items-center justify-center p-8 bg-[#f9fafb]">
                <div className="w-full max-w-4xl aspect-video bg-black rounded-lg shadow-xl overflow-hidden relative group">
                    {artifact.videoPath ? (
                        artifact.videoPath.endsWith('.webp') || artifact.videoPath.endsWith('.png') || artifact.videoPath.endsWith('.jpg') ? (
                            <img
                                src={`${import.meta.env.VITE_API_URL || ''}${artifact.videoPath}`}
                                alt={artifact.label}
                                className="w-full h-full object-contain"
                            />
                        ) : (
                            <video
                                controls
                                autoPlay
                                className="w-full h-full"
                                src={`${import.meta.env.VITE_API_URL || ''}${artifact.videoPath}`}
                            >
                                Your browser does not support the video tag.
                            </video>
                        )
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                            <Video className="w-16 h-16 mb-4 opacity-20" />
                            <p className="text-sm">Video content not available</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const DocumentViewer = ({ artifact, onClose }) => {
    const [zoom, setZoom] = useState(100);
    const [activePage, setActivePage] = useState(1);

    const getMockTotalPages = (label) => {
        const l = (label || '').toLowerCase();
        if (l.includes('protocol')) return 45;
        if (l.includes('sow')) return 12;
        if (l.includes('invoice')) return 2;
        if (l.includes('quotation')) return 3;
        if (l.includes('report')) return 8;
        return 6;
    };

    const totalPages = artifact.totalPages || getMockTotalPages(artifact.label);
    const scale = (zoom / 100) * 0.7;
    const baseWidth = 850;
    const baseHeight = 850 * 1.414;

    return (
        <div className="flex flex-col h-full bg-[#f4f4f4] overflow-hidden flex-1 min-w-[500px]">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-200 bg-white">
                <div className="flex items-center gap-2 text-[13px]">
                    <button className="p-1 hover:bg-gray-100 rounded">
                        <MoreHorizontal className="w-4 h-4 text-gray-500" />
                    </button>
                    <span className="text-gray-400">Document</span>
                    <span className="text-gray-300">/</span>
                    <span className="font-medium text-gray-900 truncate max-w-[400px]">{artifact.label}</span>
                </div>
                <div className="flex items-center gap-1">
                    <button className="p-1.5 hover:bg-gray-100 rounded text-gray-400"><Maximize2 className="w-4 h-4" /></button>
                    <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
                </div>
            </div>

            {/* Utility Bar */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-[#f8f9fa]">
                <div className="flex items-center gap-3 bg-white border border-gray-300 rounded px-3 py-1.5 w-72 shadow-sm focus-within:border-gray-400 transition-colors">
                    <Search className="w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search PDF"
                        className="bg-transparent border-none outline-none text-xs w-full placeholder-gray-400"
                    />
                </div>

                <div className="flex items-center gap-1">
                    <div className="flex items-center gap-2 px-2 text-[11px] text-gray-600">
                        <input
                            type="text"
                            className="w-10 h-6 bg-white border border-gray-300 rounded text-center outline-none"
                            value={activePage}
                            onChange={(e) => {
                                const val = parseInt(e.target.value);
                                if (!isNaN(val) && val >= 1 && val <= totalPages) setActivePage(val);
                            }}
                        />
                        <span>/ {totalPages}</span>
                    </div>
                    <div className="h-4 w-px bg-gray-300 mx-2"></div>
                    <button
                        onClick={() => setZoom(Math.max(25, zoom - 10))}
                        className="p-1.5 hover:bg-gray-200 rounded text-gray-600"
                    >
                        <Minus className="w-3.5 h-3.5" />
                    </button>
                    <div className="px-2 py-1 bg-white border border-gray-300 rounded text-[11px] text-gray-700 min-w-[50px] text-center">
                        {zoom}%
                    </div>
                    <button
                        onClick={() => setZoom(Math.min(300, zoom + 10))}
                        className="p-1.5 hover:bg-gray-200 rounded text-gray-600"
                    >
                        <PlusIcon className="w-3.5 h-3.5" />
                    </button>
                    <div className="h-4 w-px bg-gray-300 mx-2"></div>
                    <button className="p-1.5 hover:bg-gray-200 rounded text-gray-600"><RotateCw className="w-3.5 h-3.5" /></button>
                    <button className="p-1.5 hover:bg-gray-200 rounded text-gray-600"><Link className="w-3.5 h-3.5" /></button>
                    <button className="p-1.5 hover:bg-gray-200 rounded text-gray-600"><Download className="w-3.5 h-3.5" /></button>
                    <button className="p-1.5 hover:bg-gray-200 rounded text-gray-600"><Printer className="w-3.5 h-3.5" /></button>
                    <button className="p-1.5 hover:bg-gray-200 rounded text-gray-600"><Pin className="w-3.5 h-3.5" /></button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-auto bg-[#525659] p-12 flex justify-center shadow-inner relative scroll-smooth">
                <div
                    style={{
                        width: `${baseWidth * scale}px`,
                        height: `${baseHeight * scale}px`,
                        minHeight: `${baseHeight * scale}px`,
                        position: 'relative'
                    }}
                >
                    <div
                        className="bg-white shadow-2xl rounded-sm transition-transform duration-200 origin-top-left absolute top-0 left-0"
                        style={{
                            transform: `scale(${scale})`,
                            width: `${baseWidth}px`,
                            height: `${baseHeight}px`,
                        }}
                    >
                        {artifact.pdfPath ? (
                            <iframe
                                src={`${import.meta.env.VITE_API_URL || ''}${artifact.pdfPath}#toolbar=0&view=FitH&page=${activePage}`}
                                className="w-full h-full border-none"
                                title={artifact.label}
                                key={`${artifact.id}-${activePage}`}
                            />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center p-20 text-gray-400">
                                <FileText className="w-16 h-16 mb-4 opacity-20" />
                                <p className="text-sm">Document preview not available</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Floating bottom nav */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-[#1a1a1a]/90 px-4 py-2 rounded-lg text-white text-xs backdrop-blur-sm shadow-xl z-30">
                    <button className="hover:text-gray-300"><Search className="w-4 h-4" /></button>
                    <div className="h-4 w-px bg-white/20"></div>
                    <div className="flex items-center gap-2">
                        <button className="hover:text-gray-300" onClick={() => setActivePage(Math.max(1, activePage - 1))}><ChevronUp className="w-4 h-4" /></button>
                        <span className="min-w-[40px] text-center font-medium">{activePage} / {totalPages}</span>
                        <button className="hover:text-gray-300" onClick={() => setActivePage(Math.min(totalPages, activePage + 1))}><ChevronDown className="w-4 h-4" /></button>
                    </div>
                    <div className="h-4 w-px bg-white/20"></div>
                    <div className="flex items-center gap-3">
                        <button className="hover:text-gray-300" onClick={() => setZoom(Math.max(25, zoom - 10))}><Minus className="w-4 h-4" /></button>
                        <button className="hover:text-gray-300" onClick={() => setZoom(Math.min(300, zoom + 10))}><PlusIcon className="w-4 h-4" /></button>
                    </div>
                    <div className="h-4 w-px bg-white/20"></div>
                    <button className="hover:text-gray-300"><Maximize2 className="w-4 h-4" /></button>
                </div>
            </div>
        </div>
    );
};

const DatasetViewer = ({ artifact, onClose }) => {
    const isTableArtifact = artifact.type === 'table' && Array.isArray(artifact.data);
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'table'
    const [editableData, setEditableData] = useState(() => {
        const initial = artifact.data || {};
        if (typeof initial !== 'object' || Array.isArray(initial)) return initial;

        // Ensure values are strings for editing
        const formatted = {};
        Object.entries(initial).forEach(([k, v]) => {
            if (v === null || v === undefined) formatted[k] = '';
            else if (Array.isArray(v)) formatted[k] = v.map(item => typeof item === 'object' ? (item.name || item.label || JSON.stringify(item)) : item).join(', ');
            else if (typeof v === 'object') {
                if (v.status) formatted[k] = v.status + (v.expiration ? ` (Expires: ${v.expiration})` : '');
                else if (v.date) formatted[k] = v.status || v.date;
                else if (v.name) formatted[k] = v.name;
                else formatted[k] = Object.entries(v).map(([propK, propV]) => `${propK}: ${propV}`).join(', ');
            } else {
                formatted[k] = v.toString();
            }
        });
        return formatted;
    });

    const handleFieldChange = (key, value) => {
        setEditableData(prev => ({
            ...prev,
            [key]: value
        }));
    };

    return (
        <div className="flex flex-col h-full bg-white flex-1 min-w-[500px] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white z-10 w-full">
                <div className="flex items-center gap-3">
                    <button className="p-1.5 hover:bg-gray-100 rounded text-gray-600">
                        <Menu className="w-4 h-4" />
                    </button>
                    <span className="text-[14px] font-normal text-[#171717]">Case Validated Data</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <button className="p-1.5 hover:bg-gray-100 rounded text-gray-400"><Maximize2 className="w-4 h-4" /></button>
                    <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
                </div>
            </div>

            {/* Utility Bar */}
            <div className="flex flex-col w-full">
                <div className="px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <button className="p-2 border border-gray-300 rounded-[4px] hover:bg-gray-50 text-gray-600">
                            <Filter className="w-3.5 h-3.5" />
                        </button>
                    </div>
                    <div className="flex items-center gap-4 text-gray-400">
                        <Download className="w-4 h-4 cursor-pointer hover:text-gray-600 transition-colors" />
                        <Sliders className="w-4 h-4 cursor-pointer hover:text-gray-600 transition-colors" />
                        <ExternalLink className="w-4 h-4 cursor-pointer hover:text-gray-600 transition-colors" />
                        <div className="flex items-center border border-gray-200 rounded-[6px] p-0.5 bg-gray-50/50">
                            <button
                                onClick={() => setViewMode('list')}
                                title="Switch to List View"
                                className={`p-1 rounded-[4px] transition-all ${viewMode === 'list' ? 'bg-white border border-gray-200 shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                <Layout className="w-3.5 h-3.5" />
                            </button>
                            <button
                                onClick={() => setViewMode('table')}
                                title="Switch to Table View"
                                className={`p-1 rounded-[4px] transition-all ${viewMode === 'table' ? 'bg-white border border-gray-200 shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                <LayoutGrid className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                </div>
                <div className="h-px bg-gray-100 w-full"></div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-auto bg-white custom-scrollbar">
                {viewMode === 'table' || isTableArtifact ? (
                    <div className="w-full h-full overflow-auto">
                        <table className="min-w-full text-left border-collapse table-auto">
                            <thead className="bg-[#f9fafb] border-b border-gray-200 sticky top-0 z-20">
                                <tr>
                                    {(isTableArtifact ? Object.keys(artifact.data[0] || {}) : Object.keys(editableData)).map(header => {
                                        let displayHeader = header;
                                        if (header.toLowerCase() === 'id' || header.toLowerCase() === 'invoiceno' || header.toLowerCase() === 'caseid') displayHeader = 'Case id';
                                        else displayHeader = displayHeader.replace(/([A-Z])/g, ' $1').trim();
                                        displayHeader = displayHeader.charAt(0).toUpperCase() + displayHeader.slice(1);

                                        return (
                                            <th key={header} className="px-4 py-2 text-[11px] font-bold text-gray-900 border-r border-gray-100 min-w-[150px] bg-[#f9fafb]">
                                                <div className="flex items-center justify-between group cursor-pointer hover:text-black">
                                                    <span>{displayHeader}</span>
                                                    <ChevronDown className="w-3 h-3 text-gray-400 group-hover:text-gray-600" />
                                                </div>
                                            </th>
                                        );
                                    })}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                                {isTableArtifact ? (
                                    artifact.data.map((row, i) => (
                                        <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                                            {Object.values(row).map((val, j) => (
                                                <td key={j} className="px-4 py-2 text-[11px] text-black border-r border-gray-100 whitespace-nowrap overflow-hidden text-ellipsis">
                                                    {val?.toString() || '—'}
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                ) : (
                                    <tr className="hover:bg-gray-50/50 transition-colors">
                                        {Object.values(editableData).map((val, j) => (
                                            <td key={j} className="px-4 py-2 text-[11px] text-black border-r border-gray-100 whitespace-nowrap overflow-hidden text-ellipsis">
                                                {val || '—'}
                                            </td>
                                        ))}
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="flex flex-col">
                        {Object.entries(editableData).map(([key, value], index) => {
                            let displayKey = key;
                            if (key.toLowerCase() === 'id' || key.toLowerCase() === 'invoiceno' || key.toLowerCase() === 'caseid') displayKey = 'Case id';
                            else displayKey = displayKey.replace(/([A-Z])/g, ' $1').trim();
                            displayKey = displayKey.charAt(0).toUpperCase() + displayKey.slice(1);

                            return (
                                <div key={key} className={`group px-8 py-3 border-b border-gray-100 hover:bg-[#f9fafb] transition-colors ${index === 0 ? 'mt-4' : ''}`}>
                                    <div className="space-y-1.5 flex flex-col">
                                        <label className="block text-[11px] font-normal text-gray-400 transition-colors group-hover:text-gray-600">
                                            {displayKey}
                                        </label>
                                        <textarea
                                            value={value}
                                            onChange={(e) => handleFieldChange(key, e.target.value)}
                                            className="w-full max-w-[500px] px-3 py-1.5 bg-white border border-[#e5e7eb] rounded-[6px] shadow-[0_1px_2px_rgba(0,0,0,0.02)] text-[10px] text-[#171717] font-normal hover:border-gray-300 focus:border-black focus:outline-none transition-all resize-none overflow-hidden min-h-[32px]"
                                            rows={value.toString().includes('\n') ? value.toString().split('\n').length : (value.toString().length > 60 ? 2 : 1)}
                                            onInput={(e) => {
                                                e.target.style.height = 'auto';
                                                e.target.style.height = e.target.scrollHeight + 'px';
                                            }}
                                            ref={(el) => {
                                                if (el) {
                                                    el.style.height = 'auto';
                                                    el.style.height = el.scrollHeight + 'px';
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};


const EmailDraftViewer = ({ artifact, onClose }) => {
    const { to, from, cc, bcc, subject, body, isIncoming, isSent } = artifact.data || {};
    const isReadOnly = isIncoming || isSent;
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSend = async () => {
        setSending(true);
        try {
            // Check if we are in simulation mode (online demo)
            if (artifact.onTriggerSimulation) {
                await new Promise(r => setTimeout(r, 1000));
                artifact.onTriggerSimulation();
                setSent(true);
                setTimeout(() => onClose(), 1000);
                return;
            }

            await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/email-status`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sent: true })
            });
            // Simulate delay for "visual" confirmation
            await new Promise(r => setTimeout(r, 1000));
            setSent(true);
            setTimeout(() => {
                onClose();
            }, 1000);
        } catch (e) {
            console.error("Failed to send signal", e);
            setSending(false);
        }
    };

    if (sent) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-gray-50">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <Check className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Email Sent Successfully</h3>
                <p className="text-gray-500">The workflow will now conclude.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-white flex-1 min-w-[500px]">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white">
                <div className="flex items-center gap-3">
                    <button className="p-1 hover:bg-gray-100 rounded"><div className="w-4 h-0.5 bg-gray-600 my-0.5"></div><div className="w-4 h-0.5 bg-gray-600 my-0.5"></div><div className="w-4 h-0.5 bg-gray-600 my-0.5"></div></button>
                    <span className="font-medium text-gray-900">{isSent ? "Email Sent" : isIncoming ? "Email Received" : "Review Draft"}</span>
                </div>
                <div className="flex items-center gap-2">
                    <button className="p-1.5 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600"><Maximize2 className="w-4 h-4" /></button>
                    <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
                </div>
            </div>

            {/* Email Form */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {isIncoming ? (
                    <>
                        <div className="flex items-center gap-4">
                            <label className="w-12 text-sm text-gray-500 font-medium">From</label>
                            <span className="text-sm text-gray-900">{from}</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <label className="w-12 text-sm text-gray-500 font-medium">To</label>
                            <span className="text-sm text-gray-900">{to}</span>
                        </div>
                    </>
                ) : (
                    <div className="flex items-start gap-4">
                        <label className="w-12 text-sm text-gray-500 pt-1.5 font-medium">To</label>
                        <div className="flex-1 flex flex-wrap gap-2">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700 border border-gray-200">
                                {to}
                                <X className="w-3 h-3 text-gray-400 cursor-pointer" />
                            </span>
                        </div>
                    </div>
                )}

                <div className="flex items-center gap-4">
                    <label className="w-12 text-sm text-gray-500 font-medium">Cc</label>
                    <input type="text" readOnly={isReadOnly} className="flex-1 text-sm outline-none text-gray-700 placeholder-gray-400" value={cc || ''} />
                </div>
                {!isIncoming && (
                    <div className="flex items-center gap-4">
                        <label className="w-12 text-sm text-gray-500 font-medium">Bcc</label>
                        <input type="text" className="flex-1 text-sm outline-none text-gray-700 placeholder-gray-400" value={bcc || ''} />
                    </div>
                )}

                <div className="border-t border-gray-100 my-2"></div>

                {/* Subject */}
                <div className="flex items-center gap-4">
                    <label className="w-12 text-sm text-gray-500 font-medium">Subject</label>
                    <input type="text" readOnly value={subject} className="flex-1 text-sm font-medium text-gray-900 outline-none" />
                </div>

                <div className="border-t border-gray-100 my-2"></div>

                {/* Body */}
                <div
                    className="flex-1 min-h-[400px] text-sm text-gray-800 leading-relaxed font-sans"
                    dangerouslySetInnerHTML={{ __html: (body || '').replace(/\n/g, '<br/>') }}
                />
            </div>

            {/* Footer / Toolbar */}
            {!isReadOnly && (
                <div className="px-4 py-3 border-t border-gray-100 bg-white shadow-[0_-4px_6px_-1px_rgb(0,0,0,0.05)]">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-1 border border-gray-200 rounded p-1 bg-white shadow-sm">
                            <button className="p-1.5 hover:bg-gray-100 rounded text-gray-600"><ArrowLeft className="w-4 h-4" /></button>
                            <button className="p-1.5 hover:bg-gray-100 rounded text-gray-600"><ArrowLeft className="w-4 h-4 rotate-180" /></button>
                            <div className="w-px h-4 bg-gray-200 mx-1"></div>
                            <button className="p-1.5 hover:bg-gray-100 rounded text-gray-600"><span className="font-serif font-bold text-lg leading-none">T</span></button>
                            <button className="p-1.5 hover:bg-gray-100 rounded text-gray-600"><ChevronDown className="w-3 h-3" /></button>
                            <div className="w-px h-4 bg-gray-200 mx-1"></div>
                            <button className="p-1.5 hover:bg-gray-100 rounded text-gray-600"><Bold className="w-4 h-4" /></button>
                            <button className="p-1.5 hover:bg-gray-100 rounded text-gray-600"><Italic className="w-4 h-4" /></button>
                            <button className="p-1.5 hover:bg-gray-100 rounded text-gray-600"><Underline className="w-4 h-4" /></button>
                            <button className="p-1.5 hover:bg-gray-100 rounded text-gray-600"><span className="font-bold underline text-sm">A</span></button>
                            <button className="p-1.5 hover:bg-gray-100 rounded text-gray-600"><ChevronDown className="w-3 h-3" /></button>
                            <div className="w-px h-4 bg-gray-200 mx-1"></div>
                            <button className="p-1.5 hover:bg-gray-100 rounded text-gray-600"><AlignLeft className="w-4 h-4" /></button>
                            <button className="p-1.5 hover:bg-gray-100 rounded text-gray-600"><ChevronDown className="w-3 h-3" /></button>
                            <div className="w-px h-4 bg-gray-200 mx-1"></div>
                            <button className="p-1.5 hover:bg-gray-100 rounded text-gray-600"><List className="w-4 h-4" /></button>
                            <div className="w-px h-4 bg-gray-200 mx-1"></div>
                            <button className="p-1.5 hover:bg-gray-100 rounded text-gray-600"><Link className="w-4 h-4" /></button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <button
                            onClick={handleSend}
                            disabled={sending}
                            className="px-6 py-2 bg-gray-900 text-white text-sm font-medium rounded hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send"}
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded text-gray-400 hover:text-red-500 transition-colors">
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
const DecisionViewer = ({ artifact, onClose }) => {
    const { question, options } = artifact.data || {};
    const [selectedOption, setSelectedOption] = useState(null);
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);

    const handleConfirm = async () => {
        if (!selectedOption) return;
        setSending(true);
        try {
            const endpoint = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/signal`;
            await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ signal: selectedOption.signal || selectedOption.id })
            });
            setSent(true);
            setTimeout(() => onClose(), 1000);
        } catch (e) {
            console.error("Failed to send decision", e);
            setSending(false);
        }
    };

    if (sent) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-gray-50 flex-1 min-w-[300px]">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <Check className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Decision Logged</h3>
                <p className="text-gray-500">The workflow will now resume.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-white flex-1 min-w-[300px]">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white">
                <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-gray-500" />
                    <span className="font-medium text-gray-900">Manual Review</span>
                </div>
                <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded text-gray-500"><X className="w-5 h-5" /></button>
            </div>

            <div className="flex-1 p-6 overflow-y-auto">
                <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-900 mb-4">{question}</h3>
                    <div className="space-y-3">
                        {options && options.map((option) => (
                            <label
                                key={option.value}
                                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${selectedOption?.value === option.value
                                    ? 'border-gray-900 bg-gray-50 shadow-sm'
                                    : 'border-gray-200 hover:border-gray-300 bg-white'
                                    }`}
                            >
                                <div className="pt-0.5">
                                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${selectedOption?.value === option.value ? 'border-gray-900' : 'border-gray-300'
                                        }`}>
                                        {selectedOption?.value === option.value && (
                                            <div className="w-2 h-2 rounded-full bg-gray-900" />
                                        )}
                                    </div>
                                </div>
                                <input
                                    type="radio"
                                    name="decision"
                                    className="hidden"
                                    checked={selectedOption?.value === option.value}
                                    onChange={() => setSelectedOption(option)}
                                />
                                <span className={`text-sm ${selectedOption?.value === option.value ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
                                    {option.label}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50">
                <button
                    onClick={handleConfirm}
                    disabled={!selectedOption || sending}
                    className="w-full py-2.5 bg-gray-900 text-white text-sm font-medium rounded hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm Decision"}
                </button>
            </div>
        </div>
    );
};


const CollapsibleReasoning = ({ reasons }) => {
    const [isOpen, setIsOpen] = useState(false);

    if (!reasons || reasons.length === 0) return null;

    return (
        <div className="mt-1 mb-2 max-w-md animate-fade-in">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 w-full px-2 py-1 text-xs text-gray-400 hover:text-gray-700 transition-colors rounded hover:bg-gray-50"
            >
                <div className="flex items-center gap-1 font-medium">
                    <span>See reasoning</span>
                    {isOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                </div>
            </button>
            {isOpen && (
                <div className="pl-4 py-1">
                    <div className="space-y-1">
                        {reasons.map((r, i) => {
                            let content = r;
                            let marker = <span className="text-gray-300 select-none">•</span>;

                            if (r.startsWith('(G)') || r.includes('✓')) {
                                marker = <span className="text-green-500 select-none text-base leading-none">●</span>;
                                content = r.replace('(G)', '').replace('✓', '').trim();
                            } else if (r.startsWith('(R)') || r.includes('❌') || r.includes('⚠️')) {
                                marker = <span className="text-red-500 select-none text-base leading-none">●</span>;
                                content = r.replace('(R)', '').replace('❌', '').replace('⚠️', '').trim();
                            }

                            return (
                                <div key={i} className="flex gap-2 text-xs text-gray-500 leading-tight items-start">
                                    <div className="flex-shrink-0 mt-0.5">{marker}</div>
                                    <span className="pt-0.5">{content}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

const ReviewActions = ({ processId, messages, refresh, rejectionReasons = [], onArtifactClick }) => {
    const [showChat, setShowChat] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [msgText, setMsgText] = useState("");
    const [sending, setSending] = useState(false);
    const [rejectionEmail, setRejectionEmail] = useState("");
    const textareaRef = useRef(null);

    // Auto-adjust textarea height
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [msgText]);

    // Auto-generate rejection email when modal opens
    const openRejectModal = () => {
        // Check if there are specific issues detected
        const hasDetectedIssues = rejectionReasons && rejectionReasons.length > 0;

        const reasonsList = hasDetectedIssues
            ? rejectionReasons.map(r => `• ${r}`).join('\n')
            : '• [Please specify reason for rejection]';

        const defaultEmail = `Dear Applicant,

Thank you for your interest in the Bird Infrastructure Procure to Pay program.

After careful review of your application and supporting documents, we regret to inform you that we are unable to proceed with your account opening request at this time.

Reason for Rejection:
${reasonsList}

If you believe this decision was made in error or if you have additional documentation to provide, please do not hesitate to contact us.

We appreciate your understanding.

Best regards,
Bird Infrastructure Procurement Team`;
        setRejectionEmail(defaultEmail);
        setShowRejectModal(true);
    };

    const handleSendMessage = async () => {
        if (!msgText.trim()) return;
        setSending(true);
        try {
            await fetch('http://localhost:8000/zamp/message', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    processId: processId,
                    sender: "procurement@bird.com",
                    content: msgText
                })
            });
            setMsgText("");
        } catch (e) {
            console.error(e);
        }
        setSending(false);
    };

    const handleApprove = async () => {
        if (!window.confirm("Approve this application?")) return;
        try {
            await fetch(`http://localhost:8000/zamp/approve/${processId}`, { method: 'POST' });
        } catch (e) {
            console.error(e);
        }
    };

    const handleReject = async () => {
        if (!window.confirm("Reject this application and send the email?")) return;
        try {
            await fetch(`http://localhost:8000/zamp/reject/${processId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: rejectionEmail,
                    reason: "Application rejected after manual review"
                })
            });
            setShowRejectModal(false);
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div>
            {/* Messages Area - Compact */}
            {messages.length > 0 && (
                <div className="mb-3 bg-gray-50 rounded p-3 space-y-2 max-h-48 overflow-y-auto">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex flex-col ${msg.sender === "procurement@bird.com" ? "items-end" : "items-start"}`}>
                            <div className="text-[10px] text-gray-400 mb-0.5">{msg.sender === "procurement@bird.com" ? "You" : "Applicant"} • {msg.time}</div>
                            <div className={`px-2 py-1.5 rounded text-xs max-w-[85%] ${msg.sender === "procurement@bird.com" ? "bg-black text-white rounded-br-none" : "bg-white border border-gray-200 text-gray-800 rounded-bl-none"
                                }`}>
                                {msg.content}
                            </div>
                            {msg.attachment && onArtifactClick && (
                                <button
                                    onClick={() => onArtifactClick(msg.attachment)}
                                    className="mt-1.5 inline-flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all"
                                >
                                    <Database className="h-3.5 w-3.5 text-gray-400" />
                                    <span>{msg.attachment.label}</span>
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {!showChat && !showRejectModal ? (
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setShowChat(true)}
                        className="px-4 py-1.5 bg-white border border-gray-200 rounded text-xs font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all"
                    >
                        Ask questions
                    </button>
                    <button
                        onClick={openRejectModal}
                        className="px-4 py-1.5 bg-white border border-gray-200 rounded text-xs font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all"
                    >
                        Reject
                    </button>
                    <button
                        onClick={handleApprove}
                        className="px-4 py-1.5 bg-black text-white rounded text-xs font-medium hover:bg-gray-800 transition-all"
                    >
                        Approve
                    </button>
                </div>
            ) : showRejectModal ? (
                <div className="animate-fade-in">
                    <div className="mb-2 flex items-center gap-2">
                        <Database className="h-4 w-4 text-gray-500" />
                        <span className="text-xs font-medium text-gray-700">Rejection Email Draft</span>
                    </div>
                    <textarea
                        value={rejectionEmail}
                        onChange={(e) => setRejectionEmail(e.target.value)}
                        className="w-full h-48 px-3 py-2 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-black resize-none"
                    />
                    <div className="flex gap-2 mt-3">
                        <button
                            onClick={handleReject}
                            className="px-4 py-1.5 bg-red-600 text-white rounded text-xs font-medium hover:bg-red-700 transition-all"
                        >
                            Send Rejection
                        </button>
                        <button
                            onClick={() => setShowRejectModal(false)}
                            className="px-4 py-1.5 bg-white border border-gray-200 rounded text-xs font-medium text-gray-700 hover:bg-gray-50 transition-all"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex gap-2 items-start animate-fade-in bg-white border border-gray-300 rounded p-1.5 focus-within:ring-1 focus-within:ring-black">
                    <textarea
                        ref={textareaRef}
                        value={msgText}
                        onChange={(e) => setMsgText(e.target.value)}
                        placeholder="Type question..."
                        className="flex-1 px-1 py-1 text-xs focus:outline-none resize-none min-h-[24px] max-h-32 overflow-y-auto"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage();
                            }
                        }}
                        rows={1}
                    />
                    <div className="flex flex-col justify-end self-stretch pb-0.5">
                        <button
                            onClick={handleSendMessage}
                            disabled={sending}
                            className="p-1.5 bg-black text-white rounded hover:bg-gray-800 disabled:opacity-50"
                        >
                            {sending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
                        </button>
                    </div>
                    <div className="flex items-end self-stretch pb-1">
                        <button
                            onClick={() => setShowChat(false)}
                            className="text-[10px] text-gray-500 hover:text-gray-700 underline px-1"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

const ProcessDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [processMetadata, setProcessMetadata] = useState(() => {
        // Hydrate from sessionStorage if available
        const saved = sessionStorage.getItem(`case_status_${id}`);
        return saved ? { status: saved } : null;
    });
    const [allProcesses, setAllProcesses] = useState([]);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [liveStatus, setLiveStatus] = useState(null);
    const [selectedArtifact, setSelectedArtifact] = useState(null);
    const [selectedOptions, setSelectedOptions] = useState({});
    const [confirmedDecisions, setConfirmedDecisions] = useState(new Set());
    const [artifactWidth, setArtifactWidth] = useState(800);
    const [isResizing, setIsResizing] = useState(false);

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!isResizing) return;
            const newWidth = window.innerWidth - e.clientX;
            // Constrain width between 400px and 80% of window
            if (newWidth > 400 && newWidth < window.innerWidth * 0.8) {
                setArtifactWidth(newWidth);
            }
        };

        const handleMouseUp = () => {
            setIsResizing(false);
            document.body.style.cursor = 'default';
        };

        if (isResizing) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = 'col-resize';
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isResizing]);

    // Simulation State
    const [simulatedLogs, setSimulatedLogs] = useState([]);
    const [isSimulating, setIsSimulating] = useState(false);
    const [fullLogs, setFullLogs] = useState([]);
    const [displayLogs, setDisplayLogs] = useState([]);
    useEffect(() => {
        const fetchData = async () => {
            if (isSimulating) return;

            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/data/process_${id}.json`);
                if (!response.ok) {
                    throw new Error('Process data not found');
                }
                const jsonData = await response.json();

                const incomingLogs = jsonData.logs || [];
                setFullLogs(incomingLogs);
                setData(jsonData);

                const isDemoCase = ['DIR_001', 'DIR_002', 'DIR_003'].includes(id);
                const localStatus = id.startsWith('DIR_') ? null : sessionStorage.getItem(`case_status_${id}`);
                const isActive = sessionStorage.getItem(`case_active_${id}`) === 'true';
                const effectiveStatus = localStatus || processMetadata?.status || jsonData.keyDetails?.status;

                // Also check if we've already shown all logs
                const hasShownAllLogs = displayLogs.length >= incomingLogs.length;

                if (isDemoCase && effectiveStatus === 'Needs Attention' && !isSimulating && !isActive && !hasShownAllLogs) {
                    const decisionIndex = incomingLogs.findIndex(l =>
                        l.artifacts && l.artifacts.some(a =>
                            (a.type === 'email_draft' && !a.data?.isIncoming && !a.data?.isSent) ||
                            a.type === 'decision'
                        )
                    );
                    if (decisionIndex !== -1) {
                        setDisplayLogs(incomingLogs.slice(0, decisionIndex + 1));
                    } else {
                        setDisplayLogs(incomingLogs);
                    }
                } else {
                    setDisplayLogs(incomingLogs);
                }

                setLiveStatus(null);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching process data:", err);
                setError(err.message);
                setLoading(false);
            }
        };

        fetchData();

        const localStatus = id.startsWith('DIR_') ? null : sessionStorage.getItem(`case_status_${id}`);

        // Stop polling if status is Done OR if we're simulating
        if (!isSimulating && localStatus !== 'Done') {
            const interval = setInterval(fetchData, 2000);
            return () => clearInterval(interval);
        }
    }, [id, isSimulating, processMetadata, displayLogs.length]);
    const startSimulation = () => {
        if (isSimulating) return;
        setIsSimulating(true);
        sessionStorage.setItem(`case_active_${id}`, 'true');

        const currentIndex = displayLogs.length;
        const remainingLogs = fullLogs.slice(currentIndex);

        const isInfiniteCase = ['DIR_001', 'DIR_002', 'DIR_003'].includes(id);
        let logIndex = 0;

        const interval = setInterval(() => {
            // Check if we've run out of logs FIRST
            if (logIndex >= remainingLogs.length) {
                clearInterval(interval);
                setIsSimulating(false);
                if (!isInfiniteCase) {
                    sessionStorage.setItem(`case_status_${id}`, 'Done');
                    setProcessMetadata(prev => ({ ...prev, status: 'Done' }));
                }
                return;
            }

            // INFINITE FLOW LOGIC: If this is a demo case, the VERY LAST log gets a 2 hour delay
            if (isInfiniteCase && logIndex === remainingLogs.length - 1) {
                clearInterval(interval);
                setTimeout(() => {
                    setDisplayLogs(prev => [...prev, remainingLogs[logIndex]]);
                    setIsSimulating(false);
                    sessionStorage.setItem(`case_status_${id}`, 'Done');
                    setProcessMetadata(prev => ({ ...prev, status: 'Done' }));
                }, 7200000);
                return;
            }

            setDisplayLogs(prev => [...prev, remainingLogs[logIndex]]);
            logIndex++;
        }, 3000);
    };
    useEffect(() => {
        const fetchAllProcesses = async () => {
            const localSavedStatus = sessionStorage.getItem(`case_status_${id}`);
            if (isSimulating || localSavedStatus === 'Done') return; // SKIP updates during simulation or if "Done"
            try {
                const response = await fetch('/data/processes.json');
                if (response.ok) {
                    const processes = await response.json();
                    setAllProcesses(processes);
                    const current = processes.find(p => String(p.id) === String(id));
                    if (current) {
                        setProcessMetadata(current);
                    }
                }
            } catch (err) {
                console.error("Error fetching process list:", err);
            }
        };

        fetchAllProcesses();
        const currentLocalStatus = sessionStorage.getItem(`case_status_${id}`);
        if (!isSimulating && currentLocalStatus !== 'Done') {
            const processListInterval = setInterval(fetchAllProcesses, 1000);
            return () => clearInterval(processListInterval);
        }
    }, [id, isSimulating]);

    const currentIndex = allProcesses.findIndex(p => String(p.id) === String(id));
    const canGoUp = currentIndex > 0;
    const canGoDown = currentIndex < allProcesses.length - 1;

    const handleNavigateUp = () => {
        if (canGoUp) navigate(`/done/process/${allProcesses[currentIndex - 1].id}`);
    };

    const handleNavigateDown = () => {
        if (canGoDown) navigate(`/done/process/${allProcesses[currentIndex + 1].id}`);
    };

    const getIconComponent = (iconType) => {
        switch (iconType) {
            case 'file': return FileText;
            case 'video': return ExternalLink;
            case 'dashboard': return FileText;
            case 'image': return ImageIcon;
            case 'table': return FileText;
            case 'data': return FileText;
            case 'email_draft': return (props) => (
                <img
                    src="/gmail.svg"
                    alt="Gmail"
                    className={props.className}
                    style={{ width: '14px', height: '14px', ...props.style }}
                />
            );
            case 'link': return ExternalLink;
            default: return Database;
        }
    };

    const findAssociatedData = (artifact, allLogs) => {
        if (artifact.data) return artifact.data;
        for (const log of allLogs) {
            if (!log.artifacts) continue;
            const hasArtifact = log.artifacts.some(a => a.id === artifact.id);
            if (hasArtifact) {
                const dataArtifact = log.artifacts.find(a =>
                    a.type === 'table' && a.data && a.id !== artifact.id
                );
                if (dataArtifact) return dataArtifact.data;
            }
        }
        return null;
    };

    const handleArtifactClick = (artifact) => {
        const allLogs = data?.sections?.activityLogs?.items || data?.logs || [];
        const associatedData = findAssociatedData(artifact, allLogs);

        const processedArt = {
            ...artifact,
            extractedData: associatedData
        };

        // REMOVED: Simulation trigger for DIR_001 email draft should be handled by backend


        setSelectedArtifact(processedArt);
    };

    const closeArtifactPanel = () => {
        setSelectedArtifact(null);
    };

    if (loading && !data) return <div className="flex justify-center items-center h-screen"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>;
    if (error) return <div className="flex justify-center items-center h-screen text-red-500">Error: {error}</div>;
    if (!data) return null;

    const { sections } = data;
    const keyDetails = data.keyDetails || {};
    // Aggregate ALL artifacts from logs for the sidebar
    const logs = displayLogs || [];
    const allArtifacts = (logs || []).reduce((acc, log) => {
        if (log.artifacts && Array.isArray(log.artifacts)) {
            log.artifacts.forEach(art => {
                if (!acc.some(exist => exist.id === art.id)) {
                    // REMOVED: Simulation trigger for DIR_001 should be handled by backend
                    const processedArt = { ...art };
                    acc.push(processedArt);
                }
            });
        }
        return acc;
    }, []);

    // Also include any sidebarArtifacts that might be manually set (fallback)
    const manualArtifacts = sections?.sidebarArtifacts?.items || data.sidebarArtifacts || [];
    manualArtifacts.forEach(art => {
        if (!allArtifacts.some(exist => exist.id === art.id)) {
            allArtifacts.push(art);
        }
    });

    const processStatus = (id.startsWith('DIR_') ? null : sessionStorage.getItem(`case_status_${id}`)) || (processMetadata ? processMetadata.status : (keyDetails.status || "In Progress"));

    // Sidebar Data Populators
    const isDIR = processMetadata?.category === 'Data Integrity Review' || id.startsWith('DIR');

    // Determine the ID prefix based on category
    let idPrefix = 'DIR-';
    if (isDIR) idPrefix = 'DIR-';

    return (
        <div className="flex h-screen bg-white">
            {/* Left Pane - Main Content (shrinks when artifact is selected) */}
            <div
                className={`flex flex-col overflow-hidden border-r border-[#f0f0f0]`}
                style={{ width: selectedArtifact ? `calc(100% - ${artifactWidth}px)` : '100%' }}
            >
                {/* Process ID Header */}
                <div className="flex items-center justify-between px-6 py-3 border-b border-[#f0f0f0]">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">Case #</span>
                            <span className="font-semibold text-xs">{id}</span>
                        </div>
                        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs border border-[#f0f0f0] bg-white`}>
                            {['Complete', 'success', 'Done'].includes(processStatus) ? (
                                <Check className="h-3 w-3 text-[#0b821a]" strokeWidth={2.5} />
                            ) : ['Needs Review', 'Under Review', 'Needs Attention'].includes(processStatus) ? (
                                <Activity className="h-3 w-3 text-[#ff1515]" strokeWidth={2} />
                            ) : (
                                <Loader2 className="h-3 w-3 text-[#2445ff] animate-spin" />
                            )}
                            <span className="font-medium text-black">{processStatus === 'processing' ? 'In Progress' : processStatus}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-[#8f8f8f] mr-2">{currentIndex + 1} / {allProcesses.length}</span>
                        <button
                            onClick={handleNavigateDown}
                            disabled={!canGoDown}
                            className={`flex items-center justify-center h-8 w-8 rounded-[10px] bg-white border border-[#f0f0f0] transition-colors ${!canGoDown ? 'opacity-30 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                        >
                            <ArrowDown className="h-4 w-4 text-black" strokeWidth={1.5} />
                        </button>
                        <button
                            onClick={handleNavigateUp}
                            disabled={!canGoUp}
                            className={`flex items-center justify-center h-8 w-8 rounded-[10px] bg-white border border-[#f0f0f0] transition-colors ${!canGoUp ? 'opacity-30 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                        >
                            <ArrowUp className="h-4 w-4 text-black" strokeWidth={1.5} />
                        </button>
                    </div>
                </div>

                {/* Activity Timeline */}
                <div className="flex-1 overflow-y-auto">
                    {/* Today Divider */}
                    <div className="flex items-center py-6 px-8">
                        <div className="flex-grow border-t border-gray-200"></div>
                        <span className="flex-shrink mx-4 text-xs text-gray-500 font-medium">Today</span>
                        <div className="flex-grow border-t border-gray-200"></div>
                    </div>

                    <div className="px-8 pb-8">
                        <div className="max-w-3xl">
                            {logs && logs.map((log, index) => {
                                const isLastItem = index === logs.length - 1;
                                const isComplete = log.status === 'success' || log.status === 'completed';
                                const isError = log.status === 'error' || log.status === 'failed';
                                const isWarning = log.status === 'warning';

                                return (
                                    <div key={log.id} className="relative flex gap-4">
                                        {/* Time */}
                                        <div className="w-20 flex-shrink-0 text-right pt-[8.5px]">
                                            <span className="text-[11px] text-[#9CA3AF] font-medium tabular-nums leading-[13px] block">{log.time}</span>
                                        </div>

                                        {/* Timeline Icon */}
                                        <div className="relative flex flex-col items-center w-5 self-stretch">
                                            {/* Continuous vertical line spine */}
                                            {(!isLastItem || index > 0) && (
                                                <div
                                                    className={`absolute w-[1px] bg-[#E5E7EB] left-1/2 -translate-x-1/2 
                                                        ${index === 0 ? 'top-[15px]' : 'top-0'} 
                                                        ${isLastItem ? 'h-[15px]' : 'bottom-0'}`}
                                                ></div>
                                            )}
                                            <div className="relative z-10 bg-white py-[9.5px]">
                                                <div
                                                    className={`w-[11px] h-[11px] border transition-all duration-300 ${isError || isWarning ? "bg-[#FFDADA] border-[#A40000] rounded-[2px]" :
                                                        isComplete ? "bg-[#E6F3EA] border-[#66B280] rounded-[2px]" :
                                                            "bg-[#DADAFF] border-[#0000A4] animate-square-to-diamond"
                                                        }`}
                                                />
                                            </div>
                                        </div>

                                        {/* Content - internal padding ensures line container stretches */}
                                        <div className="flex-1 min-w-0 pt-[8.5px] pb-10">
                                            <h3 className="text-[13px] font-medium text-gray-900 mb-2 leading-[13px]">{log.title}</h3>

                                            {/* Reasoning Section */}
                                            <CollapsibleReasoning reasons={log.reasoning} />

                                            {/* Artifacts - Inline */}
                                            {log.artifacts && log.artifacts.length > 0 && (
                                                <div className="flex flex-col gap-3">
                                                    <div className="flex flex-wrap gap-2">
                                                        {(log.artifacts || []).filter(a => a.type !== 'decision').map((artifact) => {
                                                            const IconComponent = getIconComponent(artifact.type);
                                                            const isPendingEmail = artifact.type === 'email_draft' && processStatus === 'Needs Attention';
                                                            return (
                                                                <button
                                                                    key={artifact.id}
                                                                    onClick={() => handleArtifactClick(artifact)}
                                                                    className={`inline-flex items-center gap-2 px-2 py-1 rounded-[6px] transition-all text-left border-none ${isPendingEmail
                                                                        ? 'bg-[#1a1a1a] hover:bg-black'
                                                                        : 'bg-[#f2f2f2] hover:bg-gray-200'
                                                                        }`}
                                                                >
                                                                    <IconComponent
                                                                        className={`h-3.5 w-3.5 flex-shrink-0 ${isPendingEmail ? 'text-white' : 'text-black'}`}
                                                                        strokeWidth={1.5}
                                                                        style={isPendingEmail && artifact.type !== 'email_draft' ? { filter: 'invert(1) brightness(2)' } : {}}
                                                                    />
                                                                    <span className={`text-xs font-normal ${isPendingEmail ? 'text-white' : 'text-black'}`}>
                                                                        {artifact.label}
                                                                    </span>
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                    {(log.artifacts || []).filter(a => a.type === 'decision').map((decision) => (
                                                        <div key={decision.id} className="space-y-4 max-w-sm py-2">
                                                            <div className="space-y-3">
                                                                {(decision.options || decision.data?.options)?.map((option, idx) => (
                                                                    <label key={idx} className="flex items-center gap-3 group cursor-pointer p-0.5 rounded-md transition-colors">
                                                                        <div className="relative flex items-center justify-center">
                                                                            <input
                                                                                type="radio"
                                                                                name={`decision-${decision.id}`}
                                                                                checked={selectedOptions[decision.id]?.label === option.label}
                                                                                disabled={confirmedDecisions.has(decision.id)}
                                                                                className="peer appearance-none w-4 h-4 border-2 border-gray-300 rounded-full checked:border-black transition-all"
                                                                                onChange={() => {
                                                                                    if (!confirmedDecisions.has(decision.id)) {
                                                                                        setSelectedOptions(prev => ({
                                                                                            ...prev,
                                                                                            [decision.id]: option
                                                                                        }));
                                                                                    }
                                                                                }}
                                                                            />
                                                                            <div className="absolute w-2 h-2 bg-black rounded-full scale-0 peer-checked:scale-100 transition-transform"></div>
                                                                        </div>
                                                                        <span className={`text-xs font-medium transition-colors ${confirmedDecisions.has(decision.id) && selectedOptions[decision.id]?.label !== option.label ? 'text-gray-400' : 'text-gray-600 group-hover:text-gray-900'}`}>{option.label}</span>
                                                                    </label>
                                                                ))}
                                                            </div>
                                                            {!confirmedDecisions.has(decision.id) && (
                                                                <div className="flex justify-start pt-1">
                                                                    <button
                                                                        className="px-6 py-2 bg-black text-white text-xs font-bold rounded hover:bg-black/90 transition-all shadow-md active:scale-95 disabled:opacity-50"
                                                                        disabled={!selectedOptions[decision.id]}
                                                                        onClick={async (e) => {
                                                                            const option = selectedOptions[decision.id];
                                                                            if (!option) return;

                                                                            const btn = e.currentTarget;
                                                                            const originalText = btn.innerText;
                                                                            btn.innerText = 'Confirming...';
                                                                            btn.disabled = true;

                                                                            try {
                                                                                await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/signal`, {
                                                                                    method: 'POST',
                                                                                    headers: { 'Content-Type': 'application/json' },
                                                                                    body: JSON.stringify({ signal: option.signal || option.action || option.id })
                                                                                });

                                                                                setConfirmedDecisions(prev => {
                                                                                    const next = new Set(prev);
                                                                                    next.add(decision.id);
                                                                                    return next;
                                                                                });
                                                                            } catch (err) {
                                                                                console.error("Signal failed", err);
                                                                                btn.innerText = originalText;
                                                                                btn.disabled = false;
                                                                            }
                                                                        }}
                                                                    >
                                                                        Confirm
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side Pane - Dynamic Artifact Viewer */}
            {selectedArtifact && (
                <div className="flex flex-1 h-full overflow-hidden relative">
                    {/* Resize Handle */}
                    <div
                        className="absolute left-0 top-0 w-1 h-full cursor-col-resize z-50 group hover:bg-black/5 transition-colors"
                        onMouseDown={(e) => {
                            e.preventDefault();
                            setIsResizing(true);
                        }}
                    >
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[4px] h-12 bg-gray-200 rounded-full group-hover:bg-gray-400 group-active:bg-gray-600 transition-colors border border-white shadow-sm"></div>
                    </div>

                    <div
                        className={`h-full border-l border-[#f0f0f0] bg-white flex flex-1 overflow-hidden`}
                        style={{ width: `${artifactWidth}px` }}
                    >
                        {/* Specialized Viewers */}
                        {selectedArtifact.type === 'video' && (
                            <VideoViewer artifact={selectedArtifact} onClose={closeArtifactPanel} />
                        )}

                        {selectedArtifact.type === 'file' && (
                            <DocumentViewer artifact={selectedArtifact} onClose={closeArtifactPanel} />
                        )}

                        {selectedArtifact.type === 'email_draft' && (
                            <EmailDraftViewer artifact={selectedArtifact} onClose={closeArtifactPanel} />
                        )}

                        {selectedArtifact.type === 'decision' && (
                            <DecisionViewer artifact={selectedArtifact} onClose={closeArtifactPanel} />
                        )}

                        {(selectedArtifact.type === 'json' || selectedArtifact.type === 'table') && (
                            <DatasetViewer artifact={selectedArtifact} onClose={closeArtifactPanel} />
                        )}

                        {/* Fallback for other types like plain images */}
                        {selectedArtifact.type === 'image' && !selectedArtifact.pdfPath && !selectedArtifact.videoPath && (
                            <div className="flex flex-col h-full flex-1 bg-white">
                                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                                    <h3 className="text-sm font-medium text-gray-900">{selectedArtifact.label}</h3>
                                    <button onClick={closeArtifactPanel} className="p-1.5 hover:bg-gray-100 rounded text-gray-500">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="flex-1 overflow-auto p-8 flex items-center justify-center bg-gray-50">
                                    <img
                                        src={`${import.meta.env.VITE_API_URL || ''}${selectedArtifact.imagePath}`}
                                        className="max-w-full max-h-full rounded shadow-lg border border-gray-200"
                                        alt={selectedArtifact.label}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Right Sidebar - Key Details (hidden when artifact selected) */}
            {!selectedArtifact && (
                <aside className="w-[400px] border-l border-[#f0f0f0] bg-white overflow-y-auto flex flex-col">
                    <div className="p-5">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-[13px] font-[550] text-[#171717] flex items-center gap-2">
                                <Asterisk className="h-4 w-4 text-[#171717]" />
                                Key Details
                            </h2>
                            <button className="p-1 hover:bg-gray-100 rounded">
                                <Maximize2 className="h-3.5 w-3.5 text-[#8f8f8f]" />
                            </button>
                        </div>

                        {/* Case Details Section (Dynamic) */}
                        <div className="mb-5">
                            <div className="flex items-center gap-1.5 mb-3">
                                <Database className="h-3 w-3 text-[#171717]" />
                                <h3 className="text-[13px] font-[550] text-[#171717]">Case Details</h3>
                            </div>
                            <div className="space-y-2.5 text-xs text-center">
                                <div className="flex justify-center">
                                    <span className="text-gray-500 w-[120px] text-left pr-4">Case #</span>
                                    <span className="text-gray-900 font-medium w-[120px] text-left">{id}</span>
                                </div>

                                {Object.entries(keyDetails).map(([key, value]) => {
                                    if (key === 'status') return null;
                                    const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).trim();
                                    return (
                                        <div key={key} className="flex justify-center">
                                            <span className="text-gray-500 w-[120px] text-left pr-4">{formattedKey}</span>
                                            <span className="text-gray-900 font-medium w-[120px] text-left truncate">{value || "—"}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="border-t border-[#f0f0f0] -mx-5 my-5"></div>

                        {/* Artifacts Section (Aggregated) */}
                        <div>
                            <h3 className="text-[13px] font-[550] text-[#171717] mb-3 flex items-center gap-2">
                                <Presentation className="h-4 w-4 text-[#171717]" />
                                Artifacts
                            </h3>
                            <div className="flex flex-col gap-2 items-start">
                                {allArtifacts.length === 0 && <span className="text-xs text-gray-400 italic">No artifacts generated yet.</span>}
                                {allArtifacts.map((artifact) => {
                                    const IconComponent = getIconComponent(artifact.type);
                                    const isPendingEmail = artifact.type === 'email_draft' && processStatus === 'Needs Attention';
                                    return (
                                        <button
                                            key={artifact.id}
                                            onClick={() => handleArtifactClick(artifact)}
                                            className={`inline-flex items-center gap-2 px-2 py-1 rounded-[6px] transition-all text-left border-none ${isPendingEmail
                                                ? 'bg-[#1a1a1a] hover:bg-black'
                                                : 'bg-[#f2f2f2] hover:bg-gray-200'
                                                }`}
                                        >
                                            <IconComponent
                                                className={`h-3.5 w-3.5 flex-shrink-0 ${isPendingEmail ? 'text-white' : 'text-black'}`}
                                                strokeWidth={1.5}
                                                style={isPendingEmail && artifact.type !== 'email_draft' ? { filter: 'invert(1) brightness(2)' } : {}}
                                            />
                                            <span className={`text-xs font-normal ${isPendingEmail ? 'text-white' : 'text-black'}`}>
                                                {artifact.label}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </aside>
            )}
        </div>
    );
};

export default ProcessDetails;