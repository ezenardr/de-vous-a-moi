import { can, getUserRole, UserActions } from "./roles";

export class UserPolicy {
  async createReads(userId: string): Promise<boolean> {
    const role = await getUserRole(userId);
    return can(role, UserActions["reads:create"]);
  }
}

export const userPolicy = new UserPolicy();
