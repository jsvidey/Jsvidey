import { createClient } from "npm:@supabase/supabase-js@2";
import { S3Client, GetObjectCommand } from "npm:@aws-sdk/client-s3@3.800.0";
import { getSignedUrl } from "npm:@aws-sdk/s3-request-presigner@3.800.0";
const corsHeaders = { "Access-Control-Allow-Origin": Deno.env.get("APP_ORIGIN") || "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type", "Access-Control-Allow-Methods": "POST, OPTIONS", "Vary": "Origin" };
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  try {
    const authorization = req.headers.get("Authorization");
    if (!authorization) return json({ error: "Login diperlukan untuk mengunduh video." }, 401);
    const url = Deno.env.get("SUPABASE_URL"), anonKey = Deno.env.get("SUPABASE_ANON_KEY"), serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !anonKey || !serviceKey) throw new Error("Konfigurasi Supabase server belum lengkap.");
    const authClient = createClient(url, anonKey, { global: { headers: { Authorization: authorization } }, auth: { persistSession: false, autoRefreshToken: false } });
    const { data: { user }, error: authError } = await authClient.auth.getUser();
    if (authError || !user) return json({ error: "Sesi login tidak valid. Silakan login terlebih dahulu." }, 401);
    const body = await req.json(); const videoId = String(body?.videoId || "");
    if (!/^[0-9a-f-]{36}$/i.test(videoId)) return json({ error: "ID video tidak valid." }, 400);
    const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data: video, error } = await admin.from("videos").select("id,title,storage_key,mime_type,status").eq("id", videoId).eq("status", "published").maybeSingle();
    if (error) throw error;
    if (!video?.storage_key) return json({ error: "Video tidak ditemukan atau belum dipublikasikan." }, 404);
    const endpoint = Deno.env.get("B2_ENDPOINT"), region = Deno.env.get("B2_REGION"), bucket = Deno.env.get("B2_BUCKET"), keyId = Deno.env.get("B2_KEY_ID"), appKey = Deno.env.get("B2_APPLICATION_KEY");
    if (![endpoint, region, bucket, keyId, appKey].every(Boolean)) throw new Error("Backblaze B2 secrets belum lengkap.");
    const s3 = new S3Client({ region: region!, endpoint: endpoint!, credentials: { accessKeyId: keyId!, secretAccessKey: appKey! }, forcePathStyle: true });
    const safeName = (video.title || "jsvidey-video").replace(/[^\p{L}\p{N}._ -]/gu, "").slice(0, 100) || "jsvidey-video";
    const command = new GetObjectCommand({ Bucket: bucket!, Key: video.storage_key, ResponseContentType: video.mime_type || "video/mp4", ResponseContentDisposition: `attachment; filename="${safeName}.mp4"` });
    const downloadUrl = await getSignedUrl(s3, command, { expiresIn: 300 });
    return json({ downloadUrl, expiresIn: 300 });
  } catch (error) { console.error("create-b2-download-url:", error); return json({ error: error instanceof Error ? error.message : "Gagal membuat link download." }, 500); }
});
