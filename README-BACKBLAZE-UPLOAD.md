# Jsvidey — Direct upload to Backblaze B2 (under 20 MB)

The Upload Video page now has drag-and-drop selection, a strict client/server file-size check (< 20 MiB), live XHR upload progress, and a Supabase Edge Function that creates a short-lived presigned Backblaze B2 S3 upload URL. B2 credentials stay on the server, not in browser JavaScript.

## 1. Database migration

In Supabase SQL Editor, run `sql/jsvidey_backblaze_upload.sql` after the existing `sql/jsvidey_dashboard.sql`.

## 2. Deploy the Edge Function

From the repository root (`Jsvidey-main`), install/use the Supabase CLI and link the project:

```bash
supabase login
supabase link --project-ref yihtsjscgwaaxyfkdlos
supabase functions deploy create-b2-upload-url
```

The function uses the caller's Authorization header to verify the signed-in user. Do not disable JWT verification for this function.

## 3. Set server-side secrets

Find the S3-compatible endpoint and region in the Backblaze B2 bucket details. Create an application key scoped to the intended bucket with permission to upload files. Then set:

```bash
supabase secrets set \
  B2_ENDPOINT=https://s3.<your-region>.backblazeb2.com \
  B2_REGION=<your-region> \
  B2_BUCKET=<your-bucket-name> \
  B2_KEY_ID=<your-application-key-id> \
  B2_APPLICATION_KEY=<your-application-key-secret> \
  B2_PUBLIC_BASE_URL=https://f000.backblazeb2.com/file/<your-public-bucket-name> \
  APP_ORIGIN=https://<your-site-domain>
```

Replace every placeholder with the actual values. The public URL example is only a format example; use the download URL format shown by your B2 account. If the bucket is private, this public URL pattern will not work: a separate authenticated download-signing endpoint is needed. Never put B2 application keys in `js/upload.js`, HTML, or a public repository.

## 4. Configure B2 bucket CORS

The bucket must allow browser `PUT` requests from your deployed website origin and allow the `Content-Type` request header. Example policy (replace the origin):

```json
[
  {
    "corsRuleName": "jsvidey-browser-upload",
    "allowedOrigins": ["https://<your-site-domain>"],
    "allowedOperations": ["s3_put"],
    "allowedHeaders": ["content-type", "x-amz-*"],
    "exposeHeaders": ["ETag"],
    "maxAgeSeconds": 3600
  }
]
```

Use the CORS policy format supported by your B2 bucket configuration UI/API. For local testing, add your local development origin temporarily and remove it after testing.

## 5. How it works

1. A signed-in creator selects or drops a video.
2. Browser and Edge Function reject files that are 20 MiB or larger.
3. The Edge Function verifies the Supabase user and returns a presigned PUT URL valid for five minutes.
4. Browser uploads the bytes directly to B2 and updates the progress bar from real upload progress events.
5. After B2 returns success, the browser inserts the video metadata into `public.videos` under the existing row-level security policy.

## Important production notes

- The Backblaze upload and Supabase metadata insert are two separate operations. If B2 succeeds but the database insert fails, the page reports that explicitly; remove the orphan object manually or add a trusted cleanup workflow.
- This uses a public playback URL base. For private buckets, implement signed download URLs before publishing playback links.
- The file-size limit is 20 MiB (20 × 1024 × 1024 bytes), strictly less than 20 MiB.
- This does not transcode, scan, or moderate videos. Add server-side processing and abuse controls before accepting public uploads at scale.
- Keep B2 application keys server-side and scope them to the one upload bucket whenever possible.
