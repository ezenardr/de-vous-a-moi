import DateTime from "luxon";

export type User = {
  accessToken: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  profileImageUrl: string | undefined;
  role: "1" | "2" | "3" | "4";
  createdAt: DateTime;
  updatedAt: DateTime;
};

export type ReadDraft = {
  readDraftId: string;
  userId: string;
  title: string | null;
  description: string | null;
  description: string | null;
  category: string | null;
  content: string | null;
  createdAt: DateTime;
  updatedAt: DateTime;
};
