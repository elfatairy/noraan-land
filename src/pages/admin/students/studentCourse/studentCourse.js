import React, { useState, useEffect, useMemo, memo } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { FaTimes } from 'react-icons/fa';
import { useCreateSession } from '../../../../hooks/newHooks/createSession';
import { useGetCourseReports } from '../../../../hooks/newHooks/getCourseReports';
import { useAssignHours } from '../../../../hooks/newHooks/assignHours';
import { useAssignToGroup } from '../../../../hooks/newHooks/assignToGroup';
import { useConvertToPrivate } from '../../../../hooks/newHooks/convertToPrivate';
import { useGetGroups } from '../../../../hooks/newHooks/getGroupshook';
import styles from './studentCourse.module.css';

const CreateSessionModal = memo(({ isOpen, sessionData, onSubmit, onClose, onDataChange }) => {
  if (!isOpen) return null;
  
  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h3>Create New Session</h3>
          <FaTimes className={styles.closeIcon} onClick={onClose} />
        </div>
        <div className={styles.modalBody}>
          <div className={styles.formGroup}>
            <label>Title</label>
            <input
              type="text"
              value={sessionData.title}
              onChange={(e) => onDataChange('title', e.target.value)}
              className={styles.formInput}
            />
          </div>
          
          <div className={styles.formGroup}>
            <label>Description</label>
            <textarea
              value={sessionData.description}
              onChange={(e) => onDataChange('description', e.target.value)}
              className={styles.formTextarea}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Date</label>
            <input
              type="datetime-local"
              value={sessionData.date}
              onChange={(e) => onDataChange('date', e.target.value)}
              className={styles.formInput}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Duration (minutes)</label>
            <input
              type="number"
              value={sessionData.duration}
              onChange={(e) => onDataChange('duration', parseInt(e.target.value))}
              className={styles.formInput}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Payment Type</label>
            <select
              value={sessionData.paymentType}
              onChange={(e) => onDataChange('paymentType', e.target.value)}
              className={styles.formSelect}
            >
              <option value="paid">Paid Session</option>
              <option value="free">Free Session</option>
            </select>
          </div>

          <div className={styles.formGroupCheckbox}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={sessionData.isRecurring}
                onChange={(e) => onDataChange('isRecurring', e.target.checked)}
              />
              Recurring Session
            </label>
          </div>
        </div>
        
        <div className={styles.formActions}>
          <button className={styles.secondaryButton} onClick={onClose}>Cancel</button>
          <button className={styles.primaryButton} onClick={onSubmit}>Create</button>
        </div>
      </div>
    </div>
  );
});

const ChangeDataModal = memo(({ 
  isOpen, 
  onClose, 
  newHours, 
  setNewHours, 
  selectedSessionType, 
  setSelectedSessionType,
  selectedGroup, 
  setSelectedGroup,
  groups,
  price,
  handleChangeData 
}) => {
  if (!isOpen) return null;

  const totalPrice = price ? price * (newHours || 0) : 0;

  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h3>Change Course Data</h3>
          <FaTimes className={styles.closeIcon} onClick={onClose} />
        </div>
        <div className={styles.modalBody}>
          <div className={styles.formGroup}>
            <label>Hours</label>
            <input
              type="text"
              value={newHours}
              onChange={(e) => setNewHours(e.target.value.replace(/\D/g, ''))}
              className={styles.formInput}
            />
            <small className={styles.note}>0 hours for free students</small>
          </div>

          <div className={styles.formGroup}>
            <label>Total Price: ${totalPrice}</label>
          </div>

          <div className={styles.formGroup}>
            <label>Session Type</label>
            <select 
              value={selectedSessionType}
              onChange={(e) => setSelectedSessionType(e.target.value)}
              className={styles.formSelect}
            >
              <option value="PRIVATE">Private</option>
              <option value="GROUP">Group</option>
            </select>
          </div>

          {selectedSessionType === 'GROUP' && (
            <div className={styles.formGroup}>
              <label>Select Group</label>
              <select
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                className={styles.formSelect}
              >
                <option value="">Select Group</option>
                {groups.map(group => (
                  <option key={group.id} value={group.id}>
                    {group.name} ({group.studentsCount} students)
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
        <div className={styles.formActions}>
          <button className={styles.secondaryButton} onClick={onClose}>Cancel</button>
          <button className={styles.primaryButton} onClick={handleChangeData}>Save Changes</button>
        </div>
      </div>
    </div>
  );
});

const StudentCourse = () => {
  const { studentId, courseId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionType = searchParams.get('sessionType');
  const price = searchParams.get('price');
  const hours = searchParams.get('hours');
  const group = searchParams.get('group');
  const groupId = searchParams.get('groupId');
  const groupName = searchParams.get('groupName');

  
  // States for modals
  const [showReportModal, setShowReportModal] = useState(false);
  const [showChangeDataModal, setShowChangeDataModal] = useState(false);
  const [showCreateSessionModal, setShowCreateSessionModal] = useState(false);
  const [reports, setReports] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [newHours, setNewHours] = useState(hours || 0);
  const [sessionData, setSessionData] = useState({
    title: '',
    description: '',
    date: '',
    duration: 60,
    sessionType,
    groupId: group || null,
    isRecurring: false,
    privateStudentId: sessionType === 'PRIVATE' ? studentId : null,
    isFree: false,
    paymentType: 'paid' // Add payment type
  });
  const [expandedReports, setExpandedReports] = useState({});
  const [selectedSessionType, setSelectedSessionType] = useState(sessionType || 'PRIVATE');

  // Hooks
  const { execute: createSession } = useCreateSession();
  const { execute: getReports } = useGetCourseReports();
  const { execute: assignHours } = useAssignHours();
  const { execute: assignToGroup } = useAssignToGroup();
  const { execute: convertToPrivate } = useConvertToPrivate();
  const { execute: fetchGroups } = useGetGroups();

  useEffect(() => {
    fetchReports();
    if (courseId) {
      fetchGroups(courseId).then(response => {
        if (response?.data?.groups) {
          setGroups(response.data.groups);
        }
      });
    }
  }, [courseId]);

  const fetchReports = async () => {
    try {
      const response = await getReports(courseId, studentId);
      if (response?.data?.reports) {
        setReports(response.data.reports);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  const handleCreateSession = async () => {
    try {
      await createSession(courseId, sessionData);
      setShowCreateSessionModal(false);
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };

  const handleChangeData = async () => {
    try {
      if (newHours !== hours) {
        await assignHours(studentId, courseId, Number(newHours));
      }
      
      if (selectedSessionType === 'PRIVATE') {
        await convertToPrivate(studentId, courseId);
      } else if (selectedSessionType === 'GROUP' && selectedGroup) {
        await assignToGroup(studentId, courseId, selectedGroup);
      }
      
      setShowChangeDataModal(false);
      // Refresh data if needed
    } catch (error) {
      console.error('Error updating data:', error);
    }
  };

  const handleCreateSessionClick = () => {
    setShowCreateSessionModal(true);
  };

  // Add keyboard handlers for modals
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowCreateSessionModal(false);
        setShowChangeDataModal(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const ReportDetailsModal = memo(({ report, isOpen, onClose }) => {
    if (!isOpen) return null;
  
    return (
      <div className={styles.reportModal}>
        <div className={styles.reportModalContent}>
          <div className={styles.reportDetailHeader}>
            <h3>Report Details</h3>
            <FaTimes className={styles.closeIcon} onClick={onClose} />
          </div>
          <div className={styles.modalBody}>
            <div className={styles.reportDetailItem}>
              <strong>Session:</strong> {report.sessionTitle}
            </div>
            {report.notes && (
              <div className={styles.reportDetailItem}>
                <strong>Notes:</strong>
                <p>{report.notes}</p>
              </div>
            )}
            {report.homeWork && (
              <div className={styles.reportDetailItem}>
                <strong>Homework:</strong>
                <p>{report.homeWork}</p>
              </div>
            )}
            {report.tardy > 0 && (
              <div className={styles.reportDetailItem}>
                <strong>Tardy:</strong> {report.tardy} minutes
              </div>
            )}
            <div className={styles.reportDetailItem}>
              <strong>Date:</strong> {new Date(report.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
        </div>
      </div>
    );
  });
  
  const ReportsList = ({ reports, courseId, navigate }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMonth, setSelectedMonth] = useState('');
    const [selectedReport, setSelectedReport] = useState(null);
  
    const filteredAndSortedReports = useMemo(() => {
      return reports
        .filter(report => {
          // Skip reports with only sessionTitle
          if (Object.keys(report).length === 1 && report.sessionTitle) return false;
          
          const matchesSearch = report.sessionTitle?.toLowerCase().includes(searchTerm.toLowerCase());
          if (selectedMonth) {
            const reportMonth = new Date(report.createdAt).getMonth();
            return matchesSearch && reportMonth === parseInt(selectedMonth);
          }
          return matchesSearch;
        })
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }, [reports, searchTerm, selectedMonth]);
  
    return (
      <div className={styles.reportsSection}>
        <div className={styles.reportsHeader}>
          <input
            type="text"
            placeholder="Search reports..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="">All Months</option>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i} value={i}>
                {new Date(2024, i).toLocaleString('default', { month: 'long' })}
              </option>
            ))}
          </select>
        </div>
  
        <div className={styles.reportsGrid}>
          {filteredAndSortedReports.map(report => (
            <div key={report.id || report.sessionId} className={styles.reportCardWrapper}>
              <div className={styles.reportHeader}>
                <h4>{report.sessionTitle}</h4>
                {report.attendence && (
                  <span className={`${styles.attendanceBadge} ${styles[report.attendence?.toLowerCase()]}`}>
                    {report.attendence}
                  </span>
                )}
              </div>
              
              <div className={styles.reportInfo}>
                <span className={styles.date}>
                  {new Date(report.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
  
              <div className={styles.cardActions}>
                <button 
                  className={styles.detailsButton}
                  onClick={() => setSelectedReport(report)}
                >
                  View Details
                </button>
                <button 
                  className={styles.sessionButton}
                  onClick={() => navigate(`/admin/courses/${courseId}/sessions?sessionId=${report.sessionId}`)}
                >
                  View Session
                </button>
              </div>
            </div>
          ))}
        </div>
  
        <ReportDetailsModal 
          report={selectedReport}
          isOpen={!!selectedReport}
          onClose={() => setSelectedReport(null)}
        />
      </div>
    );
  };

  return (
    <div className={styles.studentCourseContainer}>
      <div className={styles.header}>
        <h2>Course Management</h2>
        <div className={styles.actions}>
          <button 
            className={styles.actionButton} 
            onClick={handleCreateSessionClick}
          >
            Create Session
          </button>
          <button 
            className={styles.actionButton} 
            onClick={() => setShowChangeDataModal(true)}
          >
            Change Data
          </button>
        </div>
      </div>

      {showCreateSessionModal && (
        <CreateSessionModal 
          isOpen={showCreateSessionModal}
          sessionData={sessionData}
          onSubmit={handleCreateSession}
          onClose={() => setShowCreateSessionModal(false)}
          onDataChange={(field, value) => setSessionData(prev => ({
            ...prev,
            [field]: value
          }))}
        />
      )}
      
      <ReportsList 
        reports={reports}
        courseId={courseId}
        navigate={navigate}
      />
      <ChangeDataModal 
        isOpen={showChangeDataModal}
        onClose={() => setShowChangeDataModal(false)}
        newHours={newHours}
        setNewHours={setNewHours}
        selectedSessionType={selectedSessionType}
        setSelectedSessionType={setSelectedSessionType}
        selectedGroup={selectedGroup}
        setSelectedGroup={setSelectedGroup}
        groups={groups}
        price={price}
        handleChangeData={handleChangeData}
      />
    </div>
  );
};

export default StudentCourse;