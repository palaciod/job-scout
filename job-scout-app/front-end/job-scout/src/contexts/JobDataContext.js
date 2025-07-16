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
  const [trash, setTrash] = useState([]);
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

  const fetchTrashedJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("http://localhost:3000/jobs/get-trash-jobs");
      const data = await res.json();
      setTrash(data?.jobs || []);
    } catch (err) {
      console.error("❌ Failed to fetch trashed jobs:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const removeJob = async (url) => {
    try {
      const res = await fetch("http://localhost:3000/jobs/remove", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (!res.ok) {
        const err = await res.json();
        console.error("❌ Failed to remove job:", err);
        return;
      }
      await fetchJobs();
      await fetchTrashedJobs();
    } catch (err) {
      console.error("❌ Error while removing job:", err);
    }
  };

  const removeTrashedJob = async (url) => {
    try {
      const res = await fetch("http://localhost:3000/jobs/delete-trashed-job", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (!res.ok) {
        const err = await res.json();
        console.error("❌ Failed to remove job:", err);
        return;
      }
      fetchJobs();
    } catch (err) {
      console.error("❌ Error while removing job:", err);
    }
  };

  const jobMatchesSearch = (entry, searchString) => {
    const lowerSearch = searchString.toLowerCase();
    const job = entry?.job || entry; 

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

  const jobMatchesTrashSearch = (entry, searchString) => {
    const lowerSearch = searchString.toLowerCase();
    const job = entry;

    if (!job) return false;

    const excludedKeys = [
      "fit",
      "applicantCount",
      "entryLevelPercent",
      "seniorLevelPercent",
      "yearsRequired",
      "reason",
      "trashedAt",
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

  const restoreTrashedJob = async (url) => {
    try {
      const res = await fetch(
        "http://localhost:3000/jobs/restore-trashed-job",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        }
      );

      if (!res.ok) {
        const err = await res.json();
        console.error("❌ Failed to restore job:", err);
        return;
      }

      await fetchJobs();
      await fetchTrashedJobs();
      console.log(`✅ Restored job: ${url}`);
    } catch (err) {
      console.error("❌ Error while restoring job:", err);
    }
  };

  const filteredJobs = useMemo(() => {
    if (!searchString) return jobs;
    return jobs.filter((jobWrapper) =>
      jobMatchesSearch(jobWrapper, searchString)
    );
  }, [jobs, searchString]);

  const filteredTrash = useMemo(() => {
    if (!searchString) return trash;
    return trash.filter((entry) => jobMatchesTrashSearch(entry, searchString));
  }, [trash, searchString]);

  useEffect(() => {
    fetchJobs();
    fetchTrashedJobs();
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
        removeJob,
        removeTrashedJob,
        fetchTrashedJobs,
        trash,
        setTrash,
        filteredTrash,
        restoreTrashedJob,
      }}
    >
      {children}
    </JobDataContext.Provider>
  );
};

export const useJobData = () => useContext(JobDataContext);
