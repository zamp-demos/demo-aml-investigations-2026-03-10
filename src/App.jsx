import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import DashboardLayout from './components/DashboardLayout';
import ProcessList from './components/ProcessList';
import ProcessDetails from './components/ProcessDetails';
import KnowledgeBase from './components/KnowledgeBase';
import People from './components/People';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/done" element={<DashboardLayout />}>
          <Route path="aml-investigations" element={<ProcessList category="AML Investigations" />} />
          <Route path="aml-investigations/:id" element={<ProcessDetails />} />
          <Route path="knowledge-base" element={<KnowledgeBase />} />
          <Route path="people" element={<People />} />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
