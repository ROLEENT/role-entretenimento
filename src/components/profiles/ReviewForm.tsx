// COMPONENTE DEPRECIADO - Use ArtistReviewForm no lugar
// Este arquivo será removido em versões futuras

import { ArtistReviewForm } from '@/components/reviews/ArtistReviewForm';

interface ReviewFormProps {
  profileId: string;
}

export function ReviewForm({ profileId }: ReviewFormProps) {
  return <ArtistReviewForm profileUserId={profileId} />;
}