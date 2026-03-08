export type PromptResultPayload = {
  promptId: number;
  aiResponse: string;
  overallQuality: number;
  responseTimeMs: number;
  clarity: number;
  relevance: number;
  coherence: number;
  completeness: number;
  tokensUsed: number;
};

export type ResultsSummaryResponse = {
  experimentsRun: number;
  avgQualityScore: number | null;
  topCategories: Array<{
    name: string;
    count: number;
  }>;
};

export type PromptSummaryItem = {
  promptId: number;
  avgQualityScore: number;
  testCount: number;
  lastTestedAt: string;
};

export type PromptSummaryResponse = {
  prompts: PromptSummaryItem[];
};

export type ExperimentResultRow = {
  _id?: string;
  userId: string;
  experimentId: string;
  promptId: number;
  aiResponse: string;
  overallQuality: number;
  responseTimeMs: number;
  clarity: number;
  relevance: number;
  coherence: number;
  completeness: number;
  tokensUsed: number;
  createdAt: string;
};

type ResultsByExperimentResponse = {
  results: ExperimentResultRow[];
  message?: string;
};

export async function saveResultsBatchRequest(data: {
  userId: string;
  experimentId: string;
  promptResults: PromptResultPayload[];
}): Promise<{ insertedCount: number; message?: string }> {
  const response = await fetch('/api/results/batch', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload?.message || 'Failed to save results.');
  }

  return payload;
}

export async function fetchResultsSummaryRequest(userId: string): Promise<ResultsSummaryResponse> {
  const response = await fetch(`/api/results/summary?userId=${encodeURIComponent(userId)}`);
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload?.message || 'Failed to fetch results summary.');
  }

  return payload;
}

export async function fetchPromptResultsSummaryRequest(userId: string): Promise<PromptSummaryResponse> {
  const response = await fetch(`/api/results/prompt-summary?userId=${encodeURIComponent(userId)}`);
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload?.message || 'Failed to fetch prompt result summary.');
  }

  return payload;
}

export async function fetchResultsByExperimentRequest(
  userId: string,
  experimentId: string
): Promise<ExperimentResultRow[]> {
  const response = await fetch(
    `/api/results/by-experiment?userId=${encodeURIComponent(userId)}&experimentId=${encodeURIComponent(experimentId)}`
  );
  const payload = (await response.json()) as ResultsByExperimentResponse;

  if (!response.ok) {
    throw new Error(payload?.message || 'Failed to fetch experiment results.');
  }

  return payload.results || [];
}
