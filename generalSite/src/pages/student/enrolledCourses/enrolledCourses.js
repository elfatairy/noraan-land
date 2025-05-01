import React, { useState, useEffect } from 'react';
import { useGetEnrolledCourses } from '../../../hooks/userenrolledcourses';
import Loading from '../../../components/loading/loading';
import moment from 'moment';
import { toast } from 'react-toastify';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaCalendar, FaBook, FaQuestionCircle, FaInfo, FaTimes, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import './enrolledCourses.css';
import { usePaymobIntention } from '../../../hooks/paymentHooks/paymobIntention';

const CourseDetailsModal = ({ course, isOpen, onClose }) => {
  const { execute: getPaymobIntention, isLoading: isPaymobLoading } = usePaymobIntention();
  if (!isOpen) return null;

  const totalPrice = course.hours * (course.preferredSessionType === 'GROUP' ? course.groupPrice : course.privatePrice);

  const handlePaymobPayment = async () => {
    try {
      const response = await getPaymobIntention(course.id);
      if (response?.data?.clientSecret) {
        const checkoutUrl = `https://accept.paymob.com/unifiedcheckout/?publicKey=egy_pk_test_IaBKzBVIl73JHibLZyKDuDSpfGaLWMM1&clientSecret=${response.data.clientSecret}`;
        window.open(checkoutUrl, '_blank');
      }
    } catch (error) {
      toast.error('Failed to initiate payment');
    }
  };

  return (
    <div className="report-modal">
      <div className="report-modal-content">
        <div className="report-detail-header">
          <h3>Course Details</h3>
          <FaTimes className="close-icon" onClick={onClose} />
        </div>
        <div className="modal-body">
          <div className="report-detail-item">
            <strong>Title:</strong>
            <p>{course.name}</p>
          </div>
          <div className="report-detail-item">
            <strong>Description:</strong>
            <p>{course.description}</p>
          </div>
          <div className="report-detail-item">
            <strong>Session Type:</strong>
            <p>{course.preferredSessionType}</p>
          </div>
          {course.sessionType === 'GROUP' && course.group && (
            <div className="report-detail-item">
              <strong>Group:</strong>
              <p>{course.group.name}</p>
            </div>
          )}
          <div className="report-detail-item">
            <strong>Subscription Status:</strong>
            <p>{course.subscriptionStatus}</p>
          </div>
          <div className="report-detail-item">
            <strong>Hours:</strong>
            <p>{course.hours}</p>
          </div>
          <div className="report-detail-item">
            <strong>Price per Hour:</strong>
            <p>${course.preferredSessionType === 'GROUP' ? course.groupPrice : course.privatePrice}</p>
          </div>
          <div className="report-detail-item">
            <strong>Total Price:</strong>
            <p>${totalPrice}</p>
          </div>

          {course.subscriptionStatus === 'UNSUBSCRIBED' && (
            <div className="payment-section">
              <h4>Payment Methods</h4>
              <div className="payment-buttons">
                <button 
                  className="payment-button paymob"
                  onClick={handlePaymobPayment}
                  disabled={isPaymobLoading}
                >
                  {isPaymobLoading ? 'Processing...' : 'Pay with Paymob'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const TransactionModal = ({ status, onClose }) => {
  const isSuccess = status === 'SUCCESS';
  
  return (
    <div className="report-modal">
      <div className="report-modal-content transaction-status">
        <div className="transaction-icon">
          {isSuccess ? (
            <FaCheckCircle className="success-icon" />
          ) : (
            <FaTimesCircle className="error-icon" />
          )}
        </div>
        <h3>{isSuccess ? 
          "The course has been purchased" : 
          "The course has not been purchased, an error occurred"}
        </h3>
        <button 
          className="close-transaction-button"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
};

const EnrolledCourses = () => {
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { execute: getEnrolledCourses, isLoading } = useGetEnrolledCourses();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [transactionStatus, setTransactionStatus] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const status = params.get('transaction_status');
    if (status) {
      setTransactionStatus(status);
    }
  }, [location]);

  const fetchCourses = async () => {
    try {
      const response = await getEnrolledCourses();
      if (response?.data?.courses) {
        setCourses(response.data.courses);
      }
    } catch (error) {
      toast.error('Failed to fetch enrolled courses');
    }
  };

  const handleCloseTransactionModal = () => {
    setTransactionStatus(null);
    navigate('/student/enrolled-courses', { replace: true });
  };

  const filteredCourses = courses.filter(course => 
    course.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) return <Loading isVisible={true} />;

  return (
    <div className="courses-container">
      <h2 className="page-title">My Enrolled Courses</h2>
      <div className="header">
        <input
          type="text"
          placeholder="Search enrolled courses..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="courses-grid">
        {filteredCourses.length > 0 ? (
          filteredCourses.map(course => (
            <div key={course.id} className="course-card">
              <div className="card-header">
                <h3>{course.name}</h3>
                <span className={`status-badge ${course.subscriptionStatus.toLowerCase()}`}>
                  {course.subscriptionStatus}
                </span>
              </div>
              <p className="course-description">{course.description}</p>
              <div className="card-actions">
                <button 
                  onClick={() => navigate(`/student/courses/${course.id}/sessions${
                    course.preferredSessionType === 'GROUP' 
                      ? `?sessionType=GROUP&groupId=${course.groupId}`
                      : `?sessionType=PRIVATE&studentId=${course.privateStudentId}`
                  }`)}
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
                <button 
                  onClick={() => setSelectedCourse(course)}
                  className="action-button details"
                >
                  <FaInfo /> Details
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-courses">
            <p>No enrolled courses found</p>
          </div>
        )}
      </div>

      {selectedCourse && (
        <CourseDetailsModal
          course={selectedCourse}
          isOpen={!!selectedCourse}
          onClose={() => setSelectedCourse(null)}
        />
      )}

      {transactionStatus && (
        <TransactionModal 
          status={transactionStatus}
          onClose={handleCloseTransactionModal}
        />
      )}
    </div>
  );
};

export default EnrolledCourses;