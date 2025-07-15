import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getTheme } from "../theme/theme";

const ProfileContext = createContext();

export const useProfile = () => useContext(ProfileContext);

export const ProfileProvider = ({ children }) => {
  const [profile, setProfile] = useState({});
  const [loading, setLoading] = useState(true);

  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const fallbackMode = prefersDark ? "dark" : "light";

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("http://localhost:3000/profile");
        if (!res.ok) throw new Error("Failed to fetch profile");

        const data = await res.json();
        setProfile(data);
      } catch (err) {
        console.error("Error fetching profile:", err);
        setProfile({ theme: fallbackMode });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const updateProfile = async (updates) => {
    try {
      const res = await fetch("http://localhost:3000/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      if (!res.ok) throw new Error("Failed to update profile");

      const data = await res.json();
      setProfile(data.profile);
    } catch (err) {
      console.error("Error updating profile:", err);
    }
  };

  const mode = profile.theme || fallbackMode;
  const theme = useMemo(() => getTheme(mode), [mode]);

  const toggleTheme = () => {
    const newTheme = mode === "light" ? "dark" : "light";
    updateProfile({ theme: newTheme });
  };

  return (
    <ProfileContext.Provider
      value={{ profile, updateProfile, loading, mode, theme, toggleTheme }}
    >
      {children}
    </ProfileContext.Provider>
  );
};
