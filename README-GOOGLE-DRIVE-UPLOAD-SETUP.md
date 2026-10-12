# Jsvidey Google Drive upload — setup and safety notes

This package adds a Cloudflare Pages Function at `POST /api/google/upload`.
It accepts multipart form fields `title` and `video`, uploads the video to the authenticated Google Drive using a refresh token, then inserts metadata into Supabase.

## Required Cloudflare Production secrets
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REFRESH_TOKEN` — **not the Client Secret**; an offline OAuth refresh token for the Google account that owns the Drive files
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` — server-only; NEVER put this in browser JS
Optional variables:
- `GOOGLE_DRIVE_FOLDER_ID` — destination folder ID
- `MAX_UPLOAD_BYTES` — default 104857600 (100 MiB)

## Important before deployment
1. Deploy this package to Cloudflare Pages with Functions support.
2. The Google OAuth consent flow still needs to be completed to obtain `GOOGLE_REFRESH_TOKEN`; merely creating an OAuth Client does not authorize Drive access.
3. Confirm the Supabase `videos` table has columns `title`, `drive_file_id`, `video_url`, `status`, `storage_provider` and that the service-role insert fits the table's other required columns. If your schema differs, adapt the `record` object in `functions/api/google/upload.js` before enabling uploads.
4. The endpoint intentionally leaves videos `pending` and does not publish files publicly automatically.
5. This endpoint currently limits upload size to 100 MiB by default and uses multipart upload. For larger files, implement Google Drive resumable upload and streaming request handling before raising the limit.
6. Add authentication/authorization and rate limiting to this endpoint before public production use. As written, it must not be exposed to anonymous users on a public site because anyone could consume Drive quota. Restrict it to trusted/admin users before deployment.
7. This upload endpoint does not yet implement playback streaming. A Drive `view` URL is metadata only; a custom player needs a protected streaming endpoint that supports HTTP Range or a media host with direct streaming support. Do not claim that this alone removes the Drive iframe UI.

## Browser integration
The upload form should send a `FormData` body to `/api/google/upload` with fields `title` and `video`. Do not set the `Content-Type` header manually; the browser must set the multipart boundary.
