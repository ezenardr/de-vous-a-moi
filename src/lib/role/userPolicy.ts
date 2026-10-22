import "server-only";
import { Actions, can } from "@/server/auth/permissions";
import { findUserById } from "@/server/auth/users";

export class UserPolicy {
  async createReads(userId: string): Promise<boolean> {
    return can(userId ? await findUserById(userId) : null, Actions.createReads);
  }

  async admin(userId: string): Promise<boolean> {
    return can(userId ? await findUserById(userId) : null, Actions.admin);
  }
}

export const userPolicy = new UserPolicy();
