import { NextResponse } from 'next/server';
import { supabase, insertPassenger } from '@/lib/supabase';
import { GoogleGenerativeAI } from '@google/generative-ai';

// System prompt for the Ganpat Protocol - Merciful Conductor Edition
const systemPrompt = `You are Ganpat, a grumpy but secretly kind Mumbai bus conductor. Analyze this X profile for "ETHMumbai Maxi" energy using the GARDLI SCORE (0-1000).

SCORING PHILOSOPHY:
- THE VIP OVERRIDE: If the username is "ETHMumbai", "Devfolio", or "ETHIndia", it is an AUTOMATIC score of 990-1000. These are the owners of the bus.
- THE GENEROUS BASELINE: Every real human with at least 5-10 tweets starts with a baseline of 400. 
- BE GRANULAR: Use specific, non-round numbers (e.g., 784, 621, 893). Avoid 400, 500, 600.
- 0-300: Reserved ONLY for obvious bots, 0-tweet accounts, or pure airdrop spam scripts. (Footboard)
- 301-600: Quiet lurkers or new folks who haven't found their "Vada Pav" energy yet. (Aisle Seat)
- 601-850: Most real builders, enthusiasts, and community members go here. It's very easy to reach this. (Window Seat)
- 851-1000: High-signal legends, hackathon winners, and active ETH builders. (Engine Seat)

WEIGHTED BREAKDOWN (0-1000 Total):
- Technical Signal (300 pts): Mentions of Solidity, ZK, Github, L2s, or shipping code.
- Community Vibe (400 pts): (EASY POINTS) Mentions of ETHMumbai, Devfolio, hackathons, or general Web3 excitement.
- Signal-to-Noise (200 pts): Reward original thoughts over retweets. Only deduct for massive spam.
- Mumbai Connection (100 pts): Mumbai roots, Vada Pav affinity, or local slang usage.

IMPORTANT: Your response must be a single RAW JSON object.
JSON structure: 
{ 
  "score": number, 
  "breakdown": {
    "technical": number,
    "vibe": number,
    "signal": number,
    "mumbai": number
  },
  "category": "Buidler" | "Community OG" | "Lurker" | "Airdrop Hunter" | "Bot",
  "seat": "Engine Seat" (850+) | "Window Seat" (600-849) | "Aisle Seat" (350-599) | "Footboard" (<350),
  "route": "string", 
  "remark": "Savage but kind Mumbaiya Hinglish roast based on their specific tweets. Use slang like 'Khali peeli', 'Boss', 'Dhingana', 'Public'.", 
  "status": "MAXI" | "MID" | "CHUTTA NAHI HAI"
}`;

async function fetchRealProfile(username: string) {
    const apiKey = process.env.X_SCRAPER_API_KEY;

    // 1. Fetch User Profile
    const profileRes = await fetch(`https://api.socialdata.tools/twitter/user/${username}`, {
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Accept': 'application/json' }
    });

    if (!profileRes.ok) throw new Error(`User not found: ${profileRes.statusText}`);
    const profileData = await profileRes.json();

    // 2. Fetch User Tweets
    const tweetsRes = await fetch(`https://api.socialdata.tools/twitter/user/${username}/tweets`, {
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Accept': 'application/json' }
    });

    let tweets = [];
    if (tweetsRes.ok) {
        const tweetsData = await tweetsRes.json();
        tweets = tweetsData.tweets?.map((t: any) => t.full_text || t.text) || [];
    }

    return {
        bio: profileData.description || "",
        followers: profileData.followers_count || 0,
        following: profileData.friends_count || 0,
        verified_type: profileData.verified_type || "none",
        tweets: tweets.slice(0, 30), // Increased to 30 for deeper analysis
        location: profileData.location || "",
        name: profileData.name || username
    };
}

export async function POST(request: Request) {
    try {
        const { username } = await request.json();
        if (!username) {
            return NextResponse.json({ error: 'Missing username' }, { status: 400 });
        }

        const profile = await fetchRealProfile(username.replace(/^@/, ''));

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.0-flash-exp',
            systemInstruction: systemPrompt,
        });

        const dossier = `
PASSENGER DOSSIER:
Name: ${profile.name}
Handle: @${username}
Bio: ${profile.bio}
Location: ${profile.location}
Verified: ${profile.verified_type}
Followers: ${profile.followers} | Following: ${profile.following}

RECENT ACTIVITY (Last 30 Tweets):
${profile.tweets.length > 0 ? profile.tweets.join('\n---\n') : "EMPTY TIMELINE"}
        `;

        const result = await model.generateContent(dossier);
        let rawResponse = await result.response.text();

        // 5️⃣ Robust JSON Extraction
        let evaluation;
        try {
            let cleanedResponse = rawResponse.trim();
            if (cleanedResponse.startsWith('```')) {
                cleanedResponse = cleanedResponse.replace(/^```[a-z]*\n?|```$/g, '').trim();
            }
            const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
            evaluation = JSON.parse(jsonMatch ? jsonMatch[0] : cleanedResponse);
        } catch (e) {
            console.error('JSON parsing failed:', rawResponse);
            return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 });
        }

        // 6️⃣ Filter and Save to Supabase (PGRST204 Fix)
        // We keep 'status' for the UI but remove it for the DB payload
        const { status, ...dataToSave } = evaluation;

        const { error: dbError } = await supabase
            .from('passengers')
            .insert([
                {
                    username: username,
                    score: dataToSave.score,
                    route: dataToSave.route,
                    seat: dataToSave.seat,
                    remark: dataToSave.remark,
                }
            ]);

        if (dbError) {
            console.error("Supabase insert error:", dbError);
        }

        // 7️⃣ Return everything (including status) to the client
        return NextResponse.json(evaluation);
    } catch (error: any) {
        console.error('API error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

