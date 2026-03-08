export type ExperimentPromptScore = {
  promptId: number;
  overallQuality: number;
};

export type ExperimentSummaryPayload = {
  status: 'draft' | 'completed';
  avgQualityScore: number | null;
  avgResponseTimeMs: number | null;
  totalTokens: number;
  promptScores?: ExperimentPromptScore[];
};

type CreateExperimentResponse = {
  message?: string;
  experiment?: {
    id: string;
    userId: string;
    prompts: number[];
    createdAt: string;
    status?: 'draft' | 'completed';
    avgQualityScore?: number | null;
    avgResponseTimeMs?: number | null;
    totalTokens?: number;
    promptScores?: ExperimentPromptScore[];
  };
};

export type ExperimentRecord = {
  _id: string;
  userId: string;
  prompts: number[];
  createdAt: string;
  status?: 'draft' | 'completed';
  avgQualityScore?: number | null;
  avgResponseTimeMs?: number | null;
  totalTokens?: number;
  promptScores?: ExperimentPromptScore[];
};

type ExperimentsListResponse = {
  experiments?: ExperimentRecord[];
  message?: string;
};

type ExperimentDetailResponse = {
  experiment?: ExperimentRecord;
  message?: string;
};

export async function createExperimentRequest(
  userId: string,
  promptIds: number[],
  summary?: ExperimentSummaryPayload
): Promise<CreateExperimentResponse> {
  const response = await fetch('/api/experiments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userId,
      prompts: promptIds,
      summary,
    }),
  });

  const data = (await response.json()) as CreateExperimentResponse;

  if (!response.ok) {
    throw new Error(data.message || 'Failed to save experiment.');
  }

  return data;
}

export async function fetchExperimentsRequest(userId: string): Promise<ExperimentRecord[]> {
  const response = await fetch(`/api/experiments?userId=${encodeURIComponent(userId)}`);
  const data = (await response.json()) as ExperimentsListResponse;

  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch experiments.');
  }

  return data.experiments || [];
}

export async function fetchExperimentByIdRequest(userId: string, experimentId: string): Promise<ExperimentRecord> {
  const response = await fetch(
    `/api/experiments/${encodeURIComponent(experimentId)}?userId=${encodeURIComponent(userId)}`
  );
  const data = (await response.json()) as ExperimentDetailResponse;

  if (!response.ok || !data.experiment) {
    throw new Error(data.message || 'Failed to fetch experiment details.');
  }

  return data.experiment;
}
