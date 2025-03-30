import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaSearch, FaWhatsapp } from 'react-icons/fa';
import { MdManageAccounts } from 'react-icons/md';
import { useGetCoursesOfStudent } from '../../../../hooks/newHooks/getCoursesOfStudent';
import './student.css';

const Student = () => {
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { studentId } = useParams();
  const navigate = useNavigate();
  const { execute: getStudentCourses, isLoading } = useGetCoursesOfStudent();

  useEffect(() => {
    fetchCourses();
    console.log('Student ID:', studentId);
    console.log('Courses:', courses);
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await getStudentCourses(studentId);
      console.log('Courses hihi:', response);
      if (response?.data?.courses) {
        setCourses(response.data.courses);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const filteredCourses = courses.filter(course =>
    course.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCourseClick = (course) => {
    const params = new URLSearchParams({
      sessionType: course.sessionType,
      price: course.sessionType === 'PRIVATE' ? course.privatePrice : course.groupPrice,
      hours: course.hours || 0,
      ...(course.sessionType === 'GROUP' && course.group && { group: course.group.id }) // Access group.name instead of group object
    });

    navigate(`/admin/students/${studentId}/courses/${course.id}?${params.toString()}`);
  };

  return (
    <div className="student-container">
      <div className="header">
        <div className="search-bar">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <div className="courses-grid">
        {isLoading ? (
          <div className="loading">Loading...</div>
        ) : (
          filteredCourses.map(course => (
            <div key={course.id} className="course-card">
              <div className="course-header">
                <h3>{course.name}</h3>
                <div className="badge-container">
                  <span className={`badge ${course.sessionType.toLowerCase()}`}>
                    {course.sessionType}
                  </span>
                </div>
              </div>
              <p className="description">{course.description}</p>
              <div className="course-footer">
                <button 
                  className="manage-button"
                  onClick={() => handleCourseClick(course)}
                >
                  Manage Course
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Student;
