import { getAuthHeaders } from './authApi';

export type PromptResultPayload = {
  promptId: number;
  category?: string;
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
  avgResponseTimeMs?: number | null;
  promptsEvaluated?: number;
  passRate?: number | null;
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
  category?: string;
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

type ResultsByUserResponse = {
  results: ExperimentResultRow[];
  message?: string;
};

export async function saveResultsBatchRequest(data: {
  experimentId: string;
  promptResults: PromptResultPayload[];
}): Promise<{ insertedCount: number; message?: string }> {
  const response = await fetch('/api/results/batch', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload?.message || 'Failed to save results.');
  }

  return payload;
}

export async function fetchResultsSummaryRequest(): Promise<ResultsSummaryResponse> {
  const response = await fetch('/api/results/summary', {
    headers: getAuthHeaders(),
  });
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload?.message || 'Failed to fetch results summary.');
  }

  return payload;
}

export async function fetchPromptResultsSummaryRequest(): Promise<PromptSummaryResponse> {
  const response = await fetch('/api/results/prompt-summary', {
    headers: getAuthHeaders(),
  });
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload?.message || 'Failed to fetch prompt result summary.');
  }

  return payload;
}

export async function fetchResultsByExperimentRequest(
  experimentId: string
): Promise<ExperimentResultRow[]> {
  const response = await fetch(
    `/api/results/by-experiment?experimentId=${encodeURIComponent(experimentId)}`,
    {
      headers: getAuthHeaders(),
    }
  );
  const payload = (await response.json()) as ResultsByExperimentResponse;

  if (!response.ok) {
    throw new Error(payload?.message || 'Failed to fetch experiment results.');
  }

  return payload.results || [];
}

export async function fetchResultsByUserRequest(): Promise<ExperimentResultRow[]> {
  const response = await fetch('/api/results/by-user', {
    headers: getAuthHeaders(),
  });
  const payload = (await response.json()) as ResultsByUserResponse;

  if (!response.ok) {
    throw new Error(payload?.message || 'Failed to fetch user results.');
  }

  return payload.results || [];
}
