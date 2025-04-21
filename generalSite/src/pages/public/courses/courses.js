import React, { useState, useEffect } from 'react';
import { useGetCourses } from '../../../hooks/getcourseshook';
import { useApplyForCourse } from '../../../hooks/applyforcourse';
import Loading from '../../../components/loading/loading';
import { toast } from 'react-toastify';
import { FaGraduationCap } from 'react-icons/fa';
import './courses.css';
import { getStorageData } from '../../../utils/data';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [enrollmentData, setEnrollmentData] = useState({
    availableTime: '',
    studentNotes: '',
    sessionType: 'GROUP'
  });

  const { execute: getCourses, isLoading: isLoadingGet } = useGetCourses();
  const { execute: applyForCourse, isLoading: isLoadingApply } = useApplyForCourse();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await getCourses();
      setCourses(response.data.courses);
    } catch (error) {
      toast.error('Failed to fetch courses');
    }
  };

  const handleEnrollClick = (course) => {
    setSelectedCourse(course);
    setIsEnrollModalOpen(true);
  };

  const handleEnrollSubmit = async (e) => {
    e.preventDefault();
    if (!enrollmentData.availableTime) {
      toast.error('Please provide your available time');
      return;
    }

    try {
      // Get timezone from localStorage and add to the beginning of studentNotes
      const timezone = getStorageData('timezone') || '';
      const notes = enrollmentData.studentNotes;
      const formattedNotes = timezone ? `${timezone}, ${notes}` : notes;
      
      await applyForCourse({
        courseId: selectedCourse.id,
        availableTime: enrollmentData.availableTime,
        sessionType: enrollmentData.sessionType,
        studentNotes: formattedNotes
      });
      toast.success('Enrollment request submitted successfully!');
      handleCloseModal();
    } catch (error) {
      toast.error('Failed to submit enrollment request');
    }
  };

  const handleCloseModal = () => {
    setIsEnrollModalOpen(false);
    setSelectedCourse(null);
    setEnrollmentData({
      availableTime: '',
      studentNotes: '',
      sessionType: 'GROUP'
    });
  };

  const filteredCourses = courses.filter(course => 
    course.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoadingGet) {
    return <Loading isVisible={true} />;
  }

  return (
    <div className="courses-page">
      <div className="header">
        <h1>Our Courses</h1>
        <div className="search-container">
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
        {filteredCourses.map(course => (
          <div key={course.id} className="course-card">
            <div className="card-content">
              <h3 className="course-title">{course.name}</h3>
              <p className="course-description">{course.description}</p>
              <div className="course-details">
                <div className="price-section">
                  <div className="price-item">
                    <span className="price-label">Group</span>
                    <span className="price-value">${course.groupPrice}</span>
                  </div>
                  <div className="price-item">
                    <span className="price-label">Private</span>
                    <span className="price-value">${course.privatePrice}</span>
                  </div>
                </div>
                <button 
                  className="enroll-button"
                  onClick={() => handleEnrollClick(course)}
                >
                  <FaGraduationCap />
                  <span>Enroll Now</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isEnrollModalOpen && selectedCourse && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Enroll in {selectedCourse.name}</h2>
            <form onSubmit={handleEnrollSubmit}>
              <div className="session-type">
                <label>Session Type:</label>
                <div className="radio-group">
                  <label>
                    <input
                      type="radio"
                      value="GROUP"
                      checked={enrollmentData.sessionType === 'GROUP'}
                      onChange={e => setEnrollmentData({
                        ...enrollmentData,
                        sessionType: e.target.value
                      })}
                    />
                    Group (${selectedCourse.groupPrice})
                  </label>
                  <label>
                    <input
                      type="radio"
                      value="PRIVATE"
                      checked={enrollmentData.sessionType === 'PRIVATE'}
                      onChange={e => setEnrollmentData({
                        ...enrollmentData,
                        sessionType: e.target.value
                      })}
                    />
                    Private (${selectedCourse.privatePrice})
                  </label>
                </div>
              </div>
              <textarea
                placeholder="Available Times (e.g., Weekdays 6-9 PM)"
                value={enrollmentData.availableTime}
                onChange={e => setEnrollmentData({
                  ...enrollmentData,
                  availableTime: e.target.value
                })}
                required
              />
              <textarea
                placeholder="Additional Notes"
                value={enrollmentData.studentNotes}
                onChange={e => setEnrollmentData({
                  ...enrollmentData,
                  studentNotes: e.target.value
                })}
              />
              <div className="modal-buttons">
                <button 
                  type="submit" 
                  disabled={isLoadingApply}
                  className="submit-button"
                >
                  {isLoadingApply ? 'Submitting...' : 'Submit Enrollment'}
                </button>
                <button 
                  type="button" 
                  onClick={handleCloseModal}
                  className="cancel-button"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Courses;