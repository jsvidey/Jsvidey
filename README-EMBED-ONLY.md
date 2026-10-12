# Jsvidey — Embed-only media links

The website does not upload video files. A signed-in user saves a title and an HTTPS media URL. The original file stays with its provider (YouTube, Google Drive, Videy, or another provider that supports embedding/direct playback).

## Supported link types
- YouTube video, Shorts, and `youtu.be` links (converted to privacy-enhanced YouTube embeds).
- Google Drive file links (converted to `/preview`; the Drive file must be shared with viewers).
- Videy links (embedded using the supplied URL; actual playback depends on Videy's supported embed URL and permissions).
- Vimeo links.
- Other HTTPS links: direct video files such as MP4/WebM are shown in a native video player; other URLs are attempted as iframes. Some providers block embedding or require login.

## Supabase setup
Run `sql/get_public_embed_video.sql` in the SQL Editor of project `yihtsjscgwaaxyfkdlos` (the Jsvidey project). It creates a narrowly scoped RPC that returns only published embed metadata; it does not expose storage keys. The existing `public.videos` table must already exist and have `id`, `title`, `video_url`, `status`, and `created_at`.

The upload page requires a logged-in Supabase user and inserts `user_id` from the verified current session. It saves `video_url` and sets status to `published`. Existing RLS insert policy must allow authenticated users to insert their own row and the status constraint must allow `published`.

## Existing Backblaze videos
The watch page keeps the existing secure Backblaze playback fallback for old records without an embed URL. This project does not put Backblaze secret keys in the browser.

## Important limitations
- Embedding is not a way to bypass access controls. Google Drive files need suitable sharing permissions; YouTube/Videy/other providers may disable embedding.
- Only HTTPS URLs are accepted.
- The website stores a link, not the video file. It does not guarantee that any arbitrary URL is embeddable.
