import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useGetCourseUsers } from '../../../../hooks/getcourseusers';
import Loading from '../../../../components/loading/loading';
import { toast } from 'react-toastify';
import './student.css';

const Students = () => {
  const { id: courseId } = useParams();
  const [activeTab, setActiveTab] = useState('individual');
  const [students, setStudents] = useState([]);
  const { execute: getCourseUsers, isLoading } = useGetCourseUsers();

  useEffect(() => {
    fetchStudents(activeTab);
  }, [activeTab, courseId]);

  const fetchStudents = async (type) => {
    try {
      const response = await getCourseUsers(courseId, type);
      // Handle different response structures
      const studentsData = type === 'new' ? 
        response.data.newUsers : 
        response.data.courseUsers;
      
      setStudents(studentsData || []);
    } catch (error) {
      toast.error('Failed to fetch students');
      setStudents([]);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Render function with null check
  const renderStudents = () => {
    if (!students || students.length === 0) {
      return <div className="no-students">No students found</div>;
    }

    return students.map((student) => (
      <div key={student.id} className="student-card">
        <div className="student-header">
        <h3>Student Name: {student.user.name} <br></br>Student ID: {student.userId}</h3>
        <span className={`status-badge ${student.subscribtionStatus}`}>
            {student.subscribtionStatus}
          </span>
        </div>
        <div className="student-details">
          <p><strong>Session Type:</strong> {student.sessionType}</p>
          {student.availableTime && (
            <p><strong>Available Time:</strong> {student.availableTime}</p>
          )}
          {student.userNotes && (
            <p><strong>Notes:</strong> {student.userNotes}</p>
          )}
          <p><strong>Joined:</strong> {formatDate(student.createdAt)}</p>
        </div>
      </div>
    ));
  };

  if (isLoading) return <Loading isVisible={true} />;

  return (
    <div className="students-container">
      <div className="students-header">
        <h2>Course Students</h2>
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'individual' ? 'active' : ''}`}
            onClick={() => setActiveTab('individual')}
          >
            Individual
          </button>
          <button 
            className={`tab ${activeTab === 'group' ? 'active' : ''}`}
            onClick={() => setActiveTab('group')}
          >
            Group
          </button>
          <button 
            className={`tab ${activeTab === 'new' ? 'active' : ''}`}
            onClick={() => setActiveTab('new')}
          >
            New Requests
          </button>
        </div>
      </div>

      <div className="students-list">
        {renderStudents()}
      </div>
    </div>
  );
};

export default Students;