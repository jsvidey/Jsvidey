import { createClient } from "npm:@supabase/supabase-js@2";
import { S3Client, PutObjectCommand } from "npm:@aws-sdk/client-s3@3.800.0";
import { getSignedUrl } from "npm:@aws-sdk/s3-request-presigner@3.800.0";

const MAX_BYTES = 20 * 1024 * 1024;
const corsHeaders = {
  "Access-Control-Allow-Origin": Deno.env.get("APP_ORIGIN") || "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-api-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
  "Vary": "Origin",
};
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { ...corsHeaders, "Content-Type": "application/json" },
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const authorization = req.headers.get("Authorization");
    if (!authorization) return json({ error: "Login diperlukan." }, 401);

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    if (!supabaseUrl || !supabaseAnonKey) throw new Error("Supabase function environment is not configured.");
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authorization } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return json({ error: "Sesi login tidak valid. Silakan login ulang." }, 401);

    const body = await req.json();
    const fileName = String(body?.fileName || "video");
    const fileSize = Number(body?.fileSize);
    const contentType = String(body?.contentType || "application/octet-stream");
    if (!Number.isFinite(fileSize) || fileSize <= 0 || fileSize >= MAX_BYTES) {
      return json({ error: "Ukuran file harus lebih dari 0 dan di bawah 20 MB." }, 413);
    }
    if (!contentType.startsWith("video/")) return json({ error: "Hanya file video yang diperbolehkan." }, 415);

    const endpoint = Deno.env.get("B2_ENDPOINT");
    const region = Deno.env.get("B2_REGION");
    const bucket = Deno.env.get("B2_BUCKET");
    const keyId = Deno.env.get("B2_KEY_ID");
    const applicationKey = Deno.env.get("B2_APPLICATION_KEY");
    if (![endpoint, region, bucket, keyId, applicationKey].every(Boolean)) {
      throw new Error("Backblaze B2 secrets belum lengkap. Set B2_ENDPOINT, B2_REGION, B2_BUCKET, B2_KEY_ID, dan B2_APPLICATION_KEY.");
    }

    const safeName = fileName.normalize("NFKD").replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "").slice(-100) || "video";
    const storageKey = `${user.id}/${crypto.randomUUID()}-${safeName}`;
    const s3 = new S3Client({
      region: region!,
      endpoint: endpoint!,
      credentials: { accessKeyId: keyId!, secretAccessKey: applicationKey! },
      forcePathStyle: true,
    });
    const command = new PutObjectCommand({ Bucket: bucket!, Key: storageKey, ContentType: contentType });
    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 });
    return json({ uploadUrl, storageKey, expiresIn: 300 });
  } catch (error) {
    console.error("create-b2-upload-url:", error);
    return json({ error: error instanceof Error ? error.message : "Kesalahan server saat menyiapkan upload." }, 500);
  }
});
