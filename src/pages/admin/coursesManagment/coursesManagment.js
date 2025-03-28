import React, { useState, useEffect } from 'react';
import { useGetCourses } from '../../../hooks/getcourseshook';
import { useCreateCourse } from '../../../hooks/createcoursehook';
import { useUpdateCourse } from '../../../hooks/updatecoursehook';
import Loading from '../../../components/loading/loading';
import moment from 'moment';
import { toast } from 'react-toastify';
import './coursesManagment.css';
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaUsers, FaCalendar, FaBook } from 'react-icons/fa';

const CoursesManagement = () => {
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    groupPrice: '',
    privatePrice: '',
    zoomLink: ''
  });

  const { execute: getCourses, isLoading: isLoadingGet, error: getError } = useGetCourses();
  const { execute: createCourse, isLoading: isLoadingCreate, error: createError } = useCreateCourse();
  const { execute: updateCourse, isLoading: isLoadingUpdate, error: updateError } = useUpdateCourse();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (getError) handleError(getError);
    if (createError) handleError(createError);
    if (updateError) handleError(updateError);
  }, [getError, createError, updateError]);

  const handleError = (error) => {
    const errorMessage = error?.response?.data?.message;
    const errorName = error?.response?.data?.name;

    switch(errorName) {
      case 'UNAUTHENTICATED':
      case 'TOKEN_EXPIRED':
        toast.error('Please login again');
        // Handle logout/redirect
        break;
      case 'UNAUTHORIZED':
        toast.error('You are not authorized to perform this action');
        break;
      case 'COURSE_ALREADY_EXISTS':
        toast.error('Course name already exists');
        break;
      case 'COURSE_DOESNT_EXIST':
        toast.error('Course not found');
        break;
      case 'REQUIRED_PRICE':
        toast.error('At least one price is required');
        break;
      default:
        toast.error(errorMessage || 'An error occurred');
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await getCourses();
      if (response?.data?.courses) {
        setCourses(response.data.courses);
      }
    } catch (error) {
      handleError(error);
    }
  };

  const validatePrices = (price) => {
    const numberValue = parseFloat(price);
    return !isNaN(numberValue) && numberValue >= 0;
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    
    // Validate prices
    if (!validatePrices(formData.groupPrice)) {
      toast.error('Group price must be a positive number');
      return;
    }
    if (!validatePrices(formData.privatePrice)) {
      toast.error('Private price must be a positive number');
      return;
    }
  
    try {
      const payload = {
        ...formData,
        groupPrice: parseFloat(formData.groupPrice),
        privatePrice: parseFloat(formData.privatePrice)
      };
      
      await createCourse(payload);
      toast.success('Course created successfully');
      handleCloseModal();
      fetchCourses();
    } catch (error) {
      handleError(error);
    }
  };

  const handleUpdateCourse = async (e) => {
    e.preventDefault();
  
    // Validate prices
    if (!validatePrices(formData.groupPrice)) {
      toast.error('Group price must be a positive number');
      return;
    }
    if (!validatePrices(formData.privatePrice)) {
      toast.error('Private price must be a positive number');
      return;
    }
  
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        groupPrice: parseFloat(formData.groupPrice),
        privatePrice: parseFloat(formData.privatePrice),
        zoomLink: formData.zoomLink
      };
      await updateCourse(selectedCourse.id, payload);
      toast.success('Course updated successfully');
      handleCloseModal();
      fetchCourses();
    } catch (error) {
      handleError(error);
    }
  };
  
  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setFormData({
      name: '',
      description: '',
      groupPrice: '',
      privatePrice: '',
      zoomLink: ''
    });
  };

  const filteredCourses = courses.filter(course => 
    course.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoadingGet || isLoadingCreate || isLoadingUpdate) {
    return <Loading isVisible={true} />;
  }

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
        <button 
          className="create-button"
          onClick={() => setIsCreateModalOpen(true)}
        >
          Create Course
        </button>
      </div>

      <div className="courses-grid">
        {filteredCourses.map(course => (
          <div key={course.id} className="course-card">
            <div className="card-header">
              <h3>{course.name}</h3>
              <FaEdit 
                className="edit-icon"
                onClick={() => {
                  setSelectedCourse(course);
                  setFormData(course);
                  setIsEditModalOpen(true);
                }}
              />
            </div>
            <p>{course.description}</p>
                <div className="price-info">
                  <span>Group: ${course.groupPrice}</span>
                  <span>Private: ${course.privatePrice}</span>
                </div>
            <div className="date-info">
              <span>Created: {moment(course.createdAt).format('DD/MM/YYYY hh:mm A')}</span>
            </div>
            <div className="card-actions">
              <button 
                onClick={() => navigate(`/admin/courses/${course.id}/students`)}
                className="action-button students"
              >
                <FaUsers /> Students
              </button>
              <button 
                onClick={() => navigate(`/admin/courses/${course.id}/sessions`)}
                className="action-button sessions"
              >
                <FaCalendar /> Sessions
              </button>
              <button 
                onClick={() => navigate(`/admin/courses/${course.id}/materials`)}
                className="action-button materials"
              >
                <FaBook /> Materials
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Create Course</h2>
            <form onSubmit={handleCreateCourse}>
              <input
                type="text"
                placeholder="Course Name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
              <textarea
                placeholder="Course Description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                required
              />
              <input
                type="text"
                placeholder="Group Price (e.g. 5.00)"
                value={formData.groupPrice}
                onChange={(e) => setFormData({...formData, groupPrice: e.target.value})}
                required
              />
              <input
                type="text"
                placeholder="Private Price (e.g. 2.50)"
                value={formData.privatePrice}
                onChange={(e) => setFormData({...formData, privatePrice: e.target.value})}
                required
              />
              <input
                type="url"
                placeholder="Zoom Link"
                value={formData.zoomLink}
                onChange={(e) => setFormData({...formData, zoomLink: e.target.value})}
                required
              />
              <div className="modal-buttons">
                <button 
                  type="submit" 
                  disabled={isLoadingCreate}
                >
                  {isLoadingCreate ? 'Creating...' : 'Create'}
                </button>
                <button 
                  type="button" 
                  onClick={handleCloseModal}
                  disabled={isLoadingCreate}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Edit Course</h2>
            <form onSubmit={handleUpdateCourse}>
              <input
                type="text"
                placeholder="Course Name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
              <textarea
                placeholder="Course Description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                required
              />
              <input
                type="text"
                placeholder="Group Price (e.g. 5.00)"
                value={formData.groupPrice}
                onChange={(e) => setFormData({...formData, groupPrice: e.target.value})}
                required
              />
              <input
                type="text"
                placeholder="Private Price (e.g. 2.50)"
                value={formData.privatePrice}
                onChange={(e) => setFormData({...formData, privatePrice: e.target.value})}
                required
              />
              <input
                type="url"
                placeholder="Zoom Link"
                value={formData.zoomLink}
                onChange={(e) => setFormData({...formData, zoomLink: e.target.value})}
                required
              />
              <div className="modal-buttons">
                <button 
                  type="submit" 
                  disabled={isLoadingUpdate}
                >
                  {isLoadingUpdate ? 'Updating...' : 'Update'}
                </button>
                <button 
                  type="button" 
                  onClick={handleCloseModal}
                  disabled={isLoadingUpdate}
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

export default CoursesManagement;