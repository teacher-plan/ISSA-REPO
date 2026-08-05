import { logout } from "@/app/auth/login/actions";

export function LogoutButton() {
  return (
    <form action={logout}>
      <button
        type="submit"
        className="rounded-full border border-primary-300 px-4 py-1.5 text-sm font-medium transition-colors hover:bg-primary-100 dark:border-primary-700 dark:hover:bg-primary-800"
      >
        تسجيل الخروج
      </button>
    </form>
  );
}
