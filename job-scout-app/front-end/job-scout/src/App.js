import "./App.css";
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import JobBoard from "./components/pages/JobBoard/JobBoard";
import NotFoundPage from "./components/pages/NotFound/NotFound";
import Layout from "./Layout/Layout";
import ContextWrapper from "./contexts/ContextWrapper";
import UploadPage from "./components/pages/UploadPage/UploadPage";
import BlockedCompanies from "./components/pages/BlockedCompanies/BlockedCompanies";
import { useResume } from "./contexts/ResumeContext";

const ProtectedRoute = ({ children }) => {
  const { resumeText, loading } = useResume();

  if (loading) return null;

  if (!resumeText) {
    return <Navigate to="/upload-resume" replace />;
  }

  return children;
};

const App = () => {
  return (
    <ContextWrapper>
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout>
                <JobBoard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/job-board"
          element={
            <ProtectedRoute>
              <Layout>
                <JobBoard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/upload-resume"
          element={
            <Layout>
              <UploadPage />
            </Layout>
          }
        />
        <Route
          path="/blocked-companies"
          element={
            <ProtectedRoute>
              <Layout>
                <BlockedCompanies />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/trash"
          element={
            <ProtectedRoute>
              <Layout>
                <JobBoard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/job/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <JobBoard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </ContextWrapper>
  );
};

export default App;
