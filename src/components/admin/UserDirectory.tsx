"use client";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { DeleteUsers, SetUserRole } from "@/action/admin";
import { AuthorChip } from "@/components/ds/AuthorChip";
import { Badge } from "@/components/ds/Badge";
import { Button } from "@/components/ds/Button";
import { FilterField, fold } from "@/components/ds/FilterField";
import { Modal, ModalActions, ModalBackButton } from "@/components/ds/Modal";
import { SegmentedTabs } from "@/components/ds/SegmentedTabs";
import { BookmarksFillIcon, CheckFillIcon, Comment2FillIcon, HeartFillIcon, MailOpenFillIcon, QuillPenLineIcon, User4FillIcon } from "@/components/icons/mingcute";
import { EASE_OUT } from "@/components/motion/easing";
import { formatBadgeDate } from "@/lib/formatDate";
import { ROLE_LABELS, type RoleCode } from "@/lib/role/labels";
import { cn } from "@/lib/utils";
import type { AdminUser } from "@/server/queries/admin";

type Filter = "all" | "readers" | "authors" | "admins" | "inactive";
// "inactive": readers who never commented, liked, saved or published (where bot sign-ups end up).
const inFilter: Record<Filter, (u: AdminUser) => boolean> = {
  all: () => true,
  readers: (u) => u.role === "1",
  authors: (u) => u.role === "2",
  admins: (u) => u.role === "3" || u.role === "4",
  inactive: (u) => u.role === "1" && u.activity.comments + u.activity.likes + u.activity.saves + u.activity.published === 0,
};
const ROLE_BADGE: Record<RoleCode, string> = {
  "1": "bg-field text-subtle",
  "2": "bg-secondary-100 text-primary-base",
  "3": "bg-secondary-base text-primary-base",
  "4": "bg-primary-base text-white",
};
const ASSIGNABLE: { role: "1" | "2" | "3"; description: string }[] = [
  { role: "1", description: "Lit, aime, enregistre et commente." },
  { role: "2", description: "Publie et gère ses propres articles et vidéos dans le studio." },
  { role: "3", description: "Tout ce que fait un auteur, plus l'administration : contenus, commentaires, newsletter." },
];
const fr = (n: number) => n.toLocaleString("fr-FR");
const fullName = (u: AdminUser) => `${u.firstName} ${u.lastName}`.trim();

// Utilisateurs: every account with its role, sign-up date, newsletter status and activity.
// Only the owner (canEditRoles) sees "Changer le rôle"; never on their own row or the owner's. The owner can
// also select reader accounts without content and delete them (bot sign-ups).
export function UserDirectory({ users, viewerId, canEditRoles }: { users: AdminUser[]; viewerId: string; canEditRoles: boolean }) {
  const router = useRouter();
  const [list, setList] = useState(users);
  const [source, setSource] = useState(users);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [pending, startTransition] = useTransition();

  // Fresh server data (after router.refresh) replaces the optimistic copy.
  if (source !== users) {
    setSource(users);
    setList(users);
  }

  const count = (f: Filter) => list.filter(inFilter[f]).length;
  const shown = useMemo(() => {
    const q = fold(query.trim());
    return list.filter((u) => inFilter[filter](u) && (!q || fold(`${fullName(u)} ${u.email}`).includes(q)));
  }, [list, filter, query]);

  const deletable = (u: AdminUser) => canEditRoles && u.role === "1" && u.userId !== viewerId && u.activity.published === 0;
  const toggle = (userId: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  const selectable = shown.filter(deletable);
  const allShownSelected = selectable.length > 0 && selectable.every((u) => selected.has(u.userId));

  function deleteSelected() {
    const ids = [...selected];
    setConfirmDelete(false);
    const before = list;
    setList((l) => l.filter((u) => !selected.has(u.userId)));
    setSelected(new Set());
    startTransition(async () => {
      const result = await DeleteUsers({ userIds: ids });
      if (!result.success) {
        setList(before);
        return void toast.error(result.error);
      }
      toast.success(`${fr(result.deleted)} compte${result.deleted > 1 ? "s" : ""} supprimé${result.deleted > 1 ? "s" : ""}`);
      router.refresh();
    });
  }

  function changeRole(user: AdminUser, role: "1" | "2" | "3") {
    setEditing(null);
    if (role === user.role) return;
    const before = list;
    setList((l) => l.map((u) => (u.userId === user.userId ? { ...u, role } : u)));
    startTransition(async () => {
      const result = await SetUserRole({ userId: user.userId, role });
      if (!result.success) {
        setList(before);
        return void toast.error(result.error);
      }
      toast.success(`${fullName(user)} est maintenant ${ROLE_LABELS[role].toLowerCase()}`);
      router.refresh();
    });
  }

  return (
    <section className="flex flex-col gap-[2.5rem]">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] lg:mx-0 lg:px-0">
          <SegmentedTabs
            label="Rôle"
            value={filter}
            onChange={setFilter}
            tabs={[
              { value: "all", label: `Tous (${count("all")})` },
              { value: "readers", label: `Lecteurs (${count("readers")})` },
              { value: "authors", label: `Auteurs (${count("authors")})` },
              { value: "admins", label: `Administrateurs (${count("admins")})` },
              { value: "inactive", label: `Inactifs (${count("inactive")})` },
            ]}
          />
        </div>
        <FilterField value={query} onChange={setQuery} label="Nom ou e-mail" />
      </div>

      {canEditRoles && selectable.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-card bg-field px-[1.5rem] py-4">
          <label className="flex cursor-pointer items-center gap-4 type-body font-medium text-subtle">
            <Checkbox
              checked={allShownSelected}
              onChange={() =>
                setSelected((prev) => {
                  const next = new Set(prev);
                  for (const u of selectable) {
                    if (allShownSelected) next.delete(u.userId);
                    else next.add(u.userId);
                  }
                  return next;
                })
              }
            />
            {selected.size > 0 ? `${fr(selected.size)} sélectionné${selected.size > 1 ? "s" : ""}` : "Sélectionner les lecteurs affichés"}
          </label>
          <AnimatePresence initial={false}>
            {selected.size > 0 && (
              <motion.span initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }} transition={{ duration: 0.2, ease: EASE_OUT }}>
                <Button variant="secondary" className="bg-white text-danger" disabled={pending} onClick={() => setConfirmDelete(true)}>
                  Supprimer {selected.size > 1 ? `ces ${fr(selected.size)} comptes` : "ce compte"}
                </Button>
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      )}

      {shown.length === 0 ? (
        <div className="mx-auto flex max-w-[36rem] flex-col items-center gap-[1.5rem] py-16 text-center">
          <User4FillIcon size={64} className="text-faint" />
          <p className="type-body font-medium text-faint">{query ? "Aucun utilisateur ne correspond à cette recherche." : "Aucun utilisateur avec ce rôle."}</p>
        </div>
      ) : (
        <ul key={filter} className="flex flex-col divide-y divide-canvas">
          <AnimatePresence initial={false}>
            {shown.map((user, i) => {
              const editable = canEditRoles && user.userId !== viewerId && user.role !== "4";
              return (
                <motion.li
                  key={user.userId}
                  layout="position"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE_OUT, delay: Math.min(i, 10) * 0.04 } }}
                  exit={{ opacity: 0, transition: { duration: 0.15 } }}
                  className="flex flex-wrap items-center gap-x-6 gap-y-4 py-6 lg:flex-nowrap"
                >
                  <div className="flex min-w-0 flex-1 basis-full flex-col gap-[0.4rem] lg:basis-auto">
                    <span className="flex min-w-0 items-center gap-4">
                      {canEditRoles && (
                        <span className="flex w-[2rem] shrink-0 justify-center">
                          {deletable(user) && <Checkbox checked={selected.has(user.userId)} onChange={() => toggle(user.userId)} label={`Sélectionner ${fullName(user)}`} />}
                        </span>
                      )}
                      <AuthorChip author={user} variant="page" />
                      {user.userId === viewerId && <span className="shrink-0 type-body text-faint">(vous)</span>}
                    </span>
                    <span className={cn("truncate type-body text-faint", canEditRoles ? "ml-[7rem]" : "ml-[3.5rem]")}>
                      {user.email} · inscrit le {formatBadgeDate(user.createdAt).toLowerCase()}
                    </span>
                  </div>

                  <div className="flex shrink-0 items-center gap-4 type-body text-subtle tabular-nums lg:w-[24rem] lg:gap-6">
                    {user.activity.published > 0 && (
                      <span className="flex items-center gap-[0.4rem]" title="Contenus publiés">
                        <QuillPenLineIcon size={16} className="text-faint" />
                        {fr(user.activity.published)}
                      </span>
                    )}
                    <span className="flex items-center gap-[0.4rem]" title="Commentaires">
                      <Comment2FillIcon size={16} className="text-faint" />
                      {fr(user.activity.comments)}
                    </span>
                    <span className="flex items-center gap-[0.4rem]" title="J'aime">
                      <HeartFillIcon size={16} className="text-faint" />
                      {fr(user.activity.likes)}
                    </span>
                    <span className="flex items-center gap-[0.4rem]" title="Enregistrements">
                      <BookmarksFillIcon size={16} className="text-faint" />
                      {fr(user.activity.saves)}
                    </span>
                    <span title={user.subscribed ? "Abonné à la newsletter" : "Pas abonné à la newsletter"} className={cn("flex", user.subscribed ? "text-success" : "text-divider")}>
                      <MailOpenFillIcon size={16} />
                    </span>
                  </div>

                  <div className="ml-auto flex shrink-0 items-center gap-4 lg:w-[30rem] lg:justify-end">
                    <Badge className={ROLE_BADGE[user.role]} iconClassName="">
                      {ROLE_LABELS[user.role]}
                    </Badge>
                    {editable && (
                      <Button variant="secondary" disabled={pending} onClick={() => setEditing(user)}>
                        Changer le rôle
                      </Button>
                    )}
                  </div>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      )}

      <Modal
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title={selected.size > 1 ? `Supprimer ${fr(selected.size)} comptes ?` : "Supprimer ce compte ?"}
        description="Suppression définitive, avec les commentaires, j'aime et enregistrements de ces comptes. Les personnes pourront se réinscrire."
      >
        <ModalActions>
          <ModalBackButton>Annuler</ModalBackButton>
          <div className="lg:w-[32rem]">
            <Button size="lg" className="w-full" disabled={pending} onClick={deleteSelected}>
              Supprimer définitivement
            </Button>
          </div>
        </ModalActions>
      </Modal>

      {editing && <RoleDialog key={editing.userId} user={editing} pending={pending} onClose={() => setEditing(null)} onConfirm={(role) => changeRole(editing, role)} />}
    </section>
  );
}

// The three assignable roles as radio cards; the current one is preselected.
function RoleDialog({ user, pending, onClose, onConfirm }: { user: AdminUser; pending: boolean; onClose: () => void; onConfirm: (role: "1" | "2" | "3") => void }) {
  const [role, setRole] = useState<"1" | "2" | "3">(user.role === "4" ? "3" : user.role);
  const granting = role === "3" && user.role !== "3";
  return (
    <Modal open onOpenChange={(open) => !open && onClose()} title={`Rôle de ${fullName(user)}`} description="Le changement s'applique immédiatement, sur tous ses appareils.">
      <div role="radiogroup" aria-label="Rôle" className="flex flex-col gap-4">
        {ASSIGNABLE.map((option) => {
          const checked = option.role === role;
          return (
            <button
              key={option.role}
              type="button"
              role="radio"
              aria-checked={checked}
              onClick={() => setRole(option.role)}
              className={cn(
                "flex cursor-pointer items-start gap-4 rounded-card border-[1.5px] p-4 text-left transition-colors",
                checked ? "border-secondary-base bg-secondary-100" : "border-canvas hover:border-divider",
              )}
            >
              <span className={cn("mt-[0.3rem] flex size-[1.6rem] shrink-0 items-center justify-center rounded-pill border-2", checked ? "border-primary-base" : "border-divider")}>
                {checked && <motion.span layoutId="role-dot" className="size-[0.8rem] rounded-pill bg-primary-base" />}
              </span>
              <span className="flex flex-col gap-[0.2rem]">
                <span className="type-body-lg font-medium text-ink">
                  {ROLE_LABELS[option.role]}
                  {option.role === user.role && <span className="font-normal text-faint"> · actuel</span>}
                </span>
                <span className="type-body text-faint">{option.description}</span>
              </span>
            </button>
          );
        })}
      </div>
      {granting && <p className="type-body text-subtle">Un administrateur peut modifier ou archiver tout contenu, modérer les commentaires et envoyer la newsletter.</p>}
      <ModalActions>
        <ModalBackButton>Annuler</ModalBackButton>
        <div className="lg:w-[32rem]">
          <Button size="lg" className="w-full" disabled={pending || role === user.role} onClick={() => onConfirm(role)}>
            Enregistrer
          </Button>
        </div>
      </ModalActions>
    </Modal>
  );
}

// A 20px square checkbox in the site's colours (lime when checked).
function Checkbox({ checked, onChange, label }: { checked: boolean; onChange: () => void; label?: string }) {
  return (
    <span className="relative flex size-[2rem] shrink-0">
      <input type="checkbox" checked={checked} onChange={onChange} aria-label={label} className="peer absolute inset-0 cursor-pointer opacity-0" />
      <span
        aria-hidden
        className={cn(
          "pointer-events-none flex size-full items-center justify-center rounded-[0.4rem] border-[1.5px] transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-focus-ring",
          checked ? "border-primary-base bg-secondary-base text-primary-base" : "border-divider bg-white",
        )}
      >
        {checked && <CheckFillIcon size={14} />}
      </span>
    </span>
  );
}
