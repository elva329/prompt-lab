export type PromptRecord = {
  _id?: string;
  promptId: number;
  title: string;
  promptText: string;
  category: string;
  createdAt: string;
  createdBy: string;
};

export type PromptsResponse = {
  prompts: PromptRecord[];
  total: number;
  limit: number;
  offset: number;
};

export type CategoriesResponse = {
  categories: string[];
};

export type CategoryStat = {
  name: string;
  count: number;
};

export type CategoryStatsResponse = {
  categories: CategoryStat[];
};

export async function fetchPrompts(params?: {
  category?: string;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<PromptsResponse> {
  const queryParams = new URLSearchParams();

  if (params?.category) {
    queryParams.set('category', params.category);
  }

  if (params?.search) {
    queryParams.set('search', params.search);
  }

  if (params?.limit) {
    queryParams.set('limit', String(params.limit));
  }

  if (params?.offset) {
    queryParams.set('offset', String(params.offset));
  }

  const response = await fetch(`/api/prompts?${queryParams.toString()}`);

  if (!response.ok) {
    throw new Error('Failed to fetch prompts.');
  }

  return response.json();
}

export async function fetchPromptById(id: number): Promise<PromptRecord> {
  const response = await fetch(`/api/prompts/${id}`);

  if (!response.ok) {
    throw new Error('Failed to fetch prompt.');
  }

  return response.json();
}

export async function updatePromptById(
  id: number,
  data: Partial<Pick<PromptRecord, 'title' | 'promptText' | 'category'>>
): Promise<PromptRecord> {
  const response = await fetch(`/api/prompts/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload?.message || 'Failed to update prompt.');
  }

  return payload.prompt as PromptRecord;
}

export async function fetchCategories(): Promise<CategoriesResponse> {
  const response = await fetch('/api/prompts/categories');

  if (!response.ok) {
    throw new Error('Failed to fetch categories.');
  }

  return response.json();
}

export async function fetchCategoryStats(): Promise<CategoryStatsResponse> {
  const response = await fetch('/api/prompts/category-stats');

  if (!response.ok) {
    throw new Error('Failed to fetch category stats.');
  }

  return response.json();
}

export async function createPrompt(data: {
  title: string;
  promptText: string;
  category: string;
  userId?: string;
}): Promise<{ prompt: PromptRecord }> {
  const response = await fetch('/api/prompts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload?.message || 'Failed to create prompt.');
  }

  return payload;
}
