import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const JobDataContext = createContext();

export const JobDataProvider = ({ children }) => {
  const [jobs, setJobs] = useState([]);
  const [searchString, setSearchString] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("http://localhost:3000/jobs/");
      const data = await res.json();
      setJobs(data?.jobs || []);
    } catch (err) {
      console.error(err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const jobMatchesSearch = (jobWrapper, searchString) => {
    const lowerSearch = searchString.toLowerCase();
    const job = jobWrapper.job;
    if (!job) return false;

    const excludedKeys = [
      "fit",
      "applicantCount",
      "entryLevelPercent",
      "seniorLevelPercent",
      "yearsRequired",
      "reason",
    ];

    return Object.entries(job).some(([key, value]) => {
      if (excludedKeys.includes(key)) return false;

      if (
        typeof value === "string" &&
        value.toLowerCase().includes(lowerSearch)
      ) {
        return true;
      }

      if (Array.isArray(value)) {
        return value.some(
          (item) =>
            typeof item === "string" && item.toLowerCase().includes(lowerSearch)
        );
      }

      return false;
    });
  };

  const filteredJobs = useMemo(() => {
    if (!searchString) return jobs;
    return jobs.filter((jobWrapper) =>
      jobMatchesSearch(jobWrapper, searchString)
    );
  }, [jobs, searchString]);

  useEffect(() => {
    fetchJobs();
  }, []);

  const applySearch = (search) => {
    setSearchString(search);
  };

  return (
    <JobDataContext.Provider
      value={{
        jobs,
        filteredJobs,
        loading,
        error,
        refetch: fetchJobs,
        applySearch,
      }}
    >
      {children}
    </JobDataContext.Provider>
  );
};

export const useJobData = () => useContext(JobDataContext);
