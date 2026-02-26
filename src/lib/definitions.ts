interface User {
  _id: string;
  email: string;
  role: string;
}

interface SessionPayload {
  userId: string;
  role: string;
  createdAt: Date;
  expiresAt: Date;
  [key: string]: any;
}

export type { User, SessionPayload };
