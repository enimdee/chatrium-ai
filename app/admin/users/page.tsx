"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { addUser, removeUser, setUserRole, type UsersActionState } from "./actions";

interface UserRow {
  email: string;
  role: "admin" | "staff";
  isEnvAdmin: boolean; // from ADMIN_EMAIL env var — cannot be removed
}

const initial: UsersActionState = { status: "idle" };

export default function UsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [state, formAction, pending] = useActionState(addUser, initial);
  const [, startTransition] = useTransition();

  async function loadUsers() {
    try {
      const r = await fetch("/api/admin/users");
      const d = (await r.json()) as { users: UserRow[] };
      setUsers(d.users);
    } catch {/* ignore */}
    setLoading(false);
  }

  useEffect(() => { void loadUsers(); }, []);
  useEffect(() => {
    if (state.status === "success") void loadUsers();
  }, [state]);

  function handleRemove(email: string) {
    startTransition(async () => {
      await removeUser(email);
      await loadUsers();
    });
  }

  function handleRoleToggle(email: string, currentRole: "admin" | "staff") {
    const next = currentRole === "admin" ? "staff" : "admin";
    startTransition(async () => {
      await setUserRole(email, next);
      await loadUsers();
    });
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Users</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage who can sign in. Staff can use the compose page; admins can also access
          Admin Settings.
        </p>
      </div>

      {state.status === "success" && (
        <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800">
          ✓ {state.message}
        </div>
      )}
      {state.status === "error" && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
          ✗ {state.message}
        </div>
      )}

      {/* Add user */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-4">
        <h2 className="text-sm font-semibold text-gray-700">Invite User</h2>
        <form action={formAction} className="flex flex-wrap gap-3 items-end">
          <div className="space-y-1 flex-1 min-w-[200px]">
            <label className="text-xs font-medium text-gray-600">Email Address</label>
            <input
              name="email"
              type="email"
              required
              placeholder="colleague@yourhotel.com"
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-300"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600">Role</label>
            <select
              name="role"
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-300"
            >
              <option value="staff">Staff (compose only)</option>
              <option value="admin">Admin (full access)</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={pending}
            className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold transition-colors disabled:opacity-50"
          >
            {pending ? "Adding…" : "Add User"}
          </button>
        </form>
      </div>

      {/* User list */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-3">
        <h2 className="text-sm font-semibold text-gray-700">
          Allowed Users{" "}
          <span className="text-gray-400 font-normal">({users.length})</span>
        </h2>

        {loading ? (
          <p className="text-sm text-gray-400 animate-pulse">Loading…</p>
        ) : users.length === 0 ? (
          <div className="text-sm text-gray-500 py-4 text-center rounded-lg border border-dashed border-gray-200">
            No users configured yet.{" "}
            <span className="text-gray-400">
              In bootstrap mode, anyone can sign in as admin.
            </span>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {users.map((u) => (
              <div key={u.email} className="flex items-center justify-between py-3 gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                    style={{
                      background: u.role === "admin" ? "#fef3c7" : "#f3f4f6",
                      color: u.role === "admin" ? "#92400e" : "#374151",
                    }}
                  >
                    {u.email.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{u.email}</p>
                    {u.isEnvAdmin && (
                      <p className="text-xs text-amber-600">Bootstrap admin (ADMIN_EMAIL env)</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Role badge / toggle */}
                  <button
                    onClick={() => handleRoleToggle(u.email, u.role)}
                    disabled={u.isEnvAdmin}
                    className="text-xs px-2.5 py-1 rounded-full font-medium transition-colors disabled:cursor-default"
                    style={{
                      background: u.role === "admin" ? "#fef3c7" : "#f3f4f6",
                      color: u.role === "admin" ? "#92400e" : "#374151",
                    }}
                    title={u.isEnvAdmin ? "Set via ADMIN_EMAIL env var" : "Click to toggle role"}
                  >
                    {u.role === "admin" ? "👑 Admin" : "Staff"}
                  </button>

                  {!u.isEnvAdmin && (
                    <button
                      onClick={() => handleRemove(u.email)}
                      className="text-xs text-gray-400 hover:text-red-600 transition-colors px-2 py-1 rounded"
                      title="Remove user"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div
        className="rounded-lg px-4 py-3 text-xs"
        style={{ background: "#fffbeb", border: "1px solid #fcd34d", color: "#78350f" }}
      >
        <strong>Tip:</strong> Set <code className="font-mono bg-yellow-100 px-1 rounded">ADMIN_EMAIL</code> in your
        environment as a permanent bootstrap admin. This email always has access even if
        settings.json is lost.
      </div>
    </div>
  );
}
