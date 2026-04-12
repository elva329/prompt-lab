import { getAuthHeaders } from './authApi';

export type FavoritePrompt = {
  _id?: string;
  userId: string;
  customTitle: string;
  customCategory: string;
  customPromptText: string;
  createdAt: string;
  updatedAt: string;
};

export type FavoritePromptWithMerged = FavoritePrompt & {
  title: string;
  category: string;
  promptText: string;
  promptId: string;
};

export type FavoritesResponse = {
  favorites: FavoritePromptWithMerged[];
};

export async function fetchUserFavorites(): Promise<FavoritesResponse> {
  const response = await fetch('/api/favorites', {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch favorites.');
  }

  return response.json();
}

export async function createPrompt(
  customTitle: string,
  customPromptText: string,
  customCategory?: string
): Promise<{ favorite: FavoritePrompt }> {
  const response = await fetch('/api/favorites', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      customTitle,
      customPromptText,
      customCategory: customCategory || 'General',
    }),
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload?.message || 'Failed to create prompt.');
  }

  return payload;
}

export async function updatePrompt(
  id: string,
  customTitle: string,
  customPromptText: string,
  customCategory?: string
): Promise<{ favorite: FavoritePrompt }> {
  const response = await fetch(`/api/favorites/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      customTitle,
      customPromptText,
      customCategory: customCategory || 'General',
    }),
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload?.message || 'Failed to update prompt.');
  }

  return payload;
}

export async function removeFavorite(id: string): Promise<void> {
  const response = await fetch(`/api/favorites/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const payload = await response.json();
    throw new Error(payload?.message || 'Failed to remove favorite.');
  }
}
