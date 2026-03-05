"use client";

import { useEffect, useState } from "react";
import Navbar from "./Navbar";
import { useSearchParams } from "next/navigation";
import NewAccountConfirm from "../modals/NewAccountConfirm";

export default function NavbarWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      darkMode ? "dark" : "light"
    );
  }, [darkMode]);

  const toggleDarkTheme = () => {
    setDarkMode((prev) => !prev);
  };

  const searchParams = useSearchParams();

  const signupError = searchParams.get("error");
  const accountType = searchParams.get("accountType");

  return (
    <>
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkTheme} />
      {signupError && (
        <NewAccountConfirm accountType={accountType} />
      )}
      {children}
    </>
  );
}