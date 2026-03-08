/**
 * Evaluation Metrics for Prompt Quality Assessment
 * Provides both automated and manual evaluation criteria
 */

export type EvaluationCriteria = {
  // Automated metrics
  responseLength: number;
  responseTimeMs: number;
  tokensUsed: number;
  
  // Quality metrics (0-100 scale)
  clarity: number;        // How clear and understandable is the response
  relevance: number;      // How relevant to the prompt
  coherence: number;      // How well-structured and logical
  completeness: number;   // How complete is the response
  
  // Overall scores
  automatedScore: number; // Calculated from metrics
};

export type EvaluationResult = {
  promptId: number;
  promptText: string;
  aiResponse: string;
  metrics: EvaluationCriteria;
  timestamp: string;
};

/**
 * Calculate automated quality score based on response characteristics
 */
export function calculateAutomatedScore(response: string, expectedLength?: number): number {
  let score = 0;

  // Length appropriateness (0-25 points)
  const wordCount = response.trim().split(/\s+/).length;
  if (expectedLength) {
    const lengthRatio = Math.min(wordCount / expectedLength, 1);
    score += lengthRatio * 25;
  } else {
    // Default: prefer 50-500 words
    if (wordCount >= 50 && wordCount <= 500) score += 25;
    else if (wordCount >= 20 && wordCount < 50) score += 15;
    else if (wordCount > 500) score += 10;
  }

  // Structure quality (0-25 points)
  const hasParagraphs = response.includes('\n\n');
  const hasBullets = /[•\-\*]\s/.test(response);
  const hasNumbers = /\d+\.\s/.test(response);
  score += hasParagraphs ? 10 : 0;
  score += hasBullets || hasNumbers ? 15 : 5;

  // Language quality (0-25 points)
  const sentences = response.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const avgSentenceLength = sentences.reduce((sum, s) => sum + s.split(/\s+/).length, 0) / sentences.length;
  if (avgSentenceLength >= 10 && avgSentenceLength <= 25) score += 25;
  else if (avgSentenceLength >= 5 && avgSentenceLength < 10) score += 15;
  else score += 10;

  // Completeness indicators (0-25 points)
  const hasConclusion = /\b(in conclusion|to summarize|finally|overall)\b/i.test(response);
  const endsWithPunctuation = /[.!?]$/.test(response.trim());
  score += hasConclusion ? 15 : 5;
  score += endsWithPunctuation ? 10 : 0;

  return Math.min(100, Math.round(score));
}

/**
 * Calculate clarity score (readability)
 */
export function calculateClarity(response: string): number {
  const words = response.trim().split(/\s+/);
  const sentences = response.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  if (sentences.length === 0) return 0;

  const avgWordsPerSentence = words.length / sentences.length;
  const avgCharsPerWord = response.replace(/\s/g, '').length / words.length;

  // Optimal: 15-20 words/sentence, 4-6 chars/word
  let score = 50;
  
  if (avgWordsPerSentence >= 15 && avgWordsPerSentence <= 20) score += 25;
  else if (avgWordsPerSentence >= 10 && avgWordsPerSentence < 15) score += 15;
  else if (avgWordsPerSentence >= 20 && avgWordsPerSentence <= 25) score += 15;
  
  if (avgCharsPerWord >= 4 && avgCharsPerWord <= 6) score += 25;
  else if (avgCharsPerWord >= 3 && avgCharsPerWord < 4) score += 15;

  return Math.min(100, score);
}

/**
 * Calculate relevance using keyword matching
 */
export function calculateRelevance(promptText: string, response: string): number {
  // Extract keywords from prompt (simple approach)
  const promptWords = promptText
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 3); // Filter short words like "the", "and"

  const responseWords = new Set(
    response
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
  );

  const matchedKeywords = promptWords.filter(keyword => responseWords.has(keyword));
  const matchRatio = matchedKeywords.length / Math.max(promptWords.length, 1);

  return Math.min(100, Math.round(matchRatio * 100 + 30)); // Base score of 30
}

/**
 * Calculate coherence (structural consistency)
 */
export function calculateCoherence(response: string): number {
  let score = 50;

  // Check for proper paragraphing
  const paragraphs = response.split('\n\n').filter(p => p.trim().length > 0);
  if (paragraphs.length >= 2 && paragraphs.length <= 5) score += 20;

  // Check for transition words
  const transitionWords = [
    'however', 'therefore', 'furthermore', 'additionally',
    'moreover', 'consequently', 'thus', 'meanwhile'
  ];
  const hasTransitions = transitionWords.some(word => 
    response.toLowerCase().includes(word)
  );
  if (hasTransitions) score += 15;

  // Check for consistent tone (no excessive punctuation like !!!! or ???)
  const excessivePunctuation = /[!?]{3,}/.test(response);
  if (!excessivePunctuation) score += 15;

  return Math.min(100, score);
}

/**
 * Calculate completeness score
 */
export function calculateCompleteness(response: string): number {
  let score = 40;

  // Has introduction
  const firstSentence = response.split(/[.!?]/)[0];
  if (firstSentence && firstSentence.length > 20) score += 20;

  // Has body content
  const paragraphs = response.split('\n\n').filter(p => p.trim().length > 0);
  if (paragraphs.length >= 2) score += 20;

  // Has conclusion
  const hasConclusion = /\b(in conclusion|to summarize|finally|overall|in summary)\b/i.test(response);
  if (hasConclusion) score += 20;

  return Math.min(100, score);
}

/**
 * Generate comprehensive evaluation
 */
export function evaluateResponse(
  promptText: string,
  response: string,
  responseTimeMs: number,
  tokensUsed: number
): EvaluationCriteria {
  const clarity = calculateClarity(response);
  const relevance = calculateRelevance(promptText, response);
  const coherence = calculateCoherence(response);
  const completeness = calculateCompleteness(response);

  const automatedScore = Math.round((clarity + relevance + coherence + completeness) / 4);

  return {
    responseLength: response.length,
    responseTimeMs,
    tokensUsed,
    clarity,
    relevance,
    coherence,
    completeness,
    automatedScore,
  };
}

/**
 * Compare two prompts' results
 */
export function comparePrompts(
  result1: EvaluationResult,
  result2: EvaluationResult
): {
  winner: 'prompt1' | 'prompt2' | 'tie';
  betterMetrics: string[];
  score1: number;
  score2: number;
} {
  const score1 = result1.metrics.automatedScore;
  const score2 = result2.metrics.automatedScore;

  const betterMetrics: string[] = [];

  if (result1.metrics.clarity > result2.metrics.clarity) betterMetrics.push('Prompt 1: Better clarity');
  else if (result2.metrics.clarity > result1.metrics.clarity) betterMetrics.push('Prompt 2: Better clarity');

  if (result1.metrics.relevance > result2.metrics.relevance) betterMetrics.push('Prompt 1: More relevant');
  else if (result2.metrics.relevance > result1.metrics.relevance) betterMetrics.push('Prompt 2: More relevant');

  if (result1.metrics.coherence > result2.metrics.coherence) betterMetrics.push('Prompt 1: Better coherence');
  else if (result2.metrics.coherence > result1.metrics.coherence) betterMetrics.push('Prompt 2: Better coherence');

  if (result1.metrics.responseTimeMs < result2.metrics.responseTimeMs) betterMetrics.push('Prompt 1: Faster response');
  else if (result2.metrics.responseTimeMs < result1.metrics.responseTimeMs) betterMetrics.push('Prompt 2: Faster response');

  let winner: 'prompt1' | 'prompt2' | 'tie';
  if (Math.abs(score1 - score2) < 5) winner = 'tie';
  else winner = score1 > score2 ? 'prompt1' : 'prompt2';

  return { winner, betterMetrics, score1, score2 };
}
