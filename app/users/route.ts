import { NextResponse } from "next/server";


export const GET = async (req: Request) => {
    // const body = await req.json();

    try {

        return NextResponse.json({ ok: true, from: "from api" });

    } catch (error) {
        return NextResponse.json({ ok: false, error: (error as any)?.message });
    }
}