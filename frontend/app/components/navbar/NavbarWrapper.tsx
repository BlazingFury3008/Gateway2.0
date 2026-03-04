"use client";

import { useEffect, useState } from "react";
import Navbar from "./Navbar";

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

  return (
    <>
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkTheme} />
      {children}
    </>
  );
}