import React, { useState, useEffect } from 'react';
import { useGetCourses } from '../../../hooks/getcourseshook';
import { useApplyForCourse } from '../../../hooks/applyforcourse';
import Loading from '../../../components/loading/loading';
import moment from 'moment';
import { toast } from 'react-toastify';
import { FaGraduationCap } from 'react-icons/fa';
import './courses.css';
import { CourseCard } from '../../../components/courseCard/courseCard';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const { execute: getCourses, isLoading: isLoadingGet } = useGetCourses();
  const [searchTerm, setSearchTerm] = useState('');


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

  const filteredCourses = courses.filter(course => 
    course.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoadingGet) {
    return <Loading isVisible={true} />;
  }

  return (
    <div className="courses-container">
      <div className="header">
        <h1>Courses</h1>
      </div>

      <div className="courses-grid">
        {filteredCourses.map(course => (
          <CourseCard course={course} />
        ))}
      </div>
    </div>
  );
};

export default Courses;