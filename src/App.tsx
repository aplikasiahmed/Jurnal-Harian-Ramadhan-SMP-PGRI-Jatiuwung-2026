import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import StudentEntry from './pages/StudentEntry';
import TeacherLogin from './pages/TeacherLogin';
import TeacherDashboard from './pages/TeacherDashboard';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<StudentEntry />} />
        <Route path="/login" element={<TeacherLogin />} />
        <Route path="/dashboard" element={<TeacherDashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
