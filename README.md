# Photo Gallery (with accounts)

A small Next.js site where visitors create their own account, log in, view a
gallery of photos, and upload their own videos. Passwords are hashed
(bcrypt), sessions use a signed JWT in an HTTP-only cookie, and both the
`/gallery` page and the video upload/serving APIs require login.

## What's inside

- `app/signup`, `app/login` — account creation and login forms
- `app/gallery` — protected page that lists images from `public/images`
  plus any videos users have uploaded
- `app/gallery/video-upload-form.js` — the upload widget shown to logged-in users
- `app/api/auth/*` — signup / login / logout API routes
- `app/api/videos/upload` — accepts a video file + optional caption from a
  logged-in user, validates type/size, and saves it to disk
- `app/api/media/[filename]` — streams an uploaded video back out, only to
  logged-in users
- `middleware.js` — redirects signed-out users away from `/gallery`
- `lib/db.js` — plain JSON-file storage for users and videos (no native
  dependencies, so it builds anywhere without a C++ toolchain)
- `lib/auth.js` — password hashing + session token helpers
- `lib/uploads.js` — shared upload-directory path + session lookup for API routes

### Video uploads

- Accepted formats: MP4, WebM, MOV, OGG
- Max size: 200 MB per video (edit `MAX_SIZE_BYTES` in
  `app/api/videos/upload/route.js` to change this)
- Files are saved to `data/uploads/videos/` on disk (inside the same
  persistent volume your user accounts live in) with a random filename —
  never the original filename, to avoid collisions or path tricks
- Every video is visible to every logged-in user, tagged with who uploaded
  it. If you want private/per-user galleries instead, let me know and I can
  add that.
- There's no server-side video transcoding — uploaded files are served
  as-is, so very large or unusual codecs may not play smoothly in every
  browser. For a public-facing app at scale you'd eventually want a
  transcoding step (e.g. via ffmpeg or a service like Mux), but the current
  setup is fine for personal or small-group use.

## 1. Add your photos

Put your image files in `public/images/`, then list them in
`public/images/images.json`:

```json
[
  { "file": "beach.jpg", "caption": "Summer at the beach" },
  { "file": "mountains.jpg", "caption": "Weekend hike" }
]
```

Three placeholder SVGs are included so you can see it working immediately —
delete them once you add your own photos.

## 2. Run it locally

```bash
npm install
cp .env.example .env.local
# edit .env.local and set a real JWT_SECRET, e.g.:
#   openssl rand -base64 32
npm run dev
```

Visit `http://localhost:3000`, sign up for an account, and you'll land on
the gallery.

## 3. Deploy it for real users

This app stores accounts and video records in JSON files on disk
(`data/users.json`, `data/videos.json`), plus the uploaded video files
themselves in `data/uploads/videos/`. It needs a host with a **persistent
filesystem** — not a purely serverless one.

**Recommended: Railway or Render**
1. Push this project to a GitHub repo.
2. Create a new Web Service on Railway (railway.app) or Render
   (render.com) and point it at the repo.
3. Add a persistent volume mounted at `/app/data` (both platforms support
   this in their dashboard). Size it with room for uploaded videos, not
   just the small SQLite file — a few GB is a reasonable starting point,
   and you can grow it later as people upload more.
4. Set the environment variable `JWT_SECRET` to a long random string
   (`openssl rand -base64 32`).
5. Build command: `npm install && npm run build`. Start command:
   `npm run start`.

**If you'd rather use Vercel:** Vercel's serverless functions don't persist
files between requests, so the JSON data files and uploaded videos won't
reliably stick around. To deploy there, you'd want to swap `lib/db.js` for
a hosted database (e.g. a free Neon or Supabase Postgres instance) and
store uploaded videos in an object storage service (e.g. S3 or
Cloudflare R2) instead of local disk. Ask me if you'd like that version
built out.

## Notes on security

- Passwords are hashed with bcrypt before storage — never stored in plain text.
- Sessions are signed JWTs in `httpOnly`, `sameSite=lax` cookies, so they
  aren't readable by client-side JavaScript and won't be sent cross-site.
- Set `JWT_SECRET` to a real random value in production — the fallback in
  the code is only for local development.
- There's no rate limiting on login/signup yet; consider adding some
  (e.g. via your host's firewall or a package like `express-rate-limit`
  in front of the API routes) before opening this up publicly at scale.
- Accounts and video records are stored in plain JSON files rather than a
  real database, which keeps things dependency-free but isn't built for
  heavy concurrent writes. It's fine for personal use or a small group;
  for a larger public site you'd eventually want to move to a proper
  database.
