# Prompt Quality Metrics - Complete Explanation

## 📊 Overview

When you run an experiment, the system automatically evaluates each AI response using **6 key metrics**:

| Metric | Type | Range | Source |
|--------|------|-------|--------|
| **Overall Quality** | Automated | 0-100 | Average of 4 quality metrics |
| **Response Time** | Performance | milliseconds | API call duration |
| **Clarity** | Quality | 0-100 | Text readability analysis |
| **Relevance** | Quality | 0-100 | Prompt-response matching |
| **Coherence** | Quality | 0-100 | Logical flow analysis |
| **Completeness** | Quality | 0-100 | Thoroughness check |

---

## 🔄 Calculation Flow

### **Step 1: Get AI Response** 
[`src/lib/aiApi.ts`](src/lib/aiApi.ts) → `sendPromptToAI()`

```javascript
const startTime = performance.now();

// Send prompt to API (via proxy)
const response = await fetch('/api/ai/chat', {
  method: 'POST',
  body: JSON.stringify({
    messages: [{ role: 'user', content: promptText }],
    max_tokens: 1000
  })
});

const data = await response.json();
const endTime = performance.now();

return {
  response: data.choices[0].message.content,
  responseTimeMs: Math.round(endTime - startTime),  // ⏱️ Response Time captured here
  tokensUsed: data.usage?.total_tokens || 0,
  model: 'gpt-5-mini'
};
```

**Metric Captured:** ⏱️ **Response Time**

---

### **Step 2: Evaluate Response Quality**
[`src/lib/evaluationMetrics.ts`](src/lib/evaluationMetrics.ts) → `evaluateResponse()`

```javascript
export function evaluateResponse(
  promptText: string,
  response: string,
  responseTimeMs: number,
  tokensUsed: number
): EvaluationCriteria {
  
  // Calculate 4 quality metrics
  const clarity = calculateClarity(response);           // 📖 Clarity
  const relevance = calculateRelevance(promptText, response);  // 🎯 Relevance
  const coherence = calculateCoherence(response);        // 🔗 Coherence
  const completeness = calculateCompleteness(response);  // ✅ Completeness
  
  // Overall Quality = Average of all 4
  const automatedScore = Math.round(
    (clarity + relevance + coherence + completeness) / 4
  );
  
  return {
    responseLength: response.length,
    responseTimeMs,      // ⏱️ From Step 1
    tokensUsed,         // 🪙 From Step 1
    clarity,            // 📖 Calculated
    relevance,          // 🎯 Calculated
    coherence,          // 🔗 Calculated
    completeness,       // ✅ Calculated
    automatedScore      // ⭐ Overall Quality
  };
}
```

**Metrics Calculated:** 📖 Clarity, 🎯 Relevance, 🔗 Coherence, ✅ Completeness, ⭐ Overall Quality

---

### **Step 3: Store & Display Results**
[`src/pages/ExperimentRunnerPage.vue`](src/pages/ExperimentRunnerPage.vue) → `handleRun()`

```javascript
// For each prompt:
const aiResponse = await sendPromptToAI(prompt.content, aiConfig);  // Step 1

const evaluation = evaluateResponse(                                 // Step 2
  prompt.content,
  aiResponse.response,
  aiResponse.responseTimeMs,
  aiResponse.tokensUsed
);

// Store all metrics
generatedResults[prompt.promptId] = {
  aiResponse: aiResponse.response,
  aiScore: evaluation.automatedScore,         // ⭐ Overall Quality
  responseTimeMs: evaluation.responseTimeMs,  // ⏱️ Response Time
  clarity: evaluation.clarity,                // 📖 Clarity
  relevance: evaluation.relevance,            // 🎯 Relevance
  coherence: evaluation.coherence,            // 🔗 Coherence
  completeness: evaluation.completeness,      // ✅ Completeness
  tokensUsed: evaluation.tokensUsed          // 🪙 Token Usage
};
```

---

## 🧮 Detailed Metric Calculations

### 1. ⏱️ **Response Time**

**Source:** JavaScript `performance.now()` API  
**Unit:** Milliseconds (ms)  
**Calculation:**

```javascript
const startTime = performance.now();
// ... API call ...
const endTime = performance.now();
const responseTimeMs = Math.round(endTime - startTime);
```

**What it measures:**
- Total time from sending request to receiving complete response
- Includes network latency + API processing time
- Lower is better

**Typical Values:**
- Fast: < 1000ms (1 second)
- Normal: 1000-3000ms
- Slow: > 3000ms

---

### 2. 📖 **Clarity Score** (0-100)

**Source:** `calculateClarity()` in [`evaluationMetrics.ts`](src/lib/evaluationMetrics.ts)  
**What it measures:** Readability and sentence structure

**Algorithm:**

```javascript
export function calculateClarity(response: string): number {
  const words = response.trim().split(/\s+/);
  const sentences = response.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  if (sentences.length === 0) return 0;

  const avgWordsPerSentence = words.length / sentences.length;
  const avgCharsPerWord = response.replace(/\s/g, '').length / words.length;

  let score = 50;  // Base score
  
  // Optimal sentence length: 15-20 words
  if (avgWordsPerSentence >= 15 && avgWordsPerSentence <= 20) {
    score += 25;
  } else if (avgWordsPerSentence >= 10 && avgWordsPerSentence < 15) {
    score += 15;
  }
  
  // Optimal word length: 4-6 characters
  if (avgCharsPerWord >= 4 && avgCharsPerWord <= 6) {
    score += 25;
  } else if (avgCharsPerWord >= 3 && avgCharsPerWord < 4) {
    score += 15;
  }

  return Math.min(100, score);
}
```

**Scoring Breakdown:**
- Base: 50 points
- Sentence length (15-20 words): +25 points
- Word length (4-6 chars): +25 points
- **Total: 0-100**

**Examples:**
- **Score 90+**: Professional, clear writing with balanced sentence structure
- **Score 60-80**: Decent readability, some long/short sentences
- **Score <60**: Hard to read, very long or very short sentences

---

### 3. 🎯 **Relevance Score** (0-100)

**Source:** `calculateRelevance()` in [`evaluationMetrics.ts`](src/lib/evaluationMetrics.ts)  
**What it measures:** How well the response matches the prompt

**Algorithm:**

```javascript
export function calculateRelevance(promptText: string, response: string): number {
  // Extract keywords from prompt (words > 3 characters)
  const promptWords = promptText
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 3);

  // Get unique words in response
  const responseWords = new Set(
    response.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/)
  );

  // Count how many prompt keywords appear in response
  const matchedKeywords = promptWords.filter(
    keyword => responseWords.has(keyword)
  );
  
  const matchRatio = matchedKeywords.length / Math.max(promptWords.length, 1);

  // Base score 30, up to 70 from keyword matching
  return Math.min(100, Math.round(matchRatio * 100 + 30));
}
```

**Scoring Logic:**
- Base score: 30 points
- Keyword matching: up to 70 points
- More matched keywords = higher relevance

**Examples:**

**Prompt:** "Explain machine learning for beginners"  
**Response A** (Score: 85): Uses words like "machine", "learning", "beginners", "simple", "explain"  
**Response B** (Score: 45): Generic text about computers, missing key terms

---

### 4. 🔗 **Coherence Score** (0-100)

**Source:** `calculateCoherence()` in [`evaluationMetrics.ts`](src/lib/evaluationMetrics.ts)  
**What it measures:** Logical flow and structural consistency

**Algorithm:**

```javascript
export function calculateCoherence(response: string): number {
  let score = 50;  // Base score

  // Check for proper paragraphing
  const paragraphs = response.split('\n\n').filter(p => p.trim().length > 0);
  if (paragraphs.length >= 2 && paragraphs.length <= 5) {
    score += 20;  // Good paragraph structure
  }

  // Check for transition words
  const transitionWords = [
    'however', 'therefore', 'furthermore', 'additionally',
    'moreover', 'consequently', 'thus', 'meanwhile'
  ];
  const hasTransitions = transitionWords.some(word => 
    response.toLowerCase().includes(word)
  );
  if (hasTransitions) {
    score += 15;  // Uses connecting phrases
  }

  // Check for consistent tone (no excessive punctuation)
  const excessivePunctuation = /[!?]{3,}/.test(response);
  if (!excessivePunctuation) {
    score += 15;  // Professional tone
  }

  return Math.min(100, score);
}
```

**Scoring Breakdown:**
- Base: 50 points
- Good paragraphing (2-5 paragraphs): +20 points
- Uses transition words: +15 points
- No excessive punctuation: +15 points
- **Total: 0-100**

**Examples:**
- **Score 85+**: Well-structured with clear transitions
- **Score 50-70**: Basic structure, missing connectors
- **Score <50**: Disorganized, no logical flow

---

### 5. ✅ **Completeness Score** (0-100)

**Source:** `calculateCompleteness()` in [`evaluationMetrics.ts`](src/lib/evaluationMetrics.ts)  
**What it measures:** How thorough and complete the response is

**Algorithm:**

```javascript
export function calculateCompleteness(response: string): number {
  let score = 40;  // Base score

  // Has introduction (first sentence > 20 chars)
  const firstSentence = response.split(/[.!?]/)[0];
  if (firstSentence && firstSentence.length > 20) {
    score += 20;
  }

  // Has body content (multiple paragraphs)
  const paragraphs = response.split('\n\n').filter(p => p.trim().length > 0);
  if (paragraphs.length >= 2) {
    score += 20;
  }

  // Has conclusion
  const conclusionWords = [
    'in conclusion', 'to summarize', 'finally', 
    'overall', 'in summary'
  ];
  const hasConclusion = conclusionWords.some(phrase =>
    response.toLowerCase().includes(phrase)
  );
  if (hasConclusion) {
    score += 20;
  }

  return Math.min(100, score);
}
```

**Scoring Breakdown:**
- Base: 40 points
- Has introduction: +20 points
- Has body (2+ paragraphs): +20 points
- Has conclusion: +20 points
- **Total: 0-100**

**Examples:**
- **Score 80+**: Introduction, body, and conclusion
- **Score 60-80**: Has most parts but missing one element
- **Score <60**: Incomplete, missing key sections

---

### 6. ⭐ **Overall Quality Score** (0-100)

**Source:** Calculated in `evaluateResponse()`  
**What it measures:** Combined quality assessment

**Formula:**

```javascript
Overall Quality = (Clarity + Relevance + Coherence + Completeness) / 4
```

**Example Calculation:**

```
Clarity:       85
Relevance:     78
Coherence:     82
Completeness:  90
─────────────────
Sum:          335
Average:      335 / 4 = 83.75 ≈ 84

Overall Quality Score: 84/100
```

**Score Interpretation:**
- **90-100**: Excellent quality, ready to use as-is
- **75-89**: Good quality, minor improvements possible
- **60-74**: Acceptable, needs some editing
- **40-59**: Poor quality, significant issues
- **0-39**: Very poor, needs complete rewrite

---


## 🎯 Understanding the Metrics Together

### **Example Comparison:**

**Prompt:** "Write a 100-word product description for wireless headphones"

#### **Prompt A Result (Vague):**
```
Response: "Nice headphones. Good sound. Buy them."
```
- ⏱️ Response Time: 850ms
- ⭐ Overall Quality: 42/100
- 📖 Clarity: 55 (too short, choppy)
- 🎯 Relevance: 45 (missing key terms)
- 🔗 Coherence: 35 (no structure)
- ✅ Completeness: 35 (no intro/conclusion)
- Notes: Off-target and too short for production use

#### **Prompt B Result (Specific):**
```
Response: "Experience premium audio quality with our wireless noise-canceling 
headphones. Featuring 30-hour battery life, ultra-comfortable memory foam 
cushions, and studio-grade sound drivers, these headphones transform your 
listening experience. Perfect for remote work, travel, or leisure. Advanced 
Bluetooth 5.0 ensures stable connectivity up to 10 meters. Includes hard 
carrying case and USB-C fast charging."
```
- ⏱️ Response Time: 1200ms
- ⭐ Overall Quality: 87/100
- 📖 Clarity: 88 (well-structured sentences)
- 🎯 Relevance: 92 (includes all key features)
- 🔗 Coherence: 85 (logical flow)
- ✅ Completeness: 83 (has intro and details)
- Notes: Strong candidate with minimal edits

**Winner:** Prompt B (significantly better across all metrics)

---

## 🔧 Customizing Metrics

All metric calculations can be customized in [`src/lib/evaluationMetrics.ts`](src/lib/evaluationMetrics.ts).

### **Example: Adjust Clarity Scoring**

Make readability scores stricter:

```javascript
// Original
if (avgWordsPerSentence >= 15 && avgWordsPerSentence <= 20) {
  score += 25;
}

// Stricter version
if (avgWordsPerSentence >= 12 && avgWordsPerSentence <= 18) {
  score += 30;  // Reward tighter range more
}
```

### **Example: Add New Metric**

Add a "Professionalism" metric:

```javascript
export function calculateProfessionalism(response: string): number {
  let score = 50;
  
  // Check for casual words
  const casualWords = ['gonna', 'wanna', 'yeah', 'nah', 'lol'];
  const hasCasual = casualWords.some(word => 
    response.toLowerCase().includes(word)
  );
  score += hasCasual ? -20 : 20;
  
  // Check for contractions
  const contractions = response.match(/\w+'\w+/g) || [];
  score -= Math.min(30, contractions.length * 5);
  
  return Math.max(0, Math.min(100, score));
}
```

Then add it to `evaluateResponse()`:

```javascript
const professionalism = calculateProfessionalism(response);
const automatedScore = Math.round(
  (clarity + relevance + coherence + completeness + professionalism) / 5
);
```

---

## 📊 Metric Limitations

### **What Automated Metrics CAN'T Detect:**

❌ **Factual Accuracy** - Metrics can't verify if information is correct  
❌ **Cultural Sensitivity** - Metrics don't understand context or nuance  
❌ **Creativity** - Originality isn't measured by structure  
❌ **Humor/Tone** - Subjective qualities need human judgment  
❌ **Domain Expertise** - Technical accuracy requires expert review

### **Best Practice:**

Always combine automated metrics with manual review:

1. ✅ Use automated scores for **initial filtering**
2. ✅ Review top-scoring responses **manually**
3. ✅ Consider your **specific use case**
4. ✅ Track required edit effort before final selection

---

## 🎓 Summary

### **Quick Reference:**

| When... | Look at... |
|---------|------------|
| Speed matters | ⏱️ Response Time |
| Text quality matters | 📖 Clarity + 🔗 Coherence |
| Prompt matching matters | 🎯 Relevance |
| Thoroughness matters | ✅ Completeness |
| Overall comparison | ⭐ Overall Quality |
| Final decision | Manual review + task fit |

### **Key Takeaways:**

1. 📈 All metrics are **transparent** - you can see how they're calculated
2. 🔧 All metrics are **customizable** - modify algorithms to fit your needs
3. 🤖 Automated metrics are **guides**, not absolute truth
4. 👤 Manual review is still essential for final decisions
5. 📊 Use metrics to **compare** prompts, not as pass/fail tests

---

## 📚 Related Documentation

- [RUNNING_EXPERIMENTS.md](RUNNING_EXPERIMENTS.md) - How to run prompt experiments
- [EXPERIMENT_GUIDE.md](EXPERIMENT_GUIDE.md) - Best practices and methodology
- [EXPERIMENT_CHECKLIST.md](EXPERIMENT_CHECKLIST.md) - Step-by-step checklist
- [src/lib/evaluationMetrics.ts](src/lib/evaluationMetrics.ts) - Source code for all metrics

---

**Last Updated:** 8 March 2026  
**Version:** 1.0
