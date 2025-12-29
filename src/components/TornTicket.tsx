'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

import { toPng } from 'html-to-image';

interface TornTicketProps {
    username: string;
    score: number;
    breakdown: {
        technical: number;
        vibe: number;
        signal: number;
        mumbai: number;
    };
    category: string;
    seat: string;
    route: string;
    remark: string;
    status: string;
    onReset: () => void;
}

export default function TornTicket({
    username,
    score,
    breakdown,
    category,
    seat,
    route,
    remark,
    status,
    onReset
}: TornTicketProps) {
    const [serialNumber, setSerialNumber] = useState('');
    const [isSharing, setIsSharing] = useState(false);

    useEffect(() => {
        const rand = Math.floor(Math.random() * 9000) + 1000;
        setSerialNumber(`BEST-${rand}-X`);
    }, []);

    const handleShare = async (mode: 'download' | 'x') => {
        setIsSharing(true);
        try {
            const element = document.getElementById('poster-area');
            if (!element) return;

            const dataUrl = await toPng(element, {
                quality: 0.95,
                cacheBust: true,
                backgroundColor: '#1a1a1a', // Dark BG for the poster
                style: {
                    borderRadius: '0px',
                    padding: '40px'
                }
            });

            if (mode === 'download') {
                const link = document.createElement('a');
                link.download = `LaalDabba-Ticket-${username}.png`;
                link.href = dataUrl;
                link.click();
            } else {
                const text = `Ganpat just gave me an ${seat} on the ETHMumbai Express! 🚌💨\n\nGardi Score: ${score}\nRoast: "${remark}"\n\nCheck yours at ${window.location.origin} #ETHMumbai #LaalDabba`;
                const xUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
                window.open(xUrl, '_blank');
            }
        } catch (err) {
            console.error('Failed to capture ticket:', err);
        } finally {
            setIsSharing(false);
        }
    };

    const getStampColor = () => {
        if (score >= 800) return 'text-red-600 border-red-600';
        if (score >= 400) return 'text-blue-600 border-blue-600';
        return 'text-gray-600 border-gray-600';
    };

    const rippedClipPath = "polygon(0% 2%, 2% 0%, 5% 3%, 8% 0%, 12% 4%, 15% 1%, 18% 4%, 22% 0%, 25% 3%, 28% 1%, 32% 4%, 35% 0%, 38% 3%, 42% 1%, 45% 4%, 48% 0%, 52% 3%, 55% 1%, 58% 4%, 62% 0%, 65% 3%, 68% 1%, 72% 4%, 75% 0%, 78% 3%, 82% 1%, 85% 4%, 88% 0%, 92% 3%, 95% 1%, 98% 4%, 100% 2%, 100% 98%, 98% 96%, 95% 100%, 92% 97%, 88% 100%, 85% 96%, 82% 99%, 78% 96%, 75% 100%, 72% 97%, 68% 100%, 65% 96%, 62% 99%, 58% 96%, 55% 100%, 52% 97%, 48% 100%, 45% 96%, 42% 99%, 38% 96%, 35% 100%, 32% 97%, 28% 100%, 25% 96%, 22% 99%, 18% 96%, 15% 100%, 12% 97%, 8% 100%, 5% 96%, 2% 98%, 0% 100%)";

    return (
        <div className="flex flex-col items-center gap-6">
            <motion.div
                initial={{ y: -100, opacity: 0, rotate: -5 }}
                animate={{ y: 0, opacity: 1, rotate: 0 }}
                transition={{ type: 'spring', damping: 15, stiffness: 100 }}
                className="relative w-full max-w-md bg-[#F7F2E8] shadow-[10px_10px_30px_rgba(0,0,0,0.3)] font-vt323 p-6 text-gray-800"
                style={{
                    clipPath: rippedClipPath,
                    fontFamily: 'var(--font-vt323), monospace'
                }}
            >
                {/* Same ticket content as before... */}
                {/* Header */}
                <div className="flex justify-between items-center border-b-2 border-red-700/30 pb-2 mb-4">
                    <span className="text-lg font-bold text-red-700/60 uppercase tracking-widest">BEST BUS SERVICE</span>
                    <span className="text-lg font-bold">{serialNumber}</span>
                </div>

                {/* Main Content */}
                <div className="space-y-4">
                    <div className="flex justify-between items-end">
                        <div>
                            <p className="text-xs uppercase text-gray-500 mb-0">Passenger</p>
                            <p className="text-2xl font-bold leading-none select-all">@{username}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs uppercase text-gray-500 mb-0">Total Gardi Score</p>
                            <p className="text-5xl font-black text-red-700 leading-none">{score}</p>
                        </div>
                    </div>

                    {/* Gardi Score Breakdown */}
                    <div className="bg-red-900/5 p-3 rounded-sm border border-red-900/10 space-y-2">
                        <p className="text-[10px] uppercase font-bold text-red-900/40 tracking-widest border-b border-red-900/10 pb-1 mb-1">Score Breakdown</p>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                            <div className="flex justify-between items-center">
                                <span className="text-xs uppercase opacity-70">Technical</span>
                                <span className="font-bold">{breakdown?.technical || 0}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs uppercase opacity-70">Vibe</span>
                                <span className="font-bold">{breakdown?.vibe || 0}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs uppercase opacity-70">Signal</span>
                                <span className="font-bold">{breakdown?.signal || 0}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs uppercase opacity-70">Mumbai</span>
                                <span className="font-bold">{breakdown?.mumbai || 0}</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 border-t border-b border-dashed border-gray-400 py-4">
                        <div>
                            <p className="text-xs uppercase text-gray-500 mb-0">Category</p>
                            <p className="text-xl font-bold">{category}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs uppercase text-gray-500 mb-0">Seat</p>
                            <p className="text-xl font-bold">{seat}</p>
                        </div>
                    </div>

                    {/* Status Stamp */}
                    <div className="relative py-2 flex flex-col items-center">
                        <motion.div
                            initial={{ scale: 3, opacity: 0, rotate: -20 }}
                            animate={{ scale: 1, opacity: 1, rotate: Math.random() * 10 - 5 }}
                            transition={{ delay: 0.5, type: 'spring', damping: 10 }}
                            className={`border-[6px] px-6 py-2 text-4xl font-black uppercase tracking-tighter mix-blend-multiply opacity-80 ${getStampColor()}`}
                            style={{ boxShadow: 'inset 0 0 0 2px rgba(0, 0, 0, 0.1)' }}
                        >
                            {status}
                        </motion.div>
                    </div>

                    {/* Roast Bubble - Thermal Printer Font */}
                    <div className="bg-yellow-100/30 p-4 border-l-4 border-red-600 leading-tight">
                        <p className="text-[10px] uppercase font-bold text-red-600/40 mb-1">Conductor Remarks</p>
                        <p className="text-xl italic font-serif" style={{ fontFamily: 'Courier New, Courier, monospace', letterSpacing: '-0.5px' }}>
                            "{remark}"
                        </p>
                    </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-300 text-center opacity-30 select-none">
                    <p className="text-xs uppercase tracking-[0.5em]">GANPAT CONDUCTOR PROTOCOL V3.0</p>
                </div>
            </motion.div>

            {/* Social Actions */}
            <div className="flex flex-col gap-4 w-full">
                <div className="grid grid-cols-2 gap-4 w-full">
                    <button
                        onClick={() => handleShare('x')}
                        disabled={isSharing}
                        className="px-4 py-4 bg-[#CC0000] text-white font-black rounded-lg border-4 border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-[#A00000] transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-tighter italic"
                    >
                        Bhidu, X par flex kar!
                    </button>
                    <button
                        onClick={() => handleShare('download')}
                        disabled={isSharing}
                        className="px-4 py-4 bg-gray-800 text-white font-black rounded-lg border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-black transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-wider"
                    >
                        Download
                    </button>
                </div>
                <button
                    onClick={onReset}
                    className="w-full py-4 bg-[#facc15] text-black font-black rounded-lg border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:bg-[#eab308] transition-all transform active:scale-95 uppercase tracking-widest italic text-xl"
                >
                    Take Another Ride
                </button>
            </div>
        </div>
    );
}
