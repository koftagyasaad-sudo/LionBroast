import { NextRequest, NextResponse } from "next/server";
import { getPassData } from "@/db/queries";

export async function GET(
  _request: NextRequest,
  props: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await props.params;
    if (!code) {
      return NextResponse.json({ error: "Customer pass code required" }, { status: 400 });
    }

    const passData = await getPassData(code);
    if (!passData) {
      return NextResponse.json({ error: "Customer pass not found" }, { status: 404 });
    }

    return NextResponse.json(passData);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
