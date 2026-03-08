# Prompt Quality Evaluation - Best Practices Guide

## Overview
This guide outlines the proper methodology for running experiments to evaluate and compare prompt quality in the Prompt Lab application.

## Experiment Design Principles

### 1. **Define Clear Objectives**
Before running experiments, establish:
- **Goal**: What do you want to achieve? (e.g., "Write better marketing emails")
- **Success Criteria**: What makes a prompt "better"? (clarity, conversion rate, user engagement)
- **Metrics**: Which quantifiable metrics matter most?

### 2. **A/B Testing Methodology**

#### Control vs. Variant
- **Control (A)**: Your baseline prompt
- **Variant (B)**: Modified version with one key change
- **Best Practice**: Change ONE variable at a time

#### Example:
```
Control: "Write a blog post about AI"
Variant: "Write a 500-word SEO-optimized blog post about AI trends in 2026, 
          using a professional yet conversational tone"
```
**Variable Changed**: Specificity and constraints

### 3. **Sample Size Recommendations**

| Experiment Type | Recommended Runs |
|----------------|------------------|
| Quick test     | 3-5 runs         |
| Standard A/B   | 10-15 runs       |
| Rigorous study | 30+ runs         |

**Why multiple runs?**
- AI models have inherent randomness (temperature parameter)
- Multiple runs reduce outlier bias
- Statistical significance requires adequate sample size

## Evaluation Metrics

### Automated Metrics
1. **Clarity Score (0-100)**: Readability and sentence structure
2. **Relevance Score (0-100)**: How well response matches prompt intent
3. **Coherence Score (0-100)**: Logical flow and consistency
4. **Completeness Score (0-100)**: Whether response is thorough

### Performance Metrics
1. **Response Time**: Speed of generation (ms)
2. **Token Usage**: Cost efficiency
3. **Response Length**: Word/character count

### Manual Evaluation (Critical!)
1. **Task Success**: Did it achieve the intended goal?
2. **Usability**: Would you use this response as-is?
3. **Edit Effort**: How much rewriting is needed before use?

## Running Experiments: Step-by-Step

### Step 1: Prepare Prompts
```javascript
// Select 2-5 prompts to compare
const selectedPrompts = [
  { id: 1, title: "Baseline", content: "Write an email..." },
  { id: 2, title: "With AIDA Framework", content: "Using AIDA..." }
];
```

### Step 2: Configure AI Settings
```javascript
const aiConfig = {
  provider: 'openai',
  model: 'gpt-4',
  temperature: 0.7,  // 0 = deterministic, 1 = creative
  maxTokens: 1000
};
```

**Temperature Guidelines:**
- **0.0-0.3**: Deterministic, factual tasks
- **0.4-0.7**: Balanced creativity and consistency (recommended)
- **0.8-1.0**: Creative writing, brainstorming

### Step 3: Run Experiment
1. Click "Run Experiment" button
2. System sends each prompt to AI
3. Responses are displayed side-by-side
4. Automated metrics are calculated

### Step 4: Manual Review
For each response:
1. **Read carefully**: Does it meet the objective?
2. **Check task fit**: Can it be used for your real task?
3. **Note observations**: What worked? What didn't?

### Step 5: Analyze Results
Compare metrics across prompts:
- Which has highest automated score?
- Which is fastest?
- Which is most complete?
- Which would you actually use with minimal edits?

### Step 6: Iterate
1. Identify winning prompt
2. Create new variant with further improvements
3. Re-run experiment
4. Repeat until satisfied

## Common Experiment Scenarios

### Scenario 1: Improving Specificity
**Hypothesis**: More specific prompts yield better results

```
Test 1: "Write a product description"
Test 2: "Write a 50-word product description for wireless headphones, 
         highlighting comfort, battery life, and sound quality"
```

**Expected Outcome**: Test 2 should score higher on relevance and completeness

### Scenario 2: Framework Comparison
**Hypothesis**: Using established frameworks improves output quality

```
Test 1: "Write a sales email"
Test 2: "Write a sales email using AIDA (Attention, Interest, Desire, Action)"
Test 3: "Write a sales email using PAS (Problem, Agitation, Solution)"
```

**Analysis**: Compare structure, coherence, and conversion potential

### Scenario 3: Constraint Testing
**Hypothesis**: Adding constraints improves focus

```
Test 1: "Explain quantum computing"
Test 2: "Explain quantum computing in 3 paragraphs for a high school student"
```

**Expected Outcome**: Test 2 should score higher on clarity and completeness

### Scenario 4: Role-Playing Impact
**Hypothesis**: Assigning a role improves expertise

```
Test 1: "Give coding advice"
Test 2: "You are a senior software engineer with 10 years experience. 
         Give coding advice for React components"
```

**Expected Outcome**: Test 2 should provide more expert-level responses

## Statistical Analysis

### Calculating Significance
For rigorous testing, run 10+ experiments per prompt:

```javascript
// Calculate mean and standard deviation
const scores = [85, 87, 83, 89, 86, 84, 88, 85, 87, 86];
const mean = scores.reduce((a, b) => a + b) / scores.length; // 86
const stdDev = Math.sqrt(
  scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length
);

// Confidence interval (95%)
const margin = 1.96 * (stdDev / Math.sqrt(scores.length));
console.log(`Mean: ${mean} ± ${margin}`);
```

### Declaring a Winner
A prompt is statistically better if:
- Mean score difference > 10 points, OR
- Mean score difference > 5 points AND consistent across 10+ runs

## Common Pitfalls to Avoid

### ❌ Don't Do This:
1. **Test only once**: One run is not reliable
2. **Change multiple variables**: Can't identify what worked
3. **Skip manual review**: Automated scores aren't everything
4. **Compare different models**: Use same model for fair comparison
5. **Skip documentation**: Record what you learned

### ✅ Do This Instead:
1. **Run 3-10+ times per prompt**
2. **Change one thing at a time**
3. **Manually review every response**
4. **Use consistent AI settings**
5. **Document findings in experiment notes**

## Recording Results

### Document Template
```markdown
## Experiment: [Name]
**Date**: 2026-03-08
**Objective**: Improve email conversion rate

### Setup
- Model: GPT-4
- Temperature: 0.7
- Runs: 10

### Prompts Tested
1. Baseline (generic)
2. AIDA framework
3. PAS framework

### Results
| Prompt | Avg Score | Avg Time | Notes |
|--------|-----------|----------|-------|
| 1      | 78        | 1200ms   | Too generic |
| 2      | 92        | 1100ms   | Best structure |
| 3      | 87        | 1050ms   | Good but longer |

### Winner: AIDA Framework (Prompt 2)
**Why**: Highest automated score with best structure and usability

### Key Insights
- Adding structure (AIDA) significantly improved coherence
- Response time was similar across all prompts
- Users preferred responses with clear CTAs

### Next Steps
- Test AIDA with different tone variations
- Try combining AIDA with specific constraints
```

## Integration with Prompt Lab

### Using the System
1. **Select Prompts**: Go to Prompts page, select 2-5 prompts
2. **Start Experiment**: Click "Run Experiment" button
3. **Configure**: Set AI provider, model, and parameters (if needed)
4. **Execute**: System runs all prompts and collects results
5. **Review**: Side-by-side comparison with metrics
6. **Rate**: Give manual ratings for each response
7. **Save**: Experiment is saved for future reference
8. **Compare**: View past experiments on Experiments page

### Viewing Results
- **Real-time**: See responses as they generate
- **Side-by-side**: Compare up to 4-5 prompts at once
- **Metrics Dashboard**: View automated quality scores
- **Export**: Save results for external analysis

## Advanced Techniques

### 1. Multi-Model Comparison
Test same prompt across different models:
- GPT-3.5 vs GPT-4
- Claude vs GPT-4
- Different temperature settings

### 2. Prompt Chaining
Test sequences of prompts:
1. Generate outline
2. Expand each section
3. Add conclusion

### 3. Few-Shot vs Zero-Shot
Compare providing examples vs no examples

### 4. Iterative Refinement
1. Run experiment
2. Identify best prompt
3. Create 3 variants of winner
4. Run new experiment
5. Repeat

## Conclusion

Effective prompt evaluation requires:
- **Clear objectives** and success criteria
- **Controlled testing** (change one variable)
- **Multiple runs** for statistical confidence
- **Balanced metrics** (automated + manual)
- **Systematic documentation** of findings

Remember: The best prompt is the one that achieves YOUR specific goal, not necessarily the one with the highest automated score.
