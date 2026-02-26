"use client";
import { Uselogout } from "@/hooks/UseLogout";
import React from "react";

const LogoutButton = () => {
  const { logout } = Uselogout();

  const handleLogoutClick = () => {
    logout();
  };

  return (
    <button
      onClick={handleLogoutClick}
      className="text-button-Text bg-button-Primary hover:bg-button-Hover hover:border-b-button-HoverSecondary border-b-4 rounded-md border-b-button-Secondary px-6 py-1.5 text-xs font-semibold"
    >
      Logout
    </button>
  );
};

export default LogoutButton;
