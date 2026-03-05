import { Modal } from "@mui/material";
import React from "react";

export default function NewAccountConfirm({
  accountType,
}: {
  accountType: string | null;
}) {
  const handleYes = () => {
    alert(accountType)
    const redirectToPage = window.location.href.split("?")[0]; // remove any query params
    const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/login/${accountType}?redirect=${redirectToPage}&create_user=true`;
    alert(url)
    window.location.href = url;
  };

  const handleNo = () => {
    window.history.back();
  };

  return (
    <Modal open={true}>
      <div className="fixed inset-0 flex items-center justify-center">
        <div
          className="w-[400px] rounded-lg shadow-xl p-6"
          style={{
            backgroundColor: "var(--background)",
            color: "var(--foreground)",
            border: "1px solid var(--border)",
          }}
        >
          <h2 className="text-lg font-semibold">Create a new account?</h2>

          <p className="mt-2" style={{ color: "var(--muted)" }}>
            No account was found for this login. Would you like to create one?
          </p>

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={handleNo}
              className="px-4 py-2 rounded-md border"
              style={{
                borderColor: "var(--border)",
              }}
            >
              No
            </button>

            <button
              onClick={handleYes}
              className="px-4 py-2 rounded-md text-white"
              style={{
                backgroundColor: "var(--primary)",
              }}
            >
              Yes
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
