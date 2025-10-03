import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const requiredVars = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "STRIPE_SECRET_KEY",
    "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
    "STRIPE_SIGNING_SECRET",
    "NEXT_PUBLIC_SITE_URL",
  ];

  const results: Record<string, string> = {};
  for (const key of requiredVars) {
    if (process.env[key]) {
      results[key] = "✅ Set";
    } else {
      results[key] = "❌ Missing";
    }
  }

  return NextResponse.json({
    status: "ok",
    env: results,
  });
}
