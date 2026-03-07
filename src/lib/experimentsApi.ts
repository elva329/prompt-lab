type CreateExperimentResponse = {
  message?: string;
  experiment?: {
    id: string;
    userId: string;
    prompts: number[];
    createdAt: string;
  };
};

export type ExperimentRecord = {
  _id: string;
  userId: string;
  prompts: number[];
  createdAt: string;
};

type ExperimentsListResponse = {
  experiments?: ExperimentRecord[];
  message?: string;
};

export async function createExperimentRequest(userId: string, promptIds: number[]): Promise<CreateExperimentResponse> {
  const response = await fetch('/api/experiments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userId,
      prompts: promptIds,
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
