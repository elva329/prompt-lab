# Quick Start Guide - Real AI Integration  

## ✅ What We've Done

Your Prompt Lab now has **REAL AI integration**! The system can:
- ✅ Send prompts to OpenAI GPT or custom API endpoints
- ✅ Automatically evaluate response quality with 4 metrics
- ✅ Display side-by-side comparisons with detailed scores
- ✅ Track token usage and response times

## 🚀 How to Use (3 Steps)

### **Step 1: Configure Your API Key**

You need a real OpenAI API key. Update your `.env` file:

**Option A: Using OpenAI (Recommended)**
```bash
# Get your key from: https://platform.openai.com/api-keys
VITE_OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx
```

**Option B: Using Custom API** 
```bash
# If using a custom OpenAI-compatible API
VITE_CUSTOM_API_KEY=your-api-key-here
VITE_CUSTOM_API_URL=https://your-endpoint.com/v1/chat/completions
```

> ⚠️ **Important**: The key `18784fdc-a087-4f22-be5e-726982423bfc` in your .env doesn't look like an OpenAI key. OpenAI keys start with `sk-`. If this is a custom API, set `VITE_CUSTOM_API_URL` as well.

### **Step 2: Start the Servers**

Open 2 terminals:

**Terminal 1 - Backend Server:**
```bash
npm run dev:server
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

### **Step 3: Run Your First Experiment**

1. **Open the app**: http://localhost:5173
2. **Login** with your account
3. **Go to Prompts Library**
4. **Select 2-3 prompts** to compare
5. **Click "Run Experiment"**
6. **Wait 10-30 seconds** (real AI calls take time!)
7. **Review results** side-by-side

## 📊 What You'll See

For each prompt, the system displays:

### **Response**
- The actual AI-generated text

### **Quality Metrics (0-100 scale)**
- **Overall Quality**: Combined score
- **Clarity**: Readability and structure
- **Relevance**: How well it matches the prompt
- **Coherence**: Logical flow and consistency
- **Completeness**: Thoroughness of response

### **Performance Metrics**
- **Response Time**: Speed in milliseconds
- **Tokens Used**: API cost indicator

### **Manual Review**
- Check whether the response is usable as-is
- Note how much editing is needed

## 💡 Example Experiment

Try this quick test:

**Prompt A (Vague):**
```
Write a product description
```

**Prompt B (Specific):**
```
Write a 100-word product description for wireless noise-canceling 
headphones, highlighting battery life (30 hours), comfort, and 
premium sound quality. Target audience: remote workers.
```

**Expected Result**: Prompt B should score significantly higher on:
- Relevance (70+ vs 40-50)
- Completeness (80+ vs 50-60)
- Overall Quality (75+ vs 55-65)

## 🔧 How It Works

### **Architecture**

```
User clicks "Run Experiment"
    ↓
ExperimentRunnerPage.vue
    ↓
For each prompt:
    ↓
    sendPromptToAI() → OpenAI API
    ↓
    evaluateResponse() → Calculate metrics
    ↓
    Display results with scores
```

### **Key Files**

1. **[src/lib/aiApi.ts](src/lib/aiApi.ts)**
   - Handles API calls to OpenAI/Anthropic/Custom
   - Manages rate limiting
   - Error handling

2. **[src/lib/evaluationMetrics.ts](src/lib/evaluationMetrics.ts)**
   - Calculates quality scores
   - Analyzes text structure
   - Compares prompts

3. **[src/pages/ExperimentRunnerPage.vue](src/pages/ExperimentRunnerPage.vue)**
   - UI for running experiments
   - Real-time progress tracking
   - Side-by-side comparison view

## 🎯 Best Practices

### **When Creating Prompts**
1. **Be Specific**: Include constraints, tone, length
2. **Define Audience**: Who is this for?
3. **Set Format**: Bullets, paragraphs, etc.
4. **Add Context**: Background information

### **When Running Experiments**
1. **Test One Variable**: Change only one thing at a time
2. **Run Multiple Times**: AI has randomness
3. **Review Manually**: Don't just trust scores
4. **Document Findings**: Save what works

### **When Evaluating Results**
1. **Read Responses**: Scores aren't everything
2. **Consider Context**: What's your actual goal?
3. **Rate Manually**: Give your 1-5 star rating
4. **Compare Metrics**: Which scores matter most to you?

## ⚠️ Troubleshooting

### **"AI API not configured" Error**
**Solution**: Add `VITE_OPENAI_API_KEY` to `.env` file and restart servers

### **"Failed to get AI response" Error**
**Causes**:
- Invalid API key
- No internet connection
- API rate limit exceeded
- Insufficient API credits

**Solution**: 
1. Check API key is correct
2. Verify you have API credits at https://platform.openai.com/usage
3. Check console for detailed error message

### **Responses Look Generic/Poor**
**Causes**:
- Prompts are too vague
- Using a weak model (like gpt-3.5-turbo)

**Solutions**:
1. Make prompts more specific
2. Upgrade to GPT-4 (edit `aiApi.ts`, change model to `gpt-4`)

### **Experiment Takes Too Long**
**Normal**: 10-30 seconds for 2-3 prompts
**Too Long**: > 60 seconds

**Solutions**:
1. Check internet speed
2. Reduce `maxTokens` in `aiApi.ts` (default: 1000)
3. Use faster model like `gpt-3.5-turbo`

## 💰 Cost Considerations

### **OpenAI Pricing (as of 2026)**
- GPT-3.5-Turbo: ~$0.001 per 1000 tokens
- GPT-4: ~$0.03 per 1000 tokens

### **Typical Experiment Costs**
- 3 prompts × 1000 tokens each = ~$0.003 (GPT-3.5)
- 3 prompts × 1000 tokens each = ~$0.09 (GPT-4)

**Tip**: Start with GPT-3.5 for testing, use GPT-4 for final comparisons

## 📚 Next Steps

1. **Read the Guides**:
   - [RUNNING_EXPERIMENTS.md](RUNNING_EXPERIMENTS.md) - Comprehensive methodology
   - [EXPERIMENT_GUIDE.md](EXPERIMENT_GUIDE.md) - Detailed practices
   - [EXPERIMENT_CHECKLIST.md](EXPERIMENT_CHECKLIST.md) - Step-by-step checklist

2. **Try Different Models**:
   Edit [src/lib/aiApi.ts](src/lib/aiApi.ts) line ~176:
   ```typescript
   model: 'gpt-4', // or 'gpt-3.5-turbo', 'gpt-4-turbo'
   ```

3. **Customize Evaluation**:
   Modify [src/lib/evaluationMetrics.ts](src/lib/evaluationMetrics.ts) to add your own metrics

4. **Add More Features**:
   - Export results to CSV
   - Compare across models
   - A/B testing with statistical significance
   - Automated rating suggestions

## 🎉 You're Ready!

Your Prompt Lab is now a **professional prompt testing platform**!

Start experimenting and discover which prompts work best for your use case.

---

**Questions?** Check the detailed guides in the project root or review the code comments.
