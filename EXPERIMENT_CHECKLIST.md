# Experiment Checklist

## Before Running Experiment

### Setup (Required)
- [ ] Configure AI API key in environment variables
  ```bash
  # In .env file
  VITE_OPENAI_API_KEY=sk-...
  # or
  VITE_ANTHROPIC_API_KEY=sk-ant-...
  ```
- [ ] Select AI model and provider
- [ ] Set temperature (recommended: 0.7)
- [ ] Define max tokens (recommended: 1000-2000)

### Planning (Recommended)
- [ ] Define clear experiment objective
- [ ] Identify what variable you're testing
- [ ] Determine success criteria
- [ ] Decide on number of runs (min: 3, recommended: 10)
- [ ] Prepare 2-5 prompts to compare

## During Experiment

### Execution
- [ ] Start experiment from Experiment Runner
- [ ] Wait for all prompts to complete
- [ ] Verify responses loaded successfully
- [ ] Check for API errors or timeouts

### Review Each Response
- [ ] Read response carefully
- [ ] Check if it meets objective
- [ ] Evaluate quality subjectively
- [ ] Note any standout positives/negatives

## After Experiment

### Analysis
- [ ] Compare automated scores across prompts
- [ ] Compare response times
- [ ] Compare token usage (cost)
- [ ] Identify winning prompt

### Documentation
- [ ] Record experiment date and settings
- [ ] Note which prompt performed best
- [ ] Document key insights
- [ ] List next steps or follow-up experiments

### Decision
- [ ] Choose winning prompt for production use
- [ ] Save winning prompt to Favorites
- [ ] Plan iteration/refinement if needed
- [ ] Share findings with team (if applicable)

## Quality Checks

### For Each Prompt Response
- [ ] Is it grammatically correct?
- [ ] Does it address the prompt fully?
- [ ] Is the tone appropriate?
- [ ] Is the length appropriate?
- [ ] Would you use this response as-is?
- [ ] Does it require editing? (How much?)

### For Comparison
- [ ] Which prompt has best clarity?
- [ ] Which prompt has best relevance?
- [ ] Which prompt is most coherent?
- [ ] Which prompt is most complete?
- [ ] Which prompt is fastest?
- [ ] Which prompt is most cost-effective?

## Common Issues

### If Experiment Fails
- [ ] Check internet connection
- [ ] Verify API key is correct
- [ ] Check API rate limits
- [ ] Verify API balance/credits
- [ ] Check browser console for errors
- [ ] Try reducing number of prompts
- [ ] Try reducing max_tokens setting

### If Results Look Wrong
- [ ] Verify prompts are different enough
- [ ] Check temperature setting (too high/low?)
- [ ] Review prompt text for clarity
- [ ] Consider if model is appropriate
- [ ] Try running experiment again

## Best Practices

### Do's ✅
- ✅ Test one variable at a time
- ✅ Run multiple experiments for reliability
- ✅ Manually review every response
- ✅ Document your findings
- ✅ Use consistent AI settings for fair comparison
- ✅ Rate responses immediately while fresh in mind

### Don'ts ❌
- ❌ Don't test only once (not reliable)
- ❌ Don't change multiple variables simultaneously
- ❌ Don't rely solely on automated scores
- ❌ Don't compare results from different models
- ❌ Don't skip manual evaluation
- ❌ Don't forget to save successful prompts

## Quick Examples

### Example 1: Specificity Test
```
Prompt A: "Write a blog post"
Prompt B: "Write a 300-word blog post about AI ethics for tech professionals"
Variable: Specificity and constraints
```

### Example 2: Framework Test
```
Prompt A: "Write a marketing email"
Prompt B: "Write a marketing email using AIDA framework"
Variable: Using established framework
```

### Example 3: Tone Test
```
Prompt A: "Explain blockchain to me"
Prompt B: "Explain blockchain to me like I'm 10 years old"
Variable: Audience/tone specification
```

### Example 4: Role Test
```
Prompt A: "Give me coding advice"
Prompt B: "Act as a senior software engineer and give coding advice"
Variable: Role assignment
```

## Time Estimates

| Task | Duration |
|------|----------|
| Setup experiment | 2-5 minutes |
| Run experiment (3 prompts) | 5-10 minutes |
| Review & rate responses | 5-10 minutes |
| Document findings | 5 minutes |
| **Total** | **15-30 minutes** |

## Success Criteria

An experiment is successful when you can answer:
1. ✅ Which prompt performed best overall?
2. ✅ Why did it perform better?
3. ✅ What specific element made the difference?
4. ✅ Would you use the winning response in production?
5. ✅ What will you test next to improve further?

## Resources

- [Full Experiment Guide](./EXPERIMENT_GUIDE.md)
- [AI API Setup](./src/lib/aiApi.ts)
- [Evaluation Metrics](./src/lib/evaluationMetrics.ts)
- OpenAI Documentation: https://platform.openai.com/docs
- Anthropic Documentation: https://docs.anthropic.com
