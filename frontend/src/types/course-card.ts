export interface CourseCardData {
  id: string;
  title: string;
  instructor: string;
  description: string;
  isOwned: boolean;
  isPaidOnly: boolean;
  price?: number;
  originalPrice?: number;
  thumbnailUrl?: string;
}

export interface OrderRecord {
  id: string;
  journeyId: string;
  courseTitle: string;
  amount: number;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
}

export type OwnershipStatus = 'owned' | 'not_owned';
export type AccessStatus = 'paid_only' | 'free';
