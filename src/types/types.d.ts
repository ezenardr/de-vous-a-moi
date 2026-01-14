import DateTime from "luxon";

export type User = {
  accessToken: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  profileImageUrl: string | undefined;
  role: "user" | "author" | "admin" | "owner";
  createdAt: DateTime;
  updatedAt: DateTime;
};
