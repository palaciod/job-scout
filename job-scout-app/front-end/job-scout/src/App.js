import "./App.css";
import React from "react";
import { Routes, Route } from "react-router-dom";
import JobBoard from "./components/pages/JobBoard/JobBoard";
import NotFoundPage from "./components/pages/NotFound/NotFound";
import Layout from "./Layout/Layout";
import ContextWrapper from "./contexts/ContextWrapper";

const App = () => {
  return (
    <ContextWrapper>
      <Routes>
        <Route
          path="/"
          element={
            <Layout>
              <JobBoard />
            </Layout>
          }
        />
        <Route
          path="/job-board"
          element={
            <Layout>
              <JobBoard />
            </Layout>
          }
        />
        <Route
          path="/job/:id"
          element={
            <Layout>
              <JobBoard />
            </Layout>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </ContextWrapper>
  );
};

export default App;
