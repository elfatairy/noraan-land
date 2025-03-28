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

  const { execute: getAllStudents, isLoading: isLoadingAll } = useGetAllStudents();
  const { execute: getEnrolledStudents } = useGetEnrolledStudents();
  const { execute: getCourses } = useGetCourses();
  const { execute: getGroups } = useGetGroups();
  const { execute: getCourseNewStudents } = useGetCourseNewStudents();
  const { execute: getCoursePrivateStudents } = useGetCoursePrivateStudents();
  const { execute: getCourseGroupStudents } = useGetCourseGroupStudents();
  const { execute: getAppliedNewStudents } = useGetAppliedNewStudents();

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

  const handleFilterChange = async () => {
    try {
      let response;
      if (selectedStatus === 'new') {
        if (selectedCourse) {
          response = await getCourseNewStudents(selectedCourse);
        } else {
          response = await getAppliedNewStudents();
        }
      } else if (selectedStatus === 'enrolled') {
        if (selectedCourse) {
          if (selectedType === 'private') {
            response = await getCoursePrivateStudents(selectedCourse);
          } else if (selectedType === 'group' && selectedGroup) {
            response = await getCourseGroupStudents(selectedCourse, selectedGroup);
          }
        } else {
          response = await getEnrolledStudents();
        }
      }
      
      if (response) {
        const studentsData = response.value.data.students || response.value.data.newStudents;
        setStudents(studentsData);
      }
    } catch (error) {
      console.error('Error applying filters:', error);
    }
  };

  useEffect(() => {
    if (selectedCourse && selectedStatus === 'enrolled' && selectedType === 'group') {
      fetchGroups(selectedCourse);
    }
  }, [selectedCourse, selectedStatus, selectedType]);

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStudentClick = (studentId) => {
    navigate(`/admin/students/${studentId}`);
  };

  return (
    <div className="students-container">
      <div className="header">
        <div className="search-bar">
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
        {isLoadingAll ? (
          <div className="loading">Loading...</div>
        ) : (
          filteredStudents.map(student => (
            <div 
              key={student.id} 
              className="student-card"
              onClick={() => handleStudentClick(student.id)}
            >
              <h3>{student.name}</h3>
              <div className="student-info">
                <p><strong>Email:</strong> {student.email}</p>
                <p><strong>Phone:</strong> {student.phone}</p>
                <div className="info-row">
                  <p><strong>Age:</strong> {student.age}</p>
                  <p><strong>Gender:</strong> {student.gender}</p>
                </div>
                <p><strong>Location:</strong> {student.location}</p>
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
          ))
        )}
      </div>
    </div>
  );
};

export default StudentsManagement;