import { api } from '@/shared/api/client';

export interface BranchReview {
  _id: string;
  rating: number;
  comment: string;
  orderNumber: string;
  googleClicked: boolean;
  hidden: boolean;
  createdAt: string;
}

export async function fetchBranchReviews(branchId: string): Promise<{ items: BranchReview[]; total: number }> {
  const res = await api.get('/reviews', { params: { branchId, limit: 50 } });
  return res.data.data ?? { items: [], total: 0 };
}

export async function setReviewHidden(reviewId: string, hidden: boolean): Promise<void> {
  await api.patch(`/reviews/${reviewId}`, { hidden });
}

export async function saveGoogleReviewUrl(branchId: string, googleReviewUrl: string): Promise<void> {
  await api.put(`/restaurant/branches/${branchId}`, { googleReviewUrl });
}
