import "server-only";
import { redirect } from "next/navigation";
import { Actions, can, currentUser } from "./permissions";

// For pages: send visitors to login, and users without the right role home.
export async function authorOrRedirect() {
  const user = await currentUser();
  if (!user) redirect("/auth/login");
  if (!can(user, Actions.createReads)) redirect("/");
  return user;
}

export async function adminOrRedirect() {
  const user = await currentUser();
  if (!user) redirect("/auth/login");
  if (!can(user, Actions.admin)) redirect("/");
  return user;
}

export const authorCard = (user: { firstName: string; lastName: string; email: string; profileImageUrl: string | null }) => ({
  fullName: `${user.firstName} ${user.lastName}`,
  email: user.email,
  profileImageUrl: user.profileImageUrl ?? undefined,
});
