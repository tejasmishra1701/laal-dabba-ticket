import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function insertPassenger(data: {
    username: string;
    score: number;
    seat: string;
    route: string;
    remark: string;
    status: string;
}) {
    const { error } = await supabase.from("passengers").insert([data]);
    if (error) {
        console.error("Supabase insert error:", error);
        throw error;
    }
}
