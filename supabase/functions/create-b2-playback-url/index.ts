import { createClient } from "npm:@supabase/supabase-js@2";
import { S3Client, GetObjectCommand } from "npm:@aws-sdk/client-s3@3.800.0";
import { getSignedUrl } from "npm:@aws-sdk/s3-request-presigner@3.800.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": Deno.env.get("APP_ORIGIN") || "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-api-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
  "Vary": "Origin",
};
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status, headers: { ...corsHeaders, "Content-Type": "application/json" },
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  try {
    const { videoId } = await req.json();
    if (!videoId || !/^[0-9a-f-]{36}$/i.test(String(videoId))) return json({ error: "ID video tidak valid." }, 400);
    const url = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !serviceKey) throw new Error("Supabase server environment belum dikonfigurasi.");
    // Service role is server-side only. Expose only published rows and only the fields needed for playback.
    const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data: video, error } = await admin.from("videos")
      .select("id,title,storage_key,mime_type,status")
      .eq("id", String(videoId)).eq("status", "published").maybeSingle();
    if (error) throw error;
    if (!video?.storage_key) return json({ error: "Video tidak ditemukan atau belum dipublikasikan." }, 404);
    const endpoint = Deno.env.get("B2_ENDPOINT"), region = Deno.env.get("B2_REGION"), bucket = Deno.env.get("B2_BUCKET");
    const keyId = Deno.env.get("B2_KEY_ID"), appKey = Deno.env.get("B2_APPLICATION_KEY");
    if (![endpoint, region, bucket, keyId, appKey].every(Boolean)) throw new Error("Backblaze B2 secrets belum lengkap.");
    const s3 = new S3Client({ region: region!, endpoint: endpoint!, credentials: { accessKeyId: keyId!, secretAccessKey: appKey! }, forcePathStyle: true });
    const command = new GetObjectCommand({
      Bucket: bucket!, Key: video.storage_key,
      ResponseContentType: video.mime_type || "video/mp4",
      ResponseContentDisposition: "inline",
      ResponseCacheControl: "private, max-age=60",
    });
    const playbackUrl = await getSignedUrl(s3, command, { expiresIn: 300 });
    return json({ playbackUrl, expiresIn: 300, title: video.title, mimeType: video.mime_type || "video/mp4" });
  } catch (error) {
    console.error("create-b2-playback-url:", error);
    return json({ error: error instanceof Error ? error.message : "Gagal menyiapkan pemutaran video." }, 500);
  }
});
