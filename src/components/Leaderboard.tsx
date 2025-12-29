'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';

interface Passenger {
    id: string;
    username: string;
    score: number;
    seat: string;
    remark: string;
    created_at: string;
}

export default function Leaderboard() {
    const [passengers, setPassengers] = useState<Passenger[]>([]);
    const [isLive, setIsLive] = useState(false);

    useEffect(() => {
        // Initial Fetch
        fetchTopPassengers();

        // Subscribe to Real-time updates
        const channel = supabase
            .channel('public:passengers')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'passengers' },
                (payload) => {
                    console.log('New passenger arrived:', payload);
                    setPassengers(prev => {
                        const newPassenger = payload.new as Passenger;
                        const updated = [newPassenger, ...prev];
                        // Filter duplicates by username, keeping highest score
                        const unique = Array.from(
                            updated.reduce((map, p) => {
                                if (!map.has(p.username) || map.get(p.username)!.score < p.score) {
                                    map.set(p.username, p);
                                }
                                return map;
                            }, new Map<string, Passenger>()).values()
                        ) as Passenger[];
                        return unique.sort((a, b) => b.score - a.score).slice(0, 10);
                    });
                }
            )
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') setIsLive(true);
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchTopPassengers = async () => {
        const { data, error } = await supabase
            .from('passengers')
            .select('*')
            .order('score', { ascending: false });

        if (data) {
            // Filter duplicates by username, keeping highest score
            const unique = Array.from(
                data.reduce((map, p) => {
                    if (!map.has(p.username) || map.get(p.username)!.score < p.score) {
                        map.set(p.username, p);
                    }
                    return map;
                }, new Map<string, Passenger>()).values()
            ) as Passenger[];
            setPassengers(unique.slice(0, 10));
        }
        if (error) console.error('Error fetching leaderboard:', error);
    };

    return (
        <div className="w-full max-w-md bg-yellow-400 border-4 border-black p-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] font-vt323 text-black">
            {/* LED-style "LIVE" Indicator */}
            <div className="flex justify-between items-center mb-4 border-b-2 border-black pb-2">
                <h2 className="text-2xl font-black uppercase italic tracking-tighter">Station Board</h2>
                <div className="flex items-center gap-2">
                    <motion.div
                        animate={{ opacity: [1, 0.3, 1] }}
                        transition={{ repeat: Infinity, duration: 1 }}
                        className={`w-3 h-3 rounded-full ${isLive ? 'bg-red-600' : 'bg-gray-600'} shadow-[0_0_8px_rgba(220,38,38,0.8)]`}
                    />
                    <span className="text-xs font-bold uppercase">Live</span>
                </div>
            </div>

            {/* Leaderboard Rows */}
            <div className="space-y-2 min-h-[300px]">
                <AnimatePresence mode="popLayout">
                    {passengers.map((p, index) => (
                        <motion.div
                            key={p.id || p.username + p.created_at}
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: 20, opacity: 0 }}
                            layout
                            className="flex justify-between items-center bg-black/5 p-2 border-b border-black/10 hover:bg-white/40 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <span className="font-black text-xl w-6">#{index + 1}</span>
                                <div className="flex flex-col">
                                    <span className="font-bold">@{p.username}</span>
                                    <span className="text-[10px] uppercase opacity-60 leading-none">{p.seat}</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-2xl font-black text-red-700 leading-none">{p.score}</span>
                                <p className="text-[10px] italic line-clamp-1 opacity-80">{p.remark}</p>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {passengers.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center opacity-40 py-12">
                        <p className="italic">Bus stop khali hai...</p>
                        <p className="text-xs uppercase">(Wait for passengers)</p>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="mt-4 pt-2 border-t border-black/20 text-[10px] uppercase text-center font-bold opacity-60">
                Next Bus: Approaching ETHMumbai
            </div>
        </div>
    );
}
