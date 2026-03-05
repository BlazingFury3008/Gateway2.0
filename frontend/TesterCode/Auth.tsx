// This is a simple test page to verify that the authentication flow works correctly.

"use client";

const BACKEND = "http://localhost:5000";

export default function Home() {
  const loginDiscord = () => {
    window.location.href = `${BACKEND}/auth/login/discord`;
  };

  const loginGoogle = () => {
    window.location.href = `${BACKEND}/auth/login/google`;
  };

  const logout = async () => {
    await fetch(`${BACKEND}/auth/logout_token`, {
      method: "POST",
      credentials: "include",
    });

    // Optional: refresh page or redirect
    window.location.reload();
  };

  return (
    <div className="flex flex-col gap-4 p-6">
      <button
        onClick={loginDiscord}
        className="px-4 py-2 bg-indigo-600 text-white rounded"
      >
        Login with Discord
      </button>
      <button
        onClick={loginGoogle}
        className="px-4 py-2 bg-green-600 text-white rounded"
      >
        Login with Google
      </button>

      <button
        onClick={async () => {
    await fetch(`${BACKEND}/auth/logout_token`, {
      method: "POST",
      credentials: "include",
    });

    // Optional: refresh page or redirect
    window.location.reload();
  }}
        className="px-4 py-2 bg-gray-700 text-white rounded"
      >
        Logout
      </button>
    </div>
  );
}
