# HKBU GenAI API - Testing Guide

## ✅ Configuration Complete!

Your Prompt Lab is now configured to use the **HKBU GenAI API**:
- **API Key**: `18784fdc-a087-4f22-be5e-726982423bfc`
- **Endpoint**: `https://genai.hkbu.edu.hk/api/v0/rest`
- **CORS Solution**: ✅ Server proxy implemented (no CORS issues!)

## 🔧 How It Works

**Architecture:**
```
Browser → Local Server (proxy) → HKBU GenAI API
```

This bypasses CORS restrictions because:
- Browser calls your local server at `/api/ai/chat`
- Your server forwards the request to HKBU API
- Server-to-server requests have no CORS restrictions
- Response comes back through the same path

## � Complete Request Flow

Here's the detailed flow when you run an experiment:

### 1. Configuration Loading (`src/lib/aiApi.ts`)

**Function: `getDefaultConfig()`**
- Reads environment variables from `.env`
- Detects `VITE_CUSTOM_API_KEY` and `VITE_CUSTOM_BASE_URL`
- Returns configuration with `provider: 'custom'`

```javascript
// Console output:
Loading API configuration...
Custom API configured: true
Using custom API via server proxy
Model: gpt-5-mini
```

### 2. Request Routing (`src/lib/aiApi.ts`)

**Function: `sendPromptToAI(config)`**
- Checks `config.provider` value
- Since `provider === 'custom'`, calls `callCustomAPI()`
- **NOT** calling `callAnthropic()` (only exists for alternative provider support)

```javascript
if (config.provider === 'openai') {
  return callOpenAI(config)
} else if (config.provider === 'anthropic') {
  return callAnthropic(config)  // NOT USED (hardcoded Anthropic URL exists but not called)
} else if (config.provider === 'custom') {
  return callCustomAPI(config)  // THIS PATH IS USED ✅
}
```

### 3. Local Proxy Call (`src/lib/aiApi.ts`)

**Function: `callCustomAPI(promptText, config)`**
- Sends request to `/api/ai/chat` (local proxy endpoint)
- Uses `fetch('/api/ai/chat')` - **NOT** direct HKBU URL
- Includes message content and configuration

```javascript
const proxyUrl = '/api/ai/chat';  // Local proxy, not external URL
const response = await fetch(proxyUrl, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model: config.model,
    messages: [{ role: 'user', content: promptText }],
    temperature: config.temperature,
    max_tokens: config.maxTokens
  })
});
```

**Console output:**
```
Sending request via proxy: /api/ai/chat
Request body: {model: "gpt-5-mini", messages: [...]}
```

### 4. Server Proxy Forwarding (`server/index.js`)

**Endpoint: `POST /api/ai/chat`**
- Receives request from frontend
- Constructs Azure OpenAI-style URL:
  ```
  https://genai.hkbu.edu.hk/api/v0/rest/deployments/gpt-5-mini/chat/completions?api-version=2024-12-01-preview
  ```
- Removes `temperature` parameter (HKBU only supports default)
- Adds `api-key` header with your API key
- Forwards request to HKBU GenAI API

```javascript
// Construct URL
const apiUrl = `${baseUrl}/deployments/${deploymentModel}/chat/completions?api-version=${apiVersion}`;

// Forward request
const response = await fetch(apiUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'api-key': apiKey  // HKBU uses api-key header, not Authorization Bearer
  },
  body: JSON.stringify(requestBody)
});
```

**Server console output:**
```
Proxying request to HKBU GenAI API: https://genai.hkbu.edu.hk/api/v0/rest/deployments/gpt-5-mini/chat/completions?api-version=2024-12-01-preview
HKBU API response: 200 (1234ms)
HKBU API success: {...}
```

### 5. Response Flow Back

**HKBU API → Server → Browser → Frontend**
- HKBU returns OpenAI-compatible response
- Server forwards response as-is
- Frontend parses `data.choices[0].message.content`
- Metrics are calculated via `evaluateResponse()`
- Results displayed in UI

### Flow Summary

```
┌─────────────────────────────────────────────────────────────────┐
│ USER ACTION: Click "Run Experiment"                              │
└────────────┬────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 1: getDefaultConfig()                                       │
│ → Returns provider='custom'                                      │
│ → Located in: src/lib/aiApi.ts                                   │
└────────────┬────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 2: sendPromptToAI(config)                                   │
│ → Checks config.provider === 'custom'                            │
│ → Calls callCustomAPI()                                          │
│ → Located in: src/lib/aiApi.ts                                   │
└────────────┬────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 3: callCustomAPI(promptText, config)                        │
│ → fetch('/api/ai/chat')                                          │
│ → Sends to LOCAL proxy, not HKBU directly                        │
│ → Located in: src/lib/aiApi.ts                                   │
└────────────┬────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 4: Server Proxy /api/ai/chat                                │
│ → Constructs HKBU URL with Azure format                          │
│ → URL: https://genai.hkbu.edu.hk/api/v0/rest/                   │
│        deployments/gpt-5-mini/chat/completions                   │
│        ?api-version=2024-12-01-preview                           │
│ → Adds 'api-key' header                                          │
│ → Removes temperature parameter                                  │
│ → Located in: server/index.js                                    │
└────────────┬────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 5: HKBU GenAI API                                           │
│ → Processes request with gpt-5-mini model                        │
│ → Returns OpenAI-compatible JSON response                        │
└────────────┬────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 6: Response Journey Back                                    │
│ → HKBU API → Server Proxy → Frontend                             │
│ → Parse: data.choices[0].message.content                         │
│ → Calculate metrics via evaluateResponse()                       │
│ → Display results in UI                                          │
└─────────────────────────────────────────────────────────────────┘
```

### Key Points

✅ **Provider Selection**: `getDefaultConfig()` prioritizes custom API when HKBU credentials are set
✅ **No Direct Calls**: Frontend never calls HKBU directly (uses proxy to avoid CORS)
✅ **callAnthropic() Not Used**: Exists for alternative provider but not invoked with current config
✅ **Azure URL Format**: Server constructs `/deployments/{model}/chat/completions?api-version={version}`
✅ **Authentication**: Uses `api-key` header (not `Authorization: Bearer`)
✅ **Temperature Removed**: HKBU only accepts default temperature value

## �🚀 Quick Test (5 Minutes)

### Step 1: Start the Servers

Open **2 terminals**:

**Terminal 1 - Backend:**
```bash
npm run dev:server
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

### Step 2: Run a Simple Test

1. Open http://localhost:5173
2. **Login** to your account
3. Go to **Prompts Library**
4. **Select 2 prompts** (any two)
5. Click **"Run Experiment"**
6. Watch the console for API logs

### Step 3: Check Browser Console

Press **F12** or **Cmd+Option+I** to open Developer Tools.

You should see logs like:
```
Loading API configuration...
Custom API configured: true
Using custom API via server proxy
Sending request via proxy: /api/ai/chat
Request body: {model: "gpt-3.5-turbo", messages: [...], ...}
Proxy Response: {...}
```

**Server console** should show:
```
Proxying request to HKBU GenAI API: https://genai.hkbu.edu.hk/api/v0/rest
HKBU API response: 200 (1234ms)
HKBU API success: {...}
```

## 🔍 What to Expect

### ✅ Success Scenario
- You'll see: "Experiment completed! Processed X prompt(s)"
- Responses appear in side-by-side view
- Metrics are calculated and displayed
- Toast notification shows success
- **No CORS errors!** ✨

### ❌ Common Issues

#### Issue 1: CORS Error (FIXED!)
~~**Symptom**: Console shows "CORS policy blocked"~~

**Status**: ✅ **SOLVED!** We're now using a server proxy, so CORS is not an issue anymore.

#### Issue 2: Server Not Running
**Symptom**: "Failed to fetch" or "Network error"

**Solution**: Make sure **BOTH** servers are running:
```bash
# Terminal 1
npm run dev:server

# Terminal 2
npm run dev
```

#### Issue 3: 401 Unauthorized
**Symptom**: "API returned 401"

**Possible causes**:
- API key is invalid or expired
- API key format is incorrect
- Need to register your IP address

**Solution**: Verify your API key with HKBU IT support.

#### Issue 3: 401 Unauthorized
**Symptom**: "API returned 401"

**Possible causes**:
- API key is invalid or expired
- API key format is incorrect
- Need to register your IP address

**Solution**: Verify your API key with HKBU IT support.

#### Issue 4: 404 Not Found
**Symptom**: "API returned 404"

**Possible causes**:
- Endpoint URL might be incorrect
- Missing path parameters

**Solution**: Check with HKBU IT for the correct endpoint. Update in `.env`:
```bash
VITE_CUSTOM_API_URL=<correct-endpoint-url>
```

Then restart the **backend server** (Terminal 1).

#### Issue 5: Different Response Format
**Symptom**: "Could not find response content in API response"

**Reason**: HKBU API might return data in a different format than OpenAI.

**What we handle**:
- `data.choices[0].message.content` (OpenAI format)
- `data.text`
- `data.content`
- `data.response`

**Solution**: Check the console log showing "API Response:", note the format, and let me know. I can adjust the response parser.

## 🧪 Test Prompts

Try these simple prompts for your first test:

### Prompt 1: Simple
```
Write a haiku about programming
```

### Prompt 2: Detailed
```
Write a haiku about programming. Make it funny and relatable for computer science students.
```

**Expected Result**: Prompt 2 should have higher relevance and completeness scores.

## 📊 Debugging Tips

### Check Both Console Logs

**Browser Console (F12):**
- Shows frontend logs
- API configuration
- Request/response from proxy

**Server Terminal (Terminal 1):**
- Shows backend logs
- Actual API calls to HKBU
- Detailed error messages
- Response status codes

Watch for logs like:
```
Proxying request to HKBU GenAI API: https://genai.hkbu.edu.hk/api/v0/rest
Request body: {"model":"gpt-3.5-turbo",...}
HKBU API response: 200 (1234ms)
HKBU API success: {...}
```

### Enable Verbose Logging

The system already logs to console. Watch for:

1. **Configuration loading**:
   ```
   Loading API configuration...
   Using custom API endpoint: ...
   ```

2. **Request details**:
   ```
   Sending request to: ...
   Request body: {...}
   ```

3. **Response received**:
   ```
   API Response: {...}
   ```

4. **Errors**:
   ```
   API Error Response: ...
   ```

### Check Network Tab

In Browser DevTools (F12):
1. Go to **Network** tab
2. Run experiment
3. Look for request to `genai.hkbu.edu.hk`
4. Click on it to see:
   - **Headers**: Check Authorization header
   - **Payload**: See request body
   - **Response**: See what API returned

## 🔧 Advanced Configuration

### Change Model

Edit [src/lib/aiApi.ts](src/lib/aiApi.ts) line ~233:

```typescript
model: 'gpt-4', // or 'gpt-3.5-turbo', 'claude-3', etc.
```

**Note**: Make sure the HKBU API supports the model you specify!

### Adjust Temperature (Creativity)

Edit [src/lib/aiApi.ts](src/lib/aiApi.ts) line ~234:

```typescript
temperature: 0.7, // 0.0 = deterministic, 1.0 = creative
```

**Recommendations**:
- **0.0-0.3**: Factual tasks, documentation
- **0.4-0.7**: Balanced (default)
- **0.8-1.0**: Creative writing

### Increase Max Tokens (Response Length)

Edit [src/lib/aiApi.ts](src/lib/aiApi.ts) line ~235:

```typescript
maxTokens: 2000, // was 1000
```

**Note**: Longer responses = more cost/time!

## 🆘 Still Having Issues?

### Get Detailed Error Info

1. Open browser console (F12)
2. Run experiment
3. Copy the **entire error message**
4. Note the request/response logs
5. Share these details for help

### Contact HKBU Support

If you get authentication or permission errors, contact:
- HKBU IT Services
- GenAI API administrator
- Your course instructor

They can verify:
- ✅ API key is active
- ✅ Your IP is whitelisted  
- ✅ Endpoint URL is correct
- ✅ Quota/rate limits

## 📈 API Documentation

Ask HKBU IT for:
- Official API documentation
- Supported models
- Rate limits
- Request/response format examples
- Authentication requirements

## ✅ Success Checklist

After first successful test:
- [ ] Experiment runs without errors
- [ ] AI responses appear (not mock data)
- [ ] Metrics are calculated
- [ ] Can compare 2+ prompts side-by-side
- [ ] Results are saved to database
- [ ] Can view past experiments

## 🎯 Next Steps

Once working:
1. Try the example experiments in [RUNNING_EXPERIMENTS.md](RUNNING_EXPERIMENTS.md)
2. Test with real prompts for your project
3. Compare different prompt strategies
4. Document which prompts work best

---

**Ready to test!** 🚀

Run the servers and try your first experiment. Check the browser console for detailed logs.
