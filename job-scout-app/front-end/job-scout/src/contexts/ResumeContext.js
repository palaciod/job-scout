import React, { createContext, useContext, useState, useEffect } from "react";

const ResumeContext = createContext();

export const ResumeProvider = ({ children }) => {
  const [resumeText, setResumeText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchResume = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("http://localhost:3000/resume");

      if (!res.ok) {
        throw new Error("Failed to fetch parsed resume");
      }

      const data = await res.json();
      setResumeText(data.text || "");
    } catch (err) {
      console.error("Error fetching resume:", err);
      setError(err);
      setResumeText("");
    } finally {
      setLoading(false);
    }
  };

  const updateResumeText = (newText) => {
    setResumeText(newText);
  };

  useEffect(() => {
    fetchResume();
  }, []);

  return (
    <ResumeContext.Provider
      value={{
        resumeText,
        loading,
        error,
        refreshResume: fetchResume,
        updateResumeText,
      }}
    >
      {children}
    </ResumeContext.Provider>
  );
};

export const useResume = () => useContext(ResumeContext);
