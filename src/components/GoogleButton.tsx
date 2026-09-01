import { signInWithGoogle } from "@/lib/actions/auth";

export function GoogleButton() {
  return (
    <form action={signInWithGoogle}>
      <button
        type="submit"
        className="flex h-10 w-full items-center justify-center gap-2 rounded-control border border-line-strong text-sm font-semibold text-ink transition hover:bg-line-soft"
      >
        <svg viewBox="0 0 48 48" className="h-4 w-4" aria-hidden="true">
          <path
            fill="#FFC107"
            d="M43.6 20.5H42V20.5H24v7h11.3C33.9 31.7 29.4 35 24 35c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5-5C33.6 5.9 29.1 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.4-.4-3.5z"
          />
          <path
            fill="#FF3D00"
            d="m6.3 14.7 5.7 4.2C13.6 15.1 18.4 12 24 12c3.1 0 5.9 1.2 8 3.1l5-5C33.6 5.9 29.1 4 24 4c-7.4 0-13.8 4.1-17.1 10.1z"
          />
          <path
            fill="#4CAF50"
            d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.3 26.7 36 24 36c-5.3 0-9.8-3.3-11.4-8l-6.2 4.8C9.9 39.6 16.4 44 24 44z"
          />
          <path
            fill="#1976D2"
            d="M43.6 20.5H42V20.5H24v7h11.3c-.7 2-2 3.7-3.7 5l6.2 5.2C40.4 35.1 44 30 44 24c0-1.2-.1-2.4-.4-3.5z"
          />
        </svg>
        Continuar con Google
      </button>
    </form>
  );
}
