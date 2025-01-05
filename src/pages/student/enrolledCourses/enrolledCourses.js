import React, { useState, useEffect } from 'react';
import { useGetCourses } from '../../../hooks/getcourseshook';
import Loading from '../../../components/loading/loading';
import moment from 'moment';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { FaCalendar, FaBook, FaQuestionCircle } from 'react-icons/fa';
import './enrolledCourses.css';

const EnrolledCourses = () => {
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { execute: getCourses, isLoading } = useGetCourses();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await getCourses();
      if (response?.data?.courses) {
        setCourses(response.data.courses);
      }
    } catch (error) {
      toast.error('Failed to fetch courses');
    }
  };

  const filteredCourses = courses.filter(course => 
    course.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) return <Loading isVisible={true} />;

  return (
    <div className="courses-container">
      <div className="header">
        <input
          type="text"
          placeholder="Search courses..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="courses-grid">
        {filteredCourses.map(course => (
          <div key={course.id} className="course-card">
            <div className="card-header">
              <h3>{course.name}</h3>
            </div>
            <p>{course.description}</p>
            <div className="price-info">
              <span>Group: ${course.groupPrice}</span>
              <span>Individual: ${course.individualPrice}</span>
            </div>
            <div className="date-info">
              <span>Enrolled: {moment(course.createdAt).format('DD/MM/YYYY hh:mm A')}</span>
            </div>
            <div className="card-actions">
              <button 
                onClick={() => navigate(`/student/courses/${course.id}/sessions`)}
                className="action-button sessions"
              >
                <FaCalendar /> Sessions
              </button>
              <button 
                onClick={() => navigate(`/student/courses/${course.id}/materials/files`)}
                className="action-button materials"
              >
                <FaBook /> Files
              </button>
              <button 
                onClick={() => navigate(`/student/courses/${course.id}/materials/quizez`)}
                className="action-button quizez"
              >
                <FaQuestionCircle /> Quizez
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EnrolledCourses;