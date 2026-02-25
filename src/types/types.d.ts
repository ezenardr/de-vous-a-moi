import DateTime from "luxon";

export type User = {
  accessToken: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  profileImageUrl: string | undefined;
  imageFileId: string | undefined;
  role: "1" | "2" | "3" | "4";
  newRead: boolean;
  newWatch: boolean;
  newsletter: boolean;
  accountActivity: boolean;
  createdAt: DateTime;
  updatedAt: DateTime;
};

export type ReadDraft = {
  readDraftId: string;
  userId: string;
  title: string | null;
  description: string | null;
  category: string | null;
  content: string | null;
  imageUrl: string | null;
  imageFileId: string | null;
  createdAt: DateTime;
  updatedAt: DateTime;
};

export type Read = {
  readId: string;
  userId: string;
  title: string;
  description: string;
  category: string;
  content: string;
  featured: boolean;
  imageUrl: string;
  imageFileId: string;
  createdAt: DateTime;
  updatedAt: DateTime;
  user: User;
  readComments: ReadComment[];
};

export type ReadComment = {
  readCommentId: string;
  readId: string;
  userId: string;
  comment: string;
  user: User;
  createdAt: DateTime;
  updatedAt: DateTime;
};
