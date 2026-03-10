import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
    Layout,
    ChevronDown,
    FileText,
    Settings,
    User,
    Database,
    Users,
    PanelLeft,
    Share2,
    BookOpen,
    LogOut,
    ArrowLeft,
    ChevronRight,
    MessageSquare,
    Activity,
    Plus,
    Layers,
    AlignLeft,
    Sun,
    Square,
    Check
} from 'lucide-react';
import FeedbackModal from './FeedbackModal';
import FeedbackQueuePanel from './FeedbackQueuePanel';

const DashboardLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isAirbnbOpen, setIsAirbnbOpen] = useState(false);
    const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
    const [isQueueOpen, setIsQueueOpen] = useState(false);
    const [counts, setCounts] = useState({ open: 0, queued: 0, processing: 0, applied: 0 });
    const queueTriggerRef = React.useRef(null);

    // Load queue count
    useEffect(() => {
        const loadQueueCount = async () => {
            try {
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
                const response = await fetch(`${API_URL}/api/feedback/queue`);
                if (response.ok) {
                    const data = await response.json();
                    const items = data.queue || [];
                    setCounts({
                        open: items.filter(i => i.status === 'open' || !i.status).length,
                        queued: items.filter(i => i.status === 'pending').length,
                        processing: items.filter(i => i.status === 'processing').length,
                        applied: items.filter(i => i.status === 'applied').length
                    });
                }
            } catch (error) {
                console.error('Error loading queue count:', error);
            }
        };
        loadQueueCount();
        const interval = setInterval(loadQueueCount, 10000);
        return () => clearInterval(interval);
    }, []);

    // Keyboard shortcut: ⌘K to open feedback modal
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsFeedbackModalOpen(prev => !prev);
            }
        };

        const handleOpenFeedback = () => setIsFeedbackModalOpen(true);

        document.addEventListener('keydown', handleKeyDown);
        window.addEventListener('open-feedback', handleOpenFeedback);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('open-feedback', handleOpenFeedback);
        };
    }, []);

    const isProcessDetailPage = location.pathname.includes('/process/');

    const handleLogout = () => {
        setIsAirbnbOpen(false);
        navigate('/');
    };

    const SidebarItem = ({ to, icon, label, isActive }) => (
        <NavLink
            to={to}
            className={`flex h-[34px] w-full items-center gap-2.5 overflow-hidden rounded-md px-2.5 transition-colors ${isActive
                ? 'bg-[#efefef] text-[#171717] font-[550]'
                : 'text-[#383838] hover:bg-[#00000005]'
                }`}
        >
            <div className={`${isActive ? 'text-[#171717]' : 'text-[#8f8f8f]'}`}>
                {React.cloneElement(icon, { size: 14, strokeWidth: isActive ? 2 : 1.5 })}
            </div>
            <span className="text-[13px] truncate select-none">{label}</span>
        </NavLink>
    );

    return (
        <div className="flex h-screen bg-[#FAFAFA] font-sans antialiased text-[#171717]">
            {/* Sidebar Toggle (when closed) */}
            {!isSidebarOpen && (
                <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="absolute top-0 left-0 z-30 flex h-10 w-10 items-center justify-center bg-transparent transition-opacity hover:opacity-100 opacity-50"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#8f8f8f]">
                        <path
                            d="M17.5 17.5L17.5 6.5M7.8 3H16.2C17.8802 3 18.7202 3 19.362 3.32698C19.9265 3.6146 20.3854 4.07354 20.673 4.63803C21 5.27976 21 6.11984 21 7.8V16.2C21 17.8802 21 18.7202 20.673 19.362C20.3854 19.9265 19.9265 20.3854 19.362 20.673C18.7202 21 17.8802 21 16.2 21H7.8C6.11984 21 5.27976 21 4.63803 20.673C4.07354 20.3854 3.6146 19.9265 3.32698 19.362C3 18.7202 3 17.8802 3 16.2V7.8C3 6.11984 3 5.27976 3.32698 4.63803C3.6146 4.07354 4.07354 3.6146 4.63803 3.32698C5.27976 3 6.11984 3 7.8 3Z"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </button>
            )}

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 z-20 flex h-screen w-60 flex-col overflow-hidden bg-[#FAFAFA] transition-transform duration-150 ease-[0.4,0,0.2,1] ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                {/* Logo Area */}
                <div className="h-12 flex items-center justify-between px-4 py-3">
                    <img src="/zamp-icon.svg" alt="zamp" className="w-[20px] h-[20px]" />
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="text-[#8f8f8f] hover:text-[#171717] focus:outline-none"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-50 hover:opacity-100 transition-opacity">
                            <path
                                d="M17.5 17.5L17.5 6.5M7.8 3H16.2C17.8802 3 18.7202 3 19.362 3.32698C19.9265 3.6146 20.3854 4.07354 20.673 4.63803C21 5.27976 21 6.11984 21 7.8V16.2C21 17.8802 21 18.7202 20.673 19.362C20.3854 19.9265 19.9265 20.3854 19.362 20.673C18.7202 21 17.8802 21 16.2 21H7.8C6.11984 21 5.27976 21 4.63803 20.673C4.07354 20.3854 3.6146 19.9265 3.32698 19.362C3 18.7202 3 17.8802 3 16.2V7.8C3 6.11984 3 5.27976 3.32698 4.63803C3.6146 4.07354 4.07354 3.6146 4.63803 3.32698C5.27976 3 6.11984 3 7.8 3Z"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </button>
                </div>


                <nav className="flex-1 overflow-y-auto px-2 pb-4 space-y-1 mt-2">
                    <div className="pb-4 border-b border-[#f0f0f0]">
                        <SidebarItem
                            to="/data"
                            icon={<Database />}
                            label="Data"
                            isActive={location.pathname === '/data'}
                        />
                        <SidebarItem
                            to="/done/people"
                            icon={<Users />}
                            label="People"
                            isActive={location.pathname === '/done/people'}
                        />
                    </div>

                    <div className="pt-4">
                        <div className="flex items-center justify-between px-3 mb-2">
                            <span className="text-[12px] font-[550] text-[#8f8f8f]">Processes</span>
                            <Plus size={14} className="text-[#cacaca] cursor-pointer hover:text-[#8f8f8f]" />
                        </div>
                        <SidebarItem
                            to="/done/aml-investigations"
                            icon={<Activity />}
                            label="AML Investigations"
                            isActive={location.pathname.includes('aml-investigations') || isProcessDetailPage}
                        />
                    </div>

                    <div className="pt-4">
                        <div className="flex items-center justify-between px-3 mb-2">
                            <span className="text-[12px] font-[550] text-[#8f8f8f]">Pages</span>
                            <Plus size={14} className="text-[#cacaca] cursor-pointer hover:text-[#8f8f8f]" />
                        </div>
                    </div>
                </nav>


                {/* Bottom User Area */}
                <div className="mt-auto border-t border-[#f0f0f0] relative p-1 bg-[#FAFAFA]">
                    <button
                        onClick={() => setIsAirbnbOpen(!isAirbnbOpen)}
                        className="w-full flex items-center justify-between px-2.5 py-2 text-[13px] text-[#383838] hover:bg-[#00000008] rounded-md transition-colors"
                    >
                        <div className="flex items-center gap-2.5 font-[500]">
                            <div className="w-6 h-6 bg-[#ebebeb] rounded flex items-center justify-center text-black font-bold text-[11px]">
                                M
                            </div>
                            <span>Meridian Bank</span>
                        </div>
                        <ChevronDown className={`w-3.5 h-3.5 text-[#c9c9c9] transition-transform duration-200 ${isAirbnbOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isAirbnbOpen && (
                        <div className="absolute bottom-full left-1 right-1 mb-1 bg-white border border-[#f0f0f0] rounded-lg shadow-[0_-4px_20px_rgba(0,0,0,0.05)] py-1 z-50 animate-in fade-in slide-in-from-bottom-2">
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center px-3 py-2 text-xs text-[#383838] hover:bg-[#fbfbfb]"
                            >
                                <LogOut className="w-3.5 h-3.5 mr-2.5" />
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </aside>

            {/* Main Content Area */}
            <div
                className={`flex-1 flex flex-col transition-all duration-150 ease-[0.4,0,0.2,1] ${isSidebarOpen ? 'ml-60' : 'ml-0'
                    }`}
            >
                {/* Header */}
                <header className="h-10 flex items-center justify-between px-4 bg-[#FAFAFA] relative border-b border-[#f0f0f0]">
                    {/* Left: Title / Breadcrumb */}
                    <div className={`flex items-center gap-3 transition-opacity duration-150 ${!isSidebarOpen ? 'pl-8' : ''}`}>
                        <div className="flex items-center gap-2 text-[13px]">
                            {location.pathname.includes('/knowledge-base') ? (
                                <>
                                    <button onClick={() => navigate('/done/aml-investigations')} className="hover:bg-white rounded p-1 transition-colors">
                                        <ArrowLeft className="w-3.5 h-3.5 text-[#171717]" />
                                    </button>
                                    <span className="text-[#8f8f8f] font-normal">AML Investigations /</span>
                                    <span className="text-[#171717] font-bold">Knowledge Base</span>
                                </>
                            ) : isProcessDetailPage ? (
                                <>
                                    <button onClick={() => navigate('/done/aml-investigations')} className="hover:bg-white rounded p-1 transition-colors">
                                        <ArrowLeft className="w-3.5 h-3.5 text-[#171717]" />
                                    </button>
                                    <span className="text-[#171717] font-[550]">AML Investigations</span>
                                    <ChevronRight className="w-3.5 h-3.5 text-[#c9c9c9]" />
                                    <span className="text-[#171717] font-[550]">Activity Logs</span>
                                </>
                            ) : (
                                <span className="text-[#171717] font-[550]">AML Investigations</span>
                            )}
                        </div>
                    </div>

                    {/* Center: Work with Pace */}
                    <div className="absolute left-1/2 transform -translate-x-1/2">
                        <button
                            onClick={() => setIsFeedbackModalOpen(true)}
                            className="bg-[#efefef] text-[#8f8f8f] border border-[#f0f0f0] flex h-7.5 w-[220px] items-center justify-between px-3 py-1 rounded-md shadow-sm hover:border-[#e5e5e5] transition-all"
                        >
                            <div className="flex items-center gap-2">
                                <img src="/adam-icon.svg" alt="pace" className="w-[11px] h-[11px] opacity-70 grayscale" />
                                <span className="text-[11px] font-[450]">Work with Pace</span>
                            </div>
                            <div className="flex items-center gap-1 opacity-60">
                                <span className="flex h-4 w-4 items-center justify-center rounded border border-[#dfdfdf] text-[10px] text-[#8f8f8f] bg-white">⌘</span>
                                <span className="flex h-4 w-4 items-center justify-center rounded border border-[#dfdfdf] text-[10px] text-[#8f8f8f] bg-white">K</span>
                            </div>
                        </button>
                    </div>


                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 px-4">
                        <button
                            onClick={() => navigate(`/done/knowledge-base?category=dir`)}
                            className="group relative p-1.5 hover:bg-white rounded-md border border-[#f0f0f0] bg-[#FAFAFA] shadow-sm transition-colors"
                        >
                            <BookOpen className="w-4 h-4 text-[#666666]" />
                            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1.5 bg-[#171717] text-white text-[11px] font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                                Knowledge Base
                            </div>
                        </button>

                        <button
                            className="group relative p-1.5 hover:bg-white rounded-md border border-[#f0f0f0] bg-[#FAFAFA] shadow-sm transition-colors"
                        >
                            <MessageSquare className="w-4 h-4 text-[#666666]" />
                            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1.5 bg-[#171717] text-white text-[11px] font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                                All chats
                            </div>
                        </button>

                        {/* Segmented Queue Trigger matching screenshot */}
                        <div className="flex items-center bg-[#f5f5f5] rounded-xl p-0.5 border border-[#ebebeb] shadow-sm ml-2" ref={queueTriggerRef}>
                            <button
                                onClick={() => setIsQueueOpen(!isQueueOpen)}
                                className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-medium transition-all ${isQueueOpen ? 'bg-white shadow-sm text-[#171717]' : 'text-[#666] hover:bg-[#eaeaea]'}`}
                            >
                                <div className="w-3.5 h-3.5 text-blue-500">
                                    <Square size={14} strokeWidth={2.5} />
                                </div>
                                <span className="text-[#8f8f8f] px-1 text-[9px] font-semibold">{counts.open}</span>
                            </button>
                            <div className="w-px h-3 bg-[#e0e0e0] mx-0.5" />
                            <button
                                onClick={() => setIsQueueOpen(!isQueueOpen)}
                                className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-medium text-[#666] hover:bg-[#eaeaea] transition-all"
                            >
                                <div className="w-3.5 h-3.5 text-[#666]">
                                    <AlignLeft size={14} strokeWidth={2} />
                                </div>
                                <span className="bg-[#e0e0e0] text-[#171717] px-1 rounded text-[9px] min-w-[14px] text-center font-semibold">{counts.queued}</span>
                            </button>
                            <div className="w-px h-3 bg-[#e0e0e0] mx-0.5" />
                            <button
                                onClick={() => setIsQueueOpen(!isQueueOpen)}
                                className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-medium text-[#666] hover:bg-[#eaeaea] transition-all"
                            >
                                <Sun className="w-3.5 h-3.5 text-[#666]" />
                                <span className="text-[#8f8f8f] px-1 text-[9px] font-semibold">{counts.processing}</span>
                            </button>
                            <div className="w-px h-3 bg-[#e0e0e0] mx-0.5" />
                            <button
                                onClick={() => setIsQueueOpen(!isQueueOpen)}
                                className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-medium text-[#666] hover:bg-[#eaeaea] transition-all"
                            >
                                <Check className="w-3.5 h-3.5 text-orange-600" />
                                <span className="bg-[#fff3e0] text-[#e65100] px-1 rounded text-[9px] min-w-[14px] text-center font-semibold">{counts.applied}</span>
                            </button>

                            {/* Feedback Queue Panel - Popover Positioned here */}
                            <div className="absolute top-full right-0 mt-2 z-50">
                                <FeedbackQueuePanel
                                    isOpen={isQueueOpen}
                                    onClose={() => setIsQueueOpen(false)}
                                    triggerRef={queueTriggerRef}
                                />
                            </div>
                        </div>

                        <button
                            onClick={async () => {
                                try {
                                    await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/reset`);
                                } catch (err) {
                                    console.error('Failed to reset backend:', err);
                                }
                                window.location.reload();
                            }}
                            className="px-3 py-1.5 text-[11px] text-[#383838] bg-[#FAFAFA] hover:bg-gray-50 rounded-md font-[550] border border-[#f0f0f0] shadow-sm ml-1 transition-colors"
                        >
                            Share
                        </button>
                    </div>
                </header>



                {/* Page Container with Rounded Corner */}
                <main
                    className={`flex-1 bg-white border-l border-[#f0f0f0] overflow-hidden ${isSidebarOpen ? 'rounded-tl-[24px]' : ''
                        }`}
                >
                    <div className="h-full overflow-y-auto bg-white">
                        <Outlet />
                    </div>
                </main>
            </div>

            {/* Feedback Modal */}
            <FeedbackModal
                isOpen={isFeedbackModalOpen}
                onClose={() => setIsFeedbackModalOpen(false)}
            />

            {/* Feedback Queue Panel - Popover was moved up */}
        </div>
    );
};

export default DashboardLayout;
