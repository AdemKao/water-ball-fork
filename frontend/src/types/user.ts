export type UserRole = 'ADMIN' | 'TEACHER' | 'STUDENT' | null;

export interface User {
  id: string;
  email: string;
  name: string;
  pictureUrl: string | null;
  role: UserRole;
}
