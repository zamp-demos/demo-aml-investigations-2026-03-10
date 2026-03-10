import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('user@zamp.ai');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        if (email === 'user@zamp.ai' && password === 'demo123') {
            navigate('/done');
        } else {
            setError(true);
            setTimeout(() => setError(false), 3000);
        }
    };


    return (
        <div className="min-h-screen flex items-center justify-center bg-[#fdfdfb] relative overflow-hidden font-sans">
            {/* Dynamic Grid Background with Moving Lines */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Primary Grid */}
                <div
                    className="absolute inset-x-[-50%] inset-y-[-50%] w-[200%] h-[200%] opacity-[0.05]"
                    style={{
                        backgroundImage: `
                            linear-gradient(to right, #000 1px, transparent 1px),
                            linear-gradient(to bottom, #000 1px, transparent 1px)
                        `,
                        backgroundSize: '80px 80px',
                        transform: 'rotate(-0.5deg)'
                    }}
                />

                {/* Subtle Moving Lines - Horizontal */}
                <div className="absolute top-[20%] left-0 w-full h-[1px] bg-black opacity-[0.03] animate-grid-line-h" style={{ animationDelay: '0s' }} />
                <div className="absolute top-[40%] left-0 w-full h-[1px] bg-black opacity-[0.03] animate-grid-line-h" style={{ animationDelay: '3s' }} />
                <div className="absolute top-[60%] left-0 w-full h-[1px] bg-black opacity-[0.03] animate-grid-line-h" style={{ animationDelay: '7s' }} />
                <div className="absolute top-[80%] left-0 w-full h-[1px] bg-black opacity-[0.03] animate-grid-line-h" style={{ animationDelay: '12s' }} />

                {/* Subtle Moving Lines - Vertical */}
                <div className="absolute left-[20%] top-0 w-[1px] h-full bg-black opacity-[0.03] animate-grid-line-v" style={{ animationDelay: '2s' }} />
                <div className="absolute left-[40%] top-0 w-[1px] h-full bg-black opacity-[0.03] animate-grid-line-v" style={{ animationDelay: '5s' }} />
                <div className="absolute left-[60%] top-0 w-[1px] h-full bg-black opacity-[0.03] animate-grid-line-v" style={{ animationDelay: '9s' }} />
                <div className="absolute left-[80%] top-0 w-[1px] h-full bg-black opacity-[0.03] animate-grid-line-v" style={{ animationDelay: '14s' }} />

                {/* Hashed blocks */}
                <div className="absolute top-[28%] left-[20%] w-[80px] h-[320px] opacity-[0.02]" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #000 0, #000 1.5px, transparent 0, transparent 12px)' }} />
                <div className="absolute top-[28%] right-[20%] w-[120px] h-[320px] opacity-[0.02]" style={{ backgroundImage: 'repeating-linear-gradient(-45deg, #000 0, #000 1.5px, transparent 0, transparent 12px)' }} />

                {/* Dots / Small squares */}
                <div className="absolute top-[28%] left-[6.5%] w-2 h-2 bg-black opacity-[0.05]" />
                <div className="absolute bottom-[28%] right-[6.5%] w-2 h-2 bg-black opacity-[0.05]" />
            </div>

            <div className="w-[640px] bg-white rounded-[24px] border border-[#f0f0f0] shadow-[0_4px_40px_rgba(0,0,0,0.03)] p-[80px] relative z-10">
                <div className="flex flex-col">
                    {/* Logo Section */}
                    <div className="flex items-center gap-3 mb-[48px]">
                        <img src="/zamp-icon.svg" className="w-[28px] h-[28px]" alt="zamp" />
                        <span className="text-[26px] font-[750] text-black tracking-[-0.04em]">zamp</span>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-[24px]">
                        <div className="space-y-[8px]">
                            <label className="text-[12px] text-[#8f8f8f] font-[450]">Email</label>
                            <input
                                type="email"
                                required
                                autoFocus
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="admin@zamp.ai"
                                className="w-full px-4 py-[11px] bg-white border border-[#f2f2f2] rounded-md text-[14px] text-black placeholder-[#cacaca] outline-none hover:border-[#ebebeb] focus:border-[#e0e0e0] transition-colors"
                            />
                        </div>

                        <div className="space-y-[8px]">
                            <label className="text-[12px] text-[#8f8f8f] font-[450]">Password</label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••••••••••••"
                                className="w-full px-4 py-[11px] bg-white border border-[#f2f2f2] rounded-md text-[14px] text-black placeholder-[#cacaca] outline-none hover:border-[#ebebeb] focus:border-[#e0e0e0] transition-colors"
                            />
                        </div>

                        <div className="pt-[16px]">
                            {error && (
                                <p className="text-red-500 text-[12px] mb-4 animate-in fade-in slide-in-from-top-1">Invalid credentials. Please try again.</p>
                            )}
                            <button
                                type="submit"
                                className="flex items-center gap-2.5 px-6 py-[11px] bg-[#171717] hover:bg-[#262626] text-white text-[13px] font-[500] rounded-[6px] transition-all active:scale-[0.98] shadow-sm"
                            >
                                <span>Login</span>
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;