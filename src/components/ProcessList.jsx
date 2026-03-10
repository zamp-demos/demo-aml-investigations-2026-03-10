import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Filter, Check, Loader2, Search, SlidersHorizontal, Activity } from 'lucide-react';

const ProcessList = ({ category = 'Data Integrity Review' }) => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('Needs Attention');
    const [processes, setProcesses] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/data/processes.json`);
                if (response.ok) {
                    const data = await response.json();
                    const filtered = data
                        .filter(p => !p.category || p.category === category)
                        .map(p => {
                            if (p.id.startsWith('DIR_')) return p;
                            const savedStatus = sessionStorage.getItem(`case_status_${p.id}`);
                            return savedStatus ? { ...p, status: savedStatus } : p;
                        });
                    setProcesses(filtered);
                }
            } catch (error) {
                console.error("Error fetching processes:", error);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 1000);
        return () => clearInterval(interval);
    }, [category]);

    const getProcessesByStatus = (status) => {
        return processes.filter(p => p.status === status);
    };

    const tabs = [
        { name: 'Needs attention', status: 'Needs Attention', squareBg: 'bg-[#FFDADA]', squareBorder: 'border-[#A40000]' },
        { name: 'Needs review', status: 'Needs Review', squareBg: 'bg-[#FCEDB9]', squareBorder: 'border-[#ED6704]' },
        { name: 'Void', status: 'Void', squareBg: 'bg-[#EBEBEB]', squareBorder: 'border-[#8F8F8F]' },
        { name: 'In progress', status: 'In Progress', squareBg: 'bg-[#EAF3FF]', squareBorder: 'border-[#2546F5]' },
        { name: 'Done', status: 'Done', squareBg: 'bg-[#E2F1EB]', squareBorder: 'border-[#038408]' },
    ].map(tab => ({
        ...tab,
        count: getProcessesByStatus(tab.status).length
    }));

    const currentProcesses = getProcessesByStatus(activeTab);

    const renderEmptyState = (status) => {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-250px)] bg-white animate-opacity text-center mt-[-50px]">
                <div className="relative flex h-[150px] w-[190px] items-center justify-center mb-4">
                    <img src={status === 'Needs Attention' ? "/file1.svg" : "/file3.svg"} className="h-full w-full object-contain" />
                </div>
                <div className="text-[14px] font-[500] text-[#171717] mb-1">
                    {status === 'Needs Attention' ? 'No blockers right now' : 'All clear for now'}
                </div>
                <div className="text-[13px] font-[400] text-[#7d7d7d] max-w-[260px]">
                    {status === 'Needs Attention'
                        ? "Sit back and let things flow, we'll nudge you when it's time to step in."
                        : "Looks like a quiet moment. Maybe grab a coffee?"}
                </div>
            </div>
        );
    };

    const columns = [
        { label: 'Study ID', key: 'stockId' },
        { label: 'Document Type', key: 'documentType' },
        { label: 'Data Points', key: 'dataPoints' },
        { label: 'Risk Level', key: 'riskLevel' }
    ];

    return (
        <div className="bg-white flex flex-col h-full overflow-hidden">
            {/* Status Tabs Row */}
            <div className="px-6 pt-2 pb-1 flex-shrink-0">
                <div className="flex items-center gap-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.status}
                            onClick={() => setActiveTab(tab.status)}
                            className={`flex items-center gap-2 px-2 py-0.5 text-[11px] rounded-[6px] transition-colors ${activeTab === tab.status
                                ? "bg-[#00000005] border border-[#ebebeb] font-[500] text-[#171717]"
                                : 'text-[#666666] hover:text-[#171717] hover:bg-[#00000005] font-[500]'
                                }`}
                        >
                            <div className={`w-2 h-2 rounded-[1.5px] border ${tab.squareBg} ${tab.squareBorder}`} />
                            <span>{tab.name}</span>
                            <span className={activeTab === tab.status ? "text-[#171717]" : "text-[#cacaca]"}>
                                {tab.count}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Filter & Tools Row */}
            <div className="flex items-center justify-between px-6 py-2 flex-shrink-0">
                <button className="flex items-center gap-1.5 px-3 py-1 text-[12px] font-[500] text-[#171717] hover:bg-[#fbfbfb] rounded-[4px] border border-[#ebebeb] shadow-sm">
                    <Filter className="w-3 h-3" />
                    Filter
                </button>
                <div className="flex items-center pr-1">
                    <SlidersHorizontal className="w-4 h-4 text-[#8f8f8f] cursor-pointer opacity-70 hover:opacity-100" />
                </div>
            </div>

            {/* Table or Empty State */}
            <div className="flex-1 overflow-auto">
                {currentProcesses.length > 0 ? (
                    <table className="min-w-full border-collapse">
                        <thead className="sticky top-0 bg-white z-10 border-t border-b border-[#ebebeb]">
                            <tr className="f-12-450 text-[#8f8f8f]">
                                <th className="w-12 px-6 py-2"></th>
                                <th className="px-4 py-2 text-left font-normal whitespace-nowrap">
                                    Current Status
                                </th>
                                {columns.map(col => (
                                    <th key={col.key} className="px-4 py-2 text-left font-normal whitespace-nowrap">
                                        {col.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="">
                            {currentProcesses.map((process, index) => (
                                <tr
                                    key={process.id}
                                    className="hover:bg-[#f9f9f9] cursor-pointer transition-colors border-b border-[#f2f2f2] last:border-0"
                                    onClick={() => navigate(`/done/process/${process.id}`)}
                                >
                                    <td className="px-6 py-2.5 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            {/* Pulse icon for active items */}
                                            {process.status === 'Needs Attention' ? (
                                                <Activity className="w-2.5 h-2.5 text-[#ff1515]" />
                                            ) : process.status === 'Done' ? (
                                                <Check className="w-2.5 h-2.5 text-[#0da425]" />
                                            ) : process.status === 'In Progress' ? (
                                                <Activity className="w-2.5 h-2.5 text-[#2445ff]" />
                                            ) : (
                                                <div className="w-2.5 h-2.5" />
                                            )}

                                            <div className={`w-2 h-2 rounded-[1.5px] border ${process.status === 'Needs Attention' ? "bg-[#FFDADA] border-[#A40000]" :
                                                process.status === 'Needs Review' ? "bg-[#FCEDB9] border-[#ED6704]" :
                                                    process.status === 'Void' ? "bg-[#EBEBEB] border-[#8F8F8F]" :
                                                        process.status === 'In Progress' ? "bg-[#EAF3FF] border-[#2546F5]" :
                                                            "bg-[#E2F1EB] border-[#038408]"
                                                }`} />
                                        </div>
                                    </td>

                                    <td className="px-4 py-2.5 text-[13px] font-[450] text-[#171717] text-left max-w-[350px] truncate">
                                        {process.currentStatus || "An email response has been drafted"}
                                    </td>

                                    {columns.map(col => (
                                        <td key={col.key} className="px-4 py-2.5 whitespace-nowrap text-left text-[13px] font-[450] text-[#171717]">
                                            {process[col.key] || '—'}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    renderEmptyState(activeTab)
                )}
            </div>
        </div>
    );
};

export default ProcessList;