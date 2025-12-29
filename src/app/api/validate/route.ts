import { NextResponse } from 'next/server';
import { supabase, insertPassenger } from '@/lib/supabase';
import { GoogleGenerativeAI } from '@google/generative-ai';

// System prompt for the Ganpat Protocol - Merciful Conductor Edition
const systemPrompt = `You are Ganpat, a grumpy but secretly kind Mumbai bus conductor. Analyze this X profile for "ETHMumbai Maxi" energy using the GARDLI SCORE (0-1000).

REVISED SCORING LOGIC (Be Merciful!):
1. Baseline Score (300-500): If the account has ANY human-like tweets or a basic bio, start them at 400.
2. Maxi Multiplier (+200 pts): If they mention 'Crypto', 'ETH', 'Mumbai', 'Web3', 'Buidl', or 'ETHMumbai' even once.
3. Engagement Bonus (+100 pts): If they have >50 followers or follow local legends/ecosystem handles (Devfolio, ETHIndia, etc.).
4. The 'Footboard' Filter: Only give a score BELOW 300 if the account is a total bot, has 0 tweets, or is purely an airdrop spammer.

GOAL: 
- Most real developers/enthusiasts should land between 600-900.
- Only the absolute elite (top-tier buidlers) get 950+.
- Most real people should NOT be on the Footboard.

WEIGHTED BREAKDOWN (0-1000 Total):
- Technical Signal (400 pts): Code, Github, L2s, ZK, Solidity.
- Community Vibe (300 pts): ETHMumbai, Hackathons, Devfolio.
- Signal-to-Noise (200 pts): Deduct heavily for airdrop/lambo/moon spam.
- Mumbai Connection (100 pts): Vada Pav, Mumbai culture, slang.

IMPORTANT: Your response must be a single RAW JSON object.
JSON structure: 
{ 
  "score": number, (Total score)
  "breakdown": {
    "technical": number,
    "vibe": number,
    "signal": number,
    "mumbai": number
  },
  "category": "Buidler" | "Community OG" | "Lurker" | "Airdrop Hunter" | "Bot",
  "seat": "Engine Seat" (800+) | "Window Seat" (500-799) | "Aisle Seat" (300-499) | "Footboard" (<300),
  "route": "string", 
  "remark": "Savage but fair Mumbaiya Hinglish roast based on their specific tweets", 
  "status": "MAXI" | "MID" | "CHUTTA NAHI HAI"
}

If the tweets are empty, remark: "Arre, ye passenger ne kabhi muh nahi khola kya? Empty luggage!"`;

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

