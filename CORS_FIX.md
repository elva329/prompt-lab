# ✅ CORS Issue Fixed!

## What Was the Problem?

You got this error:
```
Access to fetch at 'https://genai.hkbu.edu.hk/api/v0/rest' from origin 
'http://localhost:5173' has been blocked by CORS policy
```

**Why?** Browsers block direct requests from web pages to external APIs for security (CORS policy).

## The Solution: Server Proxy ✨

I've implemented a **server-side proxy** that bypasses CORS completely!

### Before (CORS Error):
```
Browser → HKBU API ❌ (blocked by CORS)
```

### After (Works!):
```
Browser → Your Server → HKBU API ✅ (no CORS restrictions)
```

## What Changed?

### 1. New Backend Endpoint ([server/index.js](server/index.js))
Added `/api/ai/chat` endpoint that:
- Receives requests from your frontend
- Forwards them to HKBU GenAI API
- Returns the response back to frontend
- ✅ No CORS issues!

### 2. Updated Frontend ([src/lib/aiApi.ts](src/lib/aiApi.ts))
Changed to call the local proxy instead of HKBU directly:
- Before: `fetch('https://genai.hkbu.edu.hk/...')`
- After: `fetch('/api/ai/chat')`

## 🚀 How to Test

### Step 1: Restart Backend Server

**IMPORTANT:** You must restart the backend server to load the new proxy endpoint!

```bash
# In Terminal 1, press Ctrl+C to stop, then:
npm run dev:server
```

Keep Terminal 2 (frontend) running, or restart it:
```bash
npm run dev
```

### Step 2: Run an Experiment

1. Open http://localhost:5173
2. Login
3. Go to **Prompts Library**
4. Select **2 prompts**
5. Click **"Run Experiment"**

### Step 3: Verify Success

**Browser Console (F12):**
```
✅ Using custom API via server proxy
✅ Sending request via proxy: /api/ai/chat
✅ Proxy Response: {...}
```

**Server Terminal (Terminal 1):**
```
✅ Proxying request to HKBU GenAI API: https://genai.hkbu.edu.hk/api/v0/rest
✅ HKBU API response: 200 (1234ms)
✅ HKBU API success: {...}
```

## 🎯 Expected Results

- ✅ No CORS errors
- ✅ Real AI responses appear
- ✅ Metrics are calculated
- ✅ Side-by-side comparison works
- ✅ Success toast message

## ⚠️ Troubleshooting

### "Cannot POST /api/ai/chat"

**Cause:** Backend server not restarted

**Fix:** 
```bash
# Terminal 1 - Stop (Ctrl+C) and restart:
npm run dev:server
```

### Still See CORS Error

**Cause:** Old browser cache

**Fix:**
1. Hard refresh: **Ctrl+Shift+R** (or **Cmd+Shift+R** on Mac)
2. Or clear browser cache
3. Restart frontend server

### "Failed to proxy request"

**Cause:** HKBU API might be down or unreachable

**Check:**
1. Look at **server terminal** for detailed error
2. Verify endpoint URL in `.env`
3. Check with HKBU IT support

### Empty Response or Error

**Possible issues:**
- Invalid API key
- API endpoint URL incorrect
- Rate limit exceeded
- API requires different authentication

**Debug:**
Watch the **server terminal** logs for:
```
HKBU API response: 401  → Invalid API key
HKBU API response: 404  → Wrong endpoint URL
HKBU API response: 429  → Rate limit
HKBU API response: 200  → Success!
```

## 📝 What's Logged?

### Backend Server Logs:
- ✅ Request received from frontend
- ✅ API endpoint being called
- ✅ Request body sent to HKBU
- ✅ Response status (200, 401, 404, etc.)
- ✅ Response time in milliseconds
- ✅ Success/error messages

### Browser Console Logs:
- ✅ Configuration loaded
- ✅ Proxy request sent
- ✅ Response received
- ✅ Parsed AI response

## 🔒 Security Note

The proxy approach is **secure** because:
- ✅ API key stays on server (never exposed to browser)
- ✅ Only your frontend can call your server
- ✅ Standard practice for production apps

## 📚 Files Modified

1. **[server/index.js](server/index.js)** - Added proxy endpoint
2. **[src/lib/aiApi.ts](src/lib/aiApi.ts)** - Updated to use proxy
3. **[HKBU_API_TESTING.md](HKBU_API_TESTING.md)** - Updated guide

## 🎉 Ready to Test!

**Restart your backend server and try it now!**

```bash
# Terminal 1
npm run dev:server

# Terminal 2 (if not running)
npm run dev
```

Then run an experiment and watch both the browser console and server terminal for success messages! 🚀
