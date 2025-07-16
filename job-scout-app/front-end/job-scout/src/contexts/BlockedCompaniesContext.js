import React, { createContext, useContext, useEffect, useState } from "react";

const BlockedCompaniesContext = createContext();

export const useBlockedCompanies = () => useContext(BlockedCompaniesContext);

export const BlockedCompaniesProvider = ({ children }) => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const BASE_URL = "http://localhost:3000";

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/blocked`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to fetch companies");

      setCompanies(data.companies);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addCompany = async (newCompany) => {
  try {
    const res = await fetch(`${BASE_URL}/blocked`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ company: newCompany }),
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.error || "Failed to add company");

    setCompanies(data.companies);
    setError(null);
  } catch (err) {
    console.error(err);
    setError(err.message);
  }
};


  const removeCompany = async (name) => {
    try {
      const res = await fetch(
        `${BASE_URL}/blocked?name=${encodeURIComponent(name)}`,
        { method: "DELETE" }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to remove company");
      }

      setCompanies((prev) =>
        prev.filter((c) => c.toLowerCase() !== name.toLowerCase())
      );
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  return (
    <BlockedCompaniesContext.Provider
      value={{
        companies,
        loading,
        error,
        fetchCompanies,
        addCompany,
        removeCompany,
      }}
    >
      {children}
    </BlockedCompaniesContext.Provider>
  );
};
