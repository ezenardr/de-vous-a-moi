import createPowerIota from "./createPowerIota";

export const Role = {
  User: 1,
  Author: 2,
  Admin: 3,
  Owner: 4,
} as const;

export type TRole = (typeof Role)[keyof typeof Role];

const iota = createPowerIota();

export const UserActions = {
  "reads:view": iota(),
  "reads:create": iota(),
  "reads:delete": iota(),
  "reads:update": iota(),
} as const;

export type UserAction = (typeof UserActions)[keyof typeof UserActions];

const UserPermission = UserActions["reads:view"];

const AuthorPermission =
  UserPermission |
  UserActions["reads:create"] |
  UserActions["reads:delete"] |
  UserActions["reads:update"];

const AdminPermission = AuthorPermission;

const OwnerPermission = AdminPermission;

export const Permissions: Record<TRole, number> = {
  [Role.Owner]: OwnerPermission,
  [Role.Admin]: AdminPermission,
  [Role.Author]: AuthorPermission,
  [Role.User]: UserPermission,
};

export async function getUserRole(userId: string): Promise<TRole> {
  const request = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/user/role/${userId}`,
  );
  const response = await request.json();

  if (response.success === false) {
    throw new Error("Cannot retrieve user role at the moment");
  }

  return response.role as TRole;
}

export function can(role: TRole, action: UserAction): boolean {
  return (Permissions[role] & action) === action;
}
