# Running Prompt Quality Experiments - Quick Start

## 🎯 Overview

This system helps you scientifically evaluate and compare the quality of different prompt variations to find the most effective prompts for your AI applications.

## 🚀 Quick Start (5 Steps)

### 1. **Set Up AI API** (First time only)
Create `.env` file in project root:
```bash
# For OpenAI
VITE_OPENAI_API_KEY=sk-your-api-key-here

# For Anthropic Claude
VITE_ANTHROPIC_API_KEY=sk-ant-your-api-key-here
```

### 2. **Select Prompts to Test**
- Go to **Prompts Library** page
- Select 2-5 prompts you want to compare
- Click **"Run Experiment"**

### 3. **Configure Settings**
- Choose AI provider (OpenAI/Anthropic)
- Select model (GPT-4, GPT-3.5, Claude, etc.)
- Set temperature (0.7 recommended)

### 4. **Run & Review**
- Click **"Run Experiment"**
- Wait for AI responses (1-2 mins)
- Review responses side-by-side

### 5. **Evaluate & Choose Winner**
- Review each response for task fit and edit effort
- Review automated metrics
- Save best prompt to Favorites

## 📊 Evaluation Metrics Explained

### Automated Metrics (System Calculates)
- **Clarity Score**: How readable and well-structured
- **Relevance Score**: How well it matches prompt intent
- **Coherence Score**: Logical flow and consistency
- **Completeness Score**: Thoroughness of response
- **Overall Quality Score**: Combined metric (0-100)

### Performance Metrics
- **Response Time**: Speed in milliseconds
- **Token Usage**: Cost efficiency

### Manual Review Checklist
- **Task Success**: Did it achieve your goal?
- **Usability**: Can you use it with minimal edits?

## 🧪 What Makes a Good Experiment?

### ✅ Good Experiment Examples

**Example 1: Testing Specificity**
```
Prompt A (Vague):
"Write a product description"

Prompt B (Specific):
"Write a 100-word product description for wireless earbuds, 
highlighting battery life, sound quality, and comfort"
```
**What you're testing**: Impact of specificity

---

**Example 2: Testing Frameworks**
```
Prompt A (No Framework):
"Write a sales email for our new feature"

Prompt B (With Framework):
"Write a sales email using AIDA framework (Attention, Interest, 
Desire, Action) for our new feature"
```
**What you're testing**: Impact of structured frameworks

---

**Example 3: Testing Constraints**
```
Prompt A (No Constraints):
"Explain machine learning"

Prompt B (With Constraints):
"Explain machine learning in 3 paragraphs for a 12-year-old"
```
**What you're testing**: Impact of audience and length constraints

### ❌ Poor Experiment (Don't Do This)
```
Prompt A: "Write a blog post"
Prompt B: "Act as an expert SEO copywriter. Write a 1000-word 
blog post about AI trends in marketing for B2B SaaS companies, 
using conversational tone with 3 subheadings"
```
**Problem**: Too many variables changed at once
- Can't tell which change made the difference
- Not scientific

### ✅ Better Approach
Test one variable at a time across 3+ experiments:
1. **Experiment 1**: Base vs. Role assignment
2. **Experiment 2**: Winner vs. Length constraint
3. **Experiment 3**: Winner vs. Tone specification
4. **Experiment 4**: Winner vs. Structure requirements

## 🔬 Best Practices Summary

### Planning
1. Define clear objective: What do you want to improve?
2. Test ONE variable at a time
3. Select 2-5 prompt variations to compare

### Execution
1. Use same AI model & settings for all prompts
2. Run 3-10 times for statistical confidence
3. Review each response carefully

### Analysis
1. Check automated scores (but don't rely on them alone)
2. Rate manually (your opinion matters most!)
3. Document what worked and why

### Iteration
1. Identify winning prompt
2. Create new variants based on winner
3. Run new experiment
4. Repeat until satisfied

## 📈 Interpreting Results

### When Prompt A is Better Than B:
- **Score difference < 5 points**: Negligible, could be random
- **Score difference 5-10 points**: Slight improvement, needs more testing
- **Score difference > 10 points**: Significant improvement! Use this one

### What to Look For:
- **High Clarity + Coherence**: Well-written, readable responses
- **High Relevance + Completeness**: Addresses your needs fully
- **Fast Response Time**: Efficient generation
- **Low Token Usage**: Cost-effective

### Red Flags:
- ⚠️ Very low relevance (<60): Prompt too vague or confusing
- ⚠️ Low coherence (<60): Response is disorganized
- ⚠️ Low completeness (<60): Response is incomplete
- ⚠️ Very slow (>5000ms): Model or prompt is inefficient

## 🎓 Common Experiment Types

### 1. Specificity Testing
**Hypothesis**: More specific prompts → Better results
```
Generic → Specific with details → Highly specific with constraints
```

### 2. Framework Comparison
**Hypothesis**: Using frameworks improves structure
```
No framework → AIDA → PAS → STAR
```

### 3. Role-Playing Impact
**Hypothesis**: Assigning roles improves expertise
```
No role → Basic role → Expert role with context
```

### 4. Constraint Testing
**Hypothesis**: Constraints improve focus
```
No constraints → Length constraint → Format + length → Full specification
```

### 5. Tone Variation
**Hypothesis**: Tone specification improves appropriateness
```
No tone → Professional → Casual → Technical
```

## 📁 Files Created

Your project now includes:

1. **[EXPERIMENT_GUIDE.md](./EXPERIMENT_GUIDE.md)**: Comprehensive methodology guide
2. **[EXPERIMENT_CHECKLIST.md](./EXPERIMENT_CHECKLIST.md)**: Pre/during/post experiment checklist
3. **[src/lib/aiApi.ts](./src/lib/aiApi.ts)**: AI API integration code
4. **[src/lib/evaluationMetrics.ts](./src/lib/evaluationMetrics.ts)**: Quality evaluation algorithms

## 🔧 Implementation Status

### ✅ Currently Available:
- Experiment runner UI
- Side-by-side comparison
- Mock response generation
- Basic metrics display

### 🚧 To Enable Real AI Testing:
1. Add API keys to `.env` file
2. Update ExperimentRunnerPage.vue to use `aiApi.ts`
3. Update metrics calculation to use `evaluationMetrics.ts`
4. Test with real API calls

## 💡 Pro Tips

1. **Start Small**: Test 2 prompts with 3 runs first
2. **Document Everything**: Write down what you learn
3. **Trust Your Judgment**: Automated scores aren't perfect
4. **Iterate Quickly**: Run experiments, learn, improve
5. **Save Winners**: Add best prompts to Favorites

## 🆘 Troubleshooting

### "Experiment failed to run"
- Check API key is set correctly
- Verify internet connection
- Check API rate limits

### "All scores are similar"
- Prompts might be too similar
- Try more distinct variations
- Run more iterations

### "Automated scores seem wrong"
- Review responses manually
- Trust your judgment over scores
- Scores are guidelines, not absolutes

## 📚 Learn More

- [Full Experiment Guide](./EXPERIMENT_GUIDE.md) - Detailed methodology
- [Checklist](./EXPERIMENT_CHECKLIST.md) - Step-by-step process
- [OpenAI Best Practices](https://platform.openai.com/docs/guides/prompt-engineering) - Official guide

---

## 🎯 Your First Experiment (15 minutes)

Try this simple test to get started:

1. **Go to Prompts Library**
2. **Create two prompts:**
   - Prompt A: "Write a welcome email"
   - Prompt B: "Write a friendly 100-word welcome email for new app users"
3. **Select both** and click "Run Experiment"
4. **Review the results** - Which one is better?
5. **Save the winner** to Favorites

Congratulations! You've run your first prompt quality experiment! 🎉
