import React, { useState, useEffect } from 'react';
import { FaFilter, FaSearch, FaWhatsapp, FaBook } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useGetAllStudents } from '../../../../hooks/newHooks/getAllStudents';
import { useGetEnrolledStudents } from '../../../../hooks/newHooks/getEnrolledStudents';
import { useGetCourses } from '../../../../hooks/getcourseshook';
import { useGetGroups } from '../../../../hooks/newHooks/getGroupshook';
import { useGetCourseNewStudents } from '../../../../hooks/newHooks/getCourseNewStudents';
import { useGetCoursePrivateStudents } from '../../../../hooks/newHooks/getCoursePrivateStudents';
import { useGetCourseGroupStudents } from '../../../../hooks/newHooks/getCourseGroupStudents';
import { useGetAppliedNewStudents } from '../../../../hooks/newHooks/getAppliedNewStudents';
import Loading from "../../../../components/loading/loading";
import './studentsManagment.css';

const StudentsManagement = () => {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [courses, setCourses] = useState([]);
  const [groups, setGroups] = useState([]);
  const [error, setError] = useState('');

  const { execute: getAllStudents, isLoading: isLoadingAll } = useGetAllStudents();
  const { execute: getEnrolledStudents, isLoading: isLoadingEnrolled } = useGetEnrolledStudents();
  const { execute: getCourses, isLoading: isLoadingCourses } = useGetCourses();
  const { execute: getGroups, isLoading: isLoadingGroups } = useGetGroups();
  const { execute: getCourseNewStudents, isLoading: isLoadingNewStudents } = useGetCourseNewStudents();
  const { execute: getCoursePrivateStudents, isLoading: isLoadingPrivate } = useGetCoursePrivateStudents();
  const { execute: getCourseGroupStudents, isLoading: isLoadingGroupStudents } = useGetCourseGroupStudents();
  const { execute: getAppliedNewStudents, isLoading: isLoadingApplied } = useGetAppliedNewStudents();

  const navigate = useNavigate();

  useEffect(() => {
    fetchStudents();
    fetchCourses();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await getAllStudents();
      setStudents(response.data.students);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await getCourses();
      setCourses(response.data.courses);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchGroups = async (courseId) => {
    try {
      const response = await getGroups(courseId);
      setGroups(response.data.groups);
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };

  // Update the handleFilterChange function
  const handleFilterChange = async () => {
    setError('');
    try {
      let response;

      // Case 1: All students
      if (selectedStatus === 'all') {
        response = await getAllStudents();
        if (response?.data?.students) {
          setStudents(response.data.students);
        }
        return;
      }

      // Case 2: New students (without course)
      if (selectedStatus === 'new' && !selectedCourse) {
        response = await getAppliedNewStudents();
        if (response?.data?.newStudents) {
          setStudents(response.data.newStudents);
        }
        return;
      }

      // Case 3: New students with course
      if (selectedStatus === 'new' && selectedCourse) {
        if (!selectedCourse) {
          setError('Please select a course');
          return;
        }
        response = await getCourseNewStudents(selectedCourse);
        if (response?.data?.newStudents) {
          setStudents(response.data.newStudents);
        }
        return;
      }

      // Case 4: Enrolled students (without course)
      if (selectedStatus === 'enrolled' && !selectedCourse) {
        response = await getEnrolledStudents();
        if (response?.data?.students) {
          setStudents(response.data.students);
        }
        return;
      }

      // Case 5: Enrolled students with course and type
      if (selectedStatus === 'enrolled' && selectedCourse) {
        if (!selectedType) {
          setError('Please select a type (private/group)');
          return;
        }

        if (selectedType === 'private') {
          response = await getCoursePrivateStudents(selectedCourse);
          if (response?.data?.students) {
            setStudents(response.data.students);
          }
        } else if (selectedType === 'group') {
          if (!selectedGroup) {
            setError('Please select a group');
            return;
          }
          response = await getCourseGroupStudents(selectedCourse, selectedGroup);
          if (response?.data?.students) {
            setStudents(response.data.students);
          }
        }
      }
    } catch (error) {
      console.error('Error applying filters:', error);
      setError('Failed to fetch filtered results');
    }
  };

  // Update the useEffect to clear filters when status changes
  useEffect(() => {
    setSelectedCourse('');
    setSelectedType('');
    setSelectedGroup('');
    setError('');
  }, [selectedStatus]);

  useEffect(() => {
    if (selectedCourse && selectedStatus === 'enrolled' && selectedType === 'group') {
      fetchGroups(selectedCourse);
    }
  }, [selectedCourse, selectedStatus, selectedType]);

  // Update the filteredStudents logic to handle different response structures
  const filteredStudents = students.filter(student => {
    const studentName = student.student?.name || student.name || '';
    return studentName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleStudentClick = (studentId) => {
    navigate(`/admin/students/${studentId}`);
  };

  return (
    <div className="students-container">
      <div className="header">
        <div className="search-barr">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <FaFilter
            className="filter-icon"
            onClick={() => setShowFilters(!showFilters)}
          />
        </div>
      </div>

      {showFilters && (
        <div className="filters-container">
          {error && <div className="error-message">{error}</div>}
          <div className="filter-group">
            <label>Status:</label>
            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  value="all"
                  checked={selectedStatus === 'all'}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                />
                All
              </label>
              <label>
                <input
                  type="radio"
                  value="new"
                  checked={selectedStatus === 'new'}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                />
                New
              </label>
              <label>
                <input
                  type="radio"
                  value="enrolled"
                  checked={selectedStatus === 'enrolled'}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                />
                Enrolled
              </label>
            </div>
          </div>

          <div className="filter-group">
            <label>Course:</label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
            >
              <option value="">Select Course</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>{course.name}</option>
              ))}
            </select>
          </div>

          {selectedStatus === 'enrolled' && selectedCourse && (
            <div className="filter-group">
              <label>Type:</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                <option value="">Select Type</option>
                <option value="private">Private</option>
                <option value="group">Group</option>
              </select>
            </div>
          )}

          {selectedStatus === 'enrolled' && selectedType === 'group' && (
            <div className="filter-group">
              <label>Group:</label>
              <select
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
              >
                <option value="">Select Group</option>
                {groups.map(group => (
                  <option key={group.id} value={group.id}>{group.name}</option>
                ))}
              </select>
            </div>
          )}

          <button className="apply-filters" onClick={handleFilterChange}>
            Apply Filters
          </button>
        </div>
      )}

      <div className="students-grid">
        {(isLoadingAll || isLoadingNewStudents || isLoadingPrivate || 
          isLoadingGroupStudents || isLoadingApplied) ? (
          <Loading />
        ) : filteredStudents.length === 0 ? (
          <div className="no-results">No students found</div>
        ) : (
          filteredStudents.map(student => {
            const studentData = student.student || student;
            return (
              <div 
                key={student.id} 
                className="student-card"
                onClick={() => handleStudentClick(student.studentId || student.id)}
              >
                <h3>{studentData.name}</h3>
                <div className="student-info">
                  <p><strong>Email:</strong> {studentData.email}</p>
                  <p><strong>Phone:</strong> {studentData.phone}</p>
                  {student.preferredSessionType && (
                    <p><strong>Session Type:</strong> {student.preferredSessionType}</p>
                  )}
                  {student.availableTime && (
                    <p><strong>Available Time:</strong> {student.availableTime}</p>
                  )}
                  {student.hours && (
                    <p><strong>Hours:</strong> {student.hours}</p>
                  )}
                </div>
                <div className="card-actions">
                  <a 
                    href={`https://wa.me/${student.phone}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="action-button whatsapp"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <FaWhatsapp /> WhatsApp
                  </a>
                  <button 
                    className="action-button courses"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/admin/students/${student.id}`);
                    }}
                  >
                    <FaBook /> Courses
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default StudentsManagement;