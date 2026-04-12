import { getAuthHeaders } from './authApi';

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

function normalizeId(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }

  if (value && typeof value === 'object') {
    const maybeOid = (value as { $oid?: unknown }).$oid;
    if (typeof maybeOid === 'string') {
      return maybeOid;
    }
  }

  return '';
}

function normalizeExperimentRecord(raw: Record<string, unknown>): ExperimentRecord {
  const rawId = normalizeId(raw._id) || normalizeId(raw.id) || String(raw._id || raw.id || '');

  return {
    _id: rawId,
    userId: String(raw.userId || ''),
    prompts: Array.isArray(raw.prompts)
      ? raw.prompts.map((entry) => Number(entry)).filter((entry) => Number.isInteger(entry))
      : [],
    createdAt: String(raw.createdAt || ''),
    status: raw.status === 'completed' ? 'completed' : 'draft',
    avgQualityScore: typeof raw.avgQualityScore === 'number' ? raw.avgQualityScore : null,
    avgResponseTimeMs: typeof raw.avgResponseTimeMs === 'number' ? raw.avgResponseTimeMs : null,
    totalTokens: typeof raw.totalTokens === 'number' ? raw.totalTokens : 0,
    promptScores: Array.isArray(raw.promptScores)
      ? raw.promptScores
          .map((entry) => ({
            promptId: Number((entry as Record<string, unknown>)?.promptId),
            overallQuality: Number((entry as Record<string, unknown>)?.overallQuality),
          }))
          .filter((entry) => Number.isInteger(entry.promptId) && Number.isFinite(entry.overallQuality))
      : [],
  };
}

export async function createExperimentRequest(
  promptIds: (string | number)[],
  summary?: ExperimentSummaryPayload
): Promise<CreateExperimentResponse> {
  const response = await fetch('/api/experiments', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
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

export async function fetchExperimentsRequest(): Promise<ExperimentRecord[]> {
  const response = await fetch('/api/experiments', {
    headers: getAuthHeaders(),
  });
  const data = (await response.json()) as ExperimentsListResponse;

  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch experiments.');
  }

  return (data.experiments || []).map((item) => normalizeExperimentRecord(item as unknown as Record<string, unknown>));
}

export async function fetchExperimentByIdRequest(experimentId: string): Promise<ExperimentRecord> {
  const response = await fetch(
    `/api/experiments/${encodeURIComponent(experimentId)}`,
    {
      headers: getAuthHeaders(),
    }
  );
  const data = (await response.json()) as ExperimentDetailResponse;

  if (!response.ok || !data.experiment) {
    throw new Error(data.message || 'Failed to fetch experiment details.');
  }

  return normalizeExperimentRecord(data.experiment as unknown as Record<string, unknown>);
}
