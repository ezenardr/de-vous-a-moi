// Role codes stored in users.role, with their French labels (shared by the admin pages).
export const ROLE_LABELS = { "1": "Lecteur", "2": "Auteur", "3": "Administrateur", "4": "Propriétaire" } as const;
export type RoleCode = keyof typeof ROLE_LABELS;
