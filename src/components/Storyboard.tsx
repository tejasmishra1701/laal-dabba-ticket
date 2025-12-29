'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TornTicket from './TornTicket';
import Leaderboard from './Leaderboard';

type Phase = 'IDLE' | 'CHOICE' | 'LEAVING' | 'ZOOM' | 'CONDUCTOR_CHOICE' | 'WINDOW' | 'RESULT';

interface ValidationResult {
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
}

export default function Storyboard() {
    const [currentPhase, setCurrentPhase] = useState<Phase>('IDLE');
    const [username, setUsername] = useState('');
    const [result, setResult] = useState<ValidationResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [showLeaderboard, setShowLeaderboard] = useState(false);

    const getGanpatCommentary = (score: number) => {
        if (score >= 800) return "Arre Boss! Engine pe baitho. Ekdum kkadak profile hai!";
        if (score < 300) return "Footboard pe latak! Chutta nahi hai tere liye.";
        return "Theek hai, aage badho! Beech mein mat khade raho.";
    };

    const handleBoardBus = () => {
        setCurrentPhase('ZOOM');
    };

    const handleWalk = () => {
        setCurrentPhase('LEAVING');
    };

    const handleCutTicket = () => {
        setCurrentPhase('WINDOW');
    };

    const handleNoCutTicket = () => {
        setCurrentPhase('LEAVING');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!username.trim()) return;

        setLoading(true);
        try {
            const response = await fetch('/api/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: username.trim() }),
            });

            if (!response.ok) throw new Error('Validation failed');

            const data = await response.json();
            setResult(data);
            setCurrentPhase('RESULT');
        } catch (error) {
            console.error('Failed to validate:', error);
            alert('Failed to validate user. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative w-full h-screen overflow-hidden bg-black font-vt323">
            {/* Top LED Bar */}
            <div className="absolute top-0 left-0 w-full h-12 bg-black border-b-2 border-yellow-500/30 flex items-center z-[60] overflow-hidden shadow-[0_0_20px_rgba(255,215,0,0.2)]">
                <div className="flex items-center px-4 h-full bg-black z-10 border-r border-yellow-500/20">
                    <span className="text-yellow-400 font-black text-xl tracking-tighter whitespace-nowrap">
                        LAAL DABBA TICKET 🚌
                    </span>
                </div>

                <div className="flex-1 relative overflow-hidden h-full flex items-center">
                    <motion.div
                        animate={{ x: [0, "-50%"] }}
                        transition={{
                            repeat: Infinity,
                            duration: 80,
                            ease: "linear"
                        }}
                        className="flex whitespace-nowrap text-yellow-400 text-lg uppercase tracking-[0.2em] font-bold"
                        style={{ textShadow: '0 0 10px rgba(255, 215, 0, 0.5)' }}
                    >
                        <span className="pr-4">
                            ROUTE 402 — ETHMUMBAI EXPRESS — PUDHCHA STATION: MAINNET — FINAL DESTINATION: THE MOON — CHUTTA RAKHO BOSS — GAS PRICE IS HIGHER THAN VADA PAV TODAY — FOOTBOARD PE MAT LATKO — ALPHA PASSENGERS ONLY — ZERO KNOWLEDGE? NO PROBLEM, BUS MEIN BAITHO — AGLE STOP PE AIRDROP MILEGA — NO SHITPOSTERS ALLOWED — JAI MAHARASHTRA — BUILD FROM MUMBAI, FOR THE WORLD — GANPAT IS WATCHING YOUR LUGGAGE — DONT PUSH, BLOCKSPACE IS LIMITED — HOLD THE HANDLEBARS — NEXT STOP: GENESIS BLOCK —
                        </span>
                        <span className="pr-4">
                            ROUTE 402 — ETHMUMBAI EXPRESS — PUDHCHA STATION: MAINNET — FINAL DESTINATION: THE MOON — CHUTTA RAKHO BOSS — GAS PRICE IS HIGHER THAN VADA PAV TODAY — FOOTBOARD PE MAT LATKO — ALPHA PASSENGERS ONLY — ZERO KNOWLEDGE? NO PROBLEM, BUS MEIN BAITHO — AGLE STOP PE AIRDROP MILEGA — NO SHITPOSTERS ALLOWED — JAI MAHARASHTRA — BUILD FROM MUMBAI, FOR THE WORLD — GANPAT IS WATCHING YOUR LUGGAGE — DONT PUSH, BLOCKSPACE IS LIMITED — HOLD THE HANDLEBARS — NEXT STOP: GENESIS BLOCK —
                        </span>
                    </motion.div>
                </div>
            </div>

            {/* Global Leaderboard Toggle Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowLeaderboard(true)}
                className="absolute top-16 right-6 z-[50] px-4 py-2 bg-yellow-400 text-black border-2 border-black font-bold text-sm rounded shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-yellow-500 transition-colors uppercase tracking-tight flex items-center gap-2"
            >
                <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                Station Board
            </motion.button>

            {/* Leaderboard Overlay */}
            <AnimatePresence>
                {showLeaderboard && (
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        className="absolute right-0 top-0 h-full w-full max-w-md z-[70] p-4 pt-16"
                    >
                        <div className="relative h-full">
                            <button
                                onClick={() => setShowLeaderboard(false)}
                                className="absolute -left-12 top-10 bg-black text-yellow-400 p-2 border-4 border-yellow-400 font-bold rotate-90 z-50"
                            >
                                CLOSE
                            </button>
                            <Leaderboard />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Background Layer */}
            <AnimatePresence mode="wait">
                {(currentPhase === 'IDLE' || currentPhase === 'CHOICE' || currentPhase === 'LEAVING') ? (
                    <motion.div
                        key="skyline"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0"
                    >
                        <img src="/MumbaiSkyline.png" alt="Skyline" className="w-full h-full object-cover" />
                    </motion.div>
                ) : currentPhase === 'WINDOW' ? (
                    <motion.div
                        key="window-bg"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0"
                    >
                        <img src="/TicketWindow.png" alt="Window" className="w-full h-full object-cover" />
                    </motion.div>
                ) : (
                    <motion.div
                        key="bus-front-bg"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0"
                    >
                        <img src="/BusFrontBG.png" alt="Bus Front BG" className="w-full h-full object-cover" />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Phase Content */}
            <div className="relative z-10 w-full h-full flex items-center justify-center pt-12">
                <AnimatePresence>
                    {(currentPhase === 'IDLE' || currentPhase === 'CHOICE' || currentPhase === 'LEAVING') && (
                        <motion.div
                            key="bus-main"
                            initial={{ x: '150%', y: 'calc(15% - 110px)', scale: 0.6, opacity: 0 }}
                            animate={
                                currentPhase === 'LEAVING'
                                    ? { x: '-150%', y: 'calc(15% - 110px)', scale: 1.2, opacity: 1 }
                                    : { x: '-5%', y: 'calc(20% - 110px)', scale: 1, opacity: 1 }
                            }
                            transition={{
                                duration: currentPhase === 'LEAVING' ? 2 : 5,
                                ease: currentPhase === 'LEAVING' ? "easeIn" : "easeOut"
                            }}
                            onAnimationComplete={() => {
                                if (currentPhase === 'IDLE') {
                                    setCurrentPhase('CHOICE');
                                } else if (currentPhase === 'LEAVING') {
                                    setTimeout(() => setCurrentPhase('IDLE'), 2000);
                                }
                            }}
                            className="absolute w-2/3"
                        >
                            <img
                                src="/BusElement.png"
                                alt="Bus"
                                className="w-full h-auto drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                {currentPhase === 'CHOICE' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="flex flex-col items-center gap-6 z-20 mt-40"
                    >
                        <div className="flex flex-col gap-4">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleBoardBus}
                                className="px-12 py-4 bg-red-600 text-white font-black text-2xl rounded-sm shadow-[6px_6px_0px_0px_rgba(153,27,27,1)] hover:bg-red-700 transition-all uppercase tracking-tighter italic border-4 border-white"
                            >
                                Board the Bus
                            </motion.button>
                            {/* Old button removed, now in top right */}
                            <button
                                onClick={handleWalk}
                                className="text-white/60 font-bold hover:text-white transition-colors uppercase tracking-widest text-sm underline underline-offset-4"
                            >
                                No, I'll walk
                            </button>
                        </div>
                    </motion.div>
                )}

                {currentPhase === 'ZOOM' && (
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 1.5 }}
                        onAnimationComplete={() => setCurrentPhase('CONDUCTOR_CHOICE')}
                        className="w-full h-full flex items-center justify-center"
                    >
                        <img src="/BusFront.png" alt="Bus Front" className="w-auto h-screen object-contain" />
                    </motion.div>
                )}

                {currentPhase === 'CONDUCTOR_CHOICE' && (
                    <div className="relative w-full h-full flex items-center justify-center">
                        <img src="/BusFront.png" alt="Bus Front" className="w-auto h-screen object-contain scale-110" />
                        <motion.div
                            initial={{ x: 200, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            className="absolute right-10 bg-orange-50 p-8 border-4 border-red-600 rounded-xl shadow-2xl max-w-sm"
                        >
                            <p className="text-2xl font-black text-gray-800 mb-6 italic uppercase">"Ticket nikalna hai kya?"</p>
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={handleCutTicket}
                                    className="px-6 py-4 bg-red-600 text-white font-black text-xl rounded-sm hover:bg-red-700 transition-all uppercase tracking-tighter shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]"
                                >
                                    Turant se pehle
                                </button>
                                <button
                                    onClick={handleNoCutTicket}
                                    className="px-6 py-4 bg-gray-600 text-white font-black text-xl rounded-sm hover:bg-gray-700 transition-all uppercase tracking-tighter shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]"
                                >
                                    Abhi nahi
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}

                {currentPhase === 'WINDOW' && (
                    <div className="w-full max-w-md p-8 bg-orange-50/10 backdrop-blur-sm border-2 border-red-600/30 rounded-2xl">
                        <h2 className="text-3xl font-black text-red-700 text-center mb-8 uppercase italic">तुमचे नाव सांगा</h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-red-600 font-black text-2xl">@</span>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value.replace(/^@/, ''))}
                                    placeholder="Twitter Handle"
                                    className="w-full pl-12 pr-4 py-4 bg-white border-b-4 border-red-700 text-2xl font-black focus:outline-none uppercase text-red-900 placeholder:text-red-900/40"
                                    disabled={loading}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading || !username.trim()}
                                className="w-full py-5 bg-red-600 text-white font-black text-3xl rounded-sm shadow-[6px_6px_0px_0px_rgba(153,27,27,1)] hover:bg-red-700 transition-all disabled:opacity-50 uppercase italic border-4 border-white/20"
                            >
                                {loading ? 'Thamb re baba' : 'Ticket Kaato'}
                            </button>
                        </form>
                    </div>
                )}

                {currentPhase === 'RESULT' && result && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="w-full h-full flex flex-col items-center justify-center p-4 pt-16"
                    >
                        <div className="transform scale-[0.85] md:scale-100 max-h-[85vh] overflow-y-auto pr-4 custom-roller">
                            <div id="poster-area" className="flex flex-col md:flex-row items-center gap-8 bg-black/60 p-10 rounded-3xl backdrop-blur-xl border border-white/10 shadow-2xl">
                                <TornTicket
                                    username={username}
                                    score={result.score}
                                    breakdown={result.breakdown}
                                    category={result.category}
                                    seat={result.seat}
                                    route={result.route}
                                    remark={result.remark}
                                    status={result.status}
                                    onReset={() => {
                                        setCurrentPhase('IDLE');
                                        setUsername('');
                                        setResult(null);
                                    }}
                                />

                                <motion.div
                                    initial={{ x: 100, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                    className="relative w-64 md:w-80 group shrink-0"
                                >
                                    {/* Ganpat Speech Bubble */}
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 1 }}
                                        className="absolute -top-24 -left-12 bg-white p-4 rounded-2xl border-4 border-red-600 shadow-xl w-64 rotate-[-5deg] z-20"
                                    >
                                        <p className="text-red-700 font-black text-lg italic text-center uppercase leading-tight">
                                            {getGanpatCommentary(result.score)}
                                        </p>
                                        <div className="absolute -bottom-4 left-1/4 w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[20px] border-t-red-600"></div>
                                    </motion.div>
                                    <img src="/Ganpat.png" alt="Ganpat" className="w-full h-auto drop-shadow-[-20px_0_30px_rgba(0,0,0,0.5)] transform group-hover:scale-105 transition-transform" />
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
