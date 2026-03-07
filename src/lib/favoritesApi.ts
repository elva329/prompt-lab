export type FavoritePrompt = {
  _id?: string;
  userId: string;
  sourcePromptId: number;
  customTitle?: string;
  customCategory?: string;
  customPromptText?: string;
  createdAt: string;
  updatedAt: string;
};

export type FavoritePromptWithMerged = FavoritePrompt & {
  title: string;
  category: string;
  promptText: string;
  promptId: number;
};

export type FavoritesResponse = {
  favorites: FavoritePromptWithMerged[];
};

export async function fetchUserFavorites(userId: string): Promise<FavoritesResponse> {
  const response = await fetch(`/api/favorites?userId=${encodeURIComponent(userId)}`);

  if (!response.ok) {
    throw new Error('Failed to fetch favorites.');
  }

  return response.json();
}

export async function addOrUpdateFavorite(
  userId: string,
  sourcePromptId: number,
  customFields?: {
    customTitle?: string;
    customCategory?: string;
    customPromptText?: string;
  }
): Promise<{ favorite: FavoritePrompt }> {
  const response = await fetch('/api/favorites', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userId,
      sourcePromptId,
      ...customFields,
    }),
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload?.message || 'Failed to save favorite.');
  }

  return payload;
}

export async function removeFavorite(userId: string, sourcePromptId: number): Promise<void> {
  const response = await fetch(`/api/favorites/${sourcePromptId}?userId=${encodeURIComponent(userId)}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const payload = await response.json();
    throw new Error(payload?.message || 'Failed to remove favorite.');
  }
}
