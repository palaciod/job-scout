import React, { createContext, useContext, useEffect, useState } from "react";

const JobDataContext = createContext();

export const JobDataProvider = ({ children }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3000/jobs/"); 
      const data = await res.json();
      setJobs(data?.jobs);
    } catch (err) {
      console.error(err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  return (
    <JobDataContext.Provider
      value={{ jobs, loading, error, refetch: fetchJobs }}
    >
      {children}
    </JobDataContext.Provider>
  );
};

export const useJobData = () => useContext(JobDataContext);
