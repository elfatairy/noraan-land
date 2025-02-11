import React, { useState, useEffect } from 'react';
import { useGetCourses } from '../../../hooks/getcourseshook';
import { useApplyForCourse } from '../../../hooks/applyforcourse';
import Loading from '../../../components/loading/loading';
import moment from 'moment';
import { toast } from 'react-toastify';
import { FaGraduationCap } from 'react-icons/fa';
import './courses.css';

// Add these imports at the top
import { useGetCourseDetails } from '../../../hooks/useGetCourseDetails';
import { useApprovePaypal } from '../../../hooks/useApprovePaypal';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [enrollmentData, setEnrollmentData] = useState({
    availableTime: '',
    userNotes: '',
    sessionType: 'GROUP'
  });
  const [courseDetails, setCourseDetails] = useState(null);
  const [isPayPalScriptLoaded, setIsPayPalScriptLoaded] = useState(false);

  const { execute: getCourses, isLoading: isLoadingGet } = useGetCourses();
  const { execute: applyForCourse, isLoading: isLoadingApply } = useApplyForCourse();

  // Add these to the existing hooks in the component
  const { execute: getCourseDetails } = useGetCourseDetails();
  const { execute: approvePaypal } = useApprovePaypal();

  useEffect(() => {
    fetchCourses();
  }, []); 

  useEffect(() => {
    if (courseDetails && selectedCourse && !isPayPalScriptLoaded) {
      loadPayPalScript();
    } else if (courseDetails && selectedCourse && isPayPalScriptLoaded) {
      initializePayPalButton(courseDetails);
    }
  }, [courseDetails, selectedCourse, enrollmentData.sessionType, isPayPalScriptLoaded]);

  const fetchCourses = async () => {
    try {
      const response = await getCourses();
      setCourses(response.data.courses);
    } catch (error) {
      toast.error('Failed to fetch courses');
    }
  };

  const handleEnrollClick = async (course) => {
    setSelectedCourse(course);
    setIsEnrollModalOpen(true);
    
    try {
      const response = await getCourseDetails(course.id);
      setCourseDetails(response.data);
      await loadPayPalButton(response.data);
    } catch (error) {
      console.error('Error loading course details:', error);
      toast.error('Failed to load payment options');
    }
  };

  const handleCloseModal = () => {
    setIsEnrollModalOpen(false);
    setSelectedCourse(null);
    setCourseDetails(null);
    setIsPayPalScriptLoaded(false);
    setEnrollmentData({
      availableTime: '',
      userNotes: '',
      sessionType: 'INDIVIDUAL'  // Set default to INDIVIDUAL
    });
  };

  const filteredCourses = courses.filter(course => 
    course.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoadingGet) {
    return <Loading isVisible={true} />;
  }

  const loadPayPalScript = () => {
    // Remove existing script if any
    const existingScript = document.querySelector('script[src*="paypal"]');
    if (existingScript) {
      existingScript.remove();
      setIsPayPalScriptLoaded(false);
    }
  
    const script = document.createElement('script');
    script.src = 'https://www.paypal.com/sdk/js?client-id=AR3yPS8CprKmEnZpRrtC7mbx7lmF-E9bxt5ASwkFzYkB27FlyQ7Zu9nevM53HT-Ago0n618vRydRw3zD&vault=true&intent=subscription';
    script.async = true;
    
    // Add error event listener to prevent error propagation
    window.addEventListener('error', (e) => {
      if (e.message.includes('zoid destroyed') || e.message.includes('paypal')) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    }, true);
    
    script.onload = () => {
      setIsPayPalScriptLoaded(true);
    };
  
    script.onerror = (e) => {
      // Prevent error from showing in console
      e.preventDefault();
      setIsPayPalScriptLoaded(false);
    };
  
    document.body.appendChild(script);
  };

  const loadPayPalButton = async (courseDetails) => {
    const container = document.querySelector('#paypal-button-container');
    if (!container) return;
    
    // Clear existing buttons
    container.innerHTML = '';

    // Check if script already exists
    const existingScript = document.querySelector('script[src*="paypal"]');
    if (existingScript) {
      existingScript.remove();
    }

    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://www.paypal.com/sdk/js?client-id=AR3yPS8CprKmEnZpRrtC7mbx7lmF-E9bxt5ASwkFzYkB27FlyQ7Zu9nevM53HT-Ago0n618vRydRw3zD&vault=true&intent=subscription';
      script.async = true;
      
      script.onload = () => {
        if (window.paypal) {
          initializePayPalButton(courseDetails);
          resolve();
        }
      };
      
      document.body.appendChild(script);
    });
  };

  const initializePayPalButton = (courseDetails) => {
    const container = document.querySelector('#paypal-button-container');
    if (!container || !window.paypal) return;

    container.innerHTML = '';

    const planId = enrollmentData.sessionType === 'GROUP' 
      ? courseDetails.paymentDetails.paypalGroupPlanId 
      : courseDetails.paymentDetails.paypalIndividualPlanId;

    try {
      window.paypal.Buttons({
        style: {
          layout: 'vertical',
          shape: 'rect'
        },
        createSubscription: (data, actions) => {
          return actions.subscription.create({
            'plan_id': planId
          });
        },
        onApprove: async (data, actions) => {
          try {
            await approvePaypal(selectedCourse.id, data.subscriptionID);
            toast.success('Subscription successful!');
            handleCloseModal();
          } catch (error) {
            // Suppress error logging here
            toast.error('Failed to complete enrollment');
          }
        },
        onError: () => {
          // Suppress error logging here
          toast.error('Payment initialization failed');
        }
      }).render('#paypal-button-container')
        .catch(() => {
          // Suppress render errors
        });
    } catch (error) {
      // Suppress error logging here
      toast.error('Failed to initialize payment');
    }
  };

  return (
    <div className="courses-container">
      <div className="header">
        <h1>Available Courses</h1>
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
            <button 
              className="enroll-button"
              onClick={() => handleEnrollClick(course)}
            >
              <FaGraduationCap /> Enroll Now
            </button>
          </div>
        ))}
      </div>

      {isEnrollModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Enroll in {selectedCourse.name}</h2>
            <form>
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
                      value="INDIVIDUAL"
                      checked={enrollmentData.sessionType === 'INDIVIDUAL'}
                      onChange={e => setEnrollmentData({
                        ...enrollmentData,
                        sessionType: e.target.value
                      })}
                    />
                    Individual (${selectedCourse.individualPrice})
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
                value={enrollmentData.userNotes}
                onChange={e => setEnrollmentData({
                  ...enrollmentData,
                  userNotes: e.target.value
                })}
              />
              <div className="modal-buttons">
                <div id="paypal-button-container"></div>
                <button type="button" onClick={handleCloseModal}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Courses;