import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { FaTimes } from 'react-icons/fa';
import { useCreateSession } from '../../../../hooks/newHooks/createSession';
import { useGetCourseReports } from '../../../../hooks/newHooks/getCourseReports';
import { useAssignHours } from '../../../../hooks/newHooks/assignHours';
import { useAssignToGroup } from '../../../../hooks/newHooks/assignToGroup';
import { useConvertToPrivate } from '../../../../hooks/newHooks/convertToPrivate';
import { useGetGroups } from '../../../../hooks/newHooks/getGroupshook';
import styles from './studentCourse.module.css';

const StudentCourse = () => {
  const { studentId, courseId } = useParams();
  const [searchParams] = useSearchParams();
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
    isFree: false
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
      if (response?.value?.data?.reports) {
        setReports(response.value.data.reports);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  const handleCreateSession = async () => {
    try {
      await createSession(courseId, sessionData);
      setShowCreateSessionModal(false);
      // Refresh data if needed
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };

  const handleChangeData = async () => {
    try {
      if (newHours !== hours) {
        await assignHours(studentId, courseId, Number(newHours));
      }
      
      if (sessionType === 'PRIVATE') {
        await convertToPrivate(studentId, courseId);
      } else if (sessionType === 'GROUP' && selectedGroup) {
        await assignToGroup(studentId, courseId, selectedGroup);
      }
      
      setShowChangeDataModal(false);
      // Refresh data if needed
    } catch (error) {
      console.error('Error updating data:', error);
    }
  };

  const CreateSessionModal = () => (
    <div className={`${styles.modal} ${showCreateSessionModal ? styles.modalShow : ''}`}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h3>Create New Session</h3>
          <FaTimes className={styles.closeIcon} onClick={() => setShowCreateSessionModal(false)} />
        </div>
        <div className={styles.modalBody}>
          {sessionType === 'GROUP' && !groupId && (
            <div className={styles.errorMessage}>
              Assign the student to a group first
            </div>
          )}
          <div className={styles.formGroup}>
            <label>Title</label>
            <input
              type="text"
              value={sessionData.title}
              onChange={(e) => setSessionData({ ...sessionData, title: e.target.value })}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Description</label>
            <textarea
              value={sessionData.description}
              onChange={(e) => setSessionData({ ...sessionData, description: e.target.value })}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Date</label>
            <input
              type="datetime-local"
              value={sessionData.date}
              onChange={(e) => setSessionData({ ...sessionData, date: e.target.value })}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Duration (minutes)</label>
            <input
              type="number"
              value={sessionData.duration}
              onChange={(e) => setSessionData({ ...sessionData, duration: parseInt(e.target.value) })}
            />
          </div>
          <div className={styles.formGroupCheckbox}>
            <label>
              <input
                type="checkbox"
                checked={sessionData.isFree}
                onChange={(e) => setSessionData({ ...sessionData, isFree: e.target.checked })}
              />
              Free Session
            </label>
            <label>
              <input
                type="checkbox"
                checked={sessionData.isRecurring}
                onChange={(e) => setSessionData({ ...sessionData, isRecurring: e.target.checked })}
              />
              Recurring Session
            </label>
          </div>
          <div className={styles.formActions}>
            <button className={styles.secondaryButton} onClick={() => setShowCreateSessionModal(false)}>Cancel</button>
            <button 
              className={styles.primaryButton}
              onClick={handleCreateSession}
              disabled={sessionType === 'GROUP' && !groupId}
            >
              Create
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const ChangeDataModal = () => (
    <div className={`${styles.modal} ${showChangeDataModal ? styles.modalShow : ''}`}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h3>Change Course Data</h3>
          <FaTimes className={styles.closeIcon} onClick={() => setShowChangeDataModal(false)} />
        </div>
        <div className={styles.modalBody}>
          <div className={styles.formGroup}>
            <label>Hours</label>
            <input
              type="number"
              value={newHours}
              onChange={(e) => setNewHours(e.target.value)}
            />
          </div>
          <div className={styles.formGroup}>
            <div className={styles.radioGroup}>
              <label>
                <input
                  type="radio"
                  value="PRIVATE"
                  checked={selectedSessionType === 'PRIVATE'}
                  onChange={(e) => setSelectedSessionType(e.target.value)}
                />
                Private
              </label>
              <label>
                <input
                  type="radio"
                  value="GROUP"
                  checked={selectedSessionType === 'GROUP'}
                  onChange={(e) => setSelectedSessionType(e.target.value)}
                />
                Group
              </label>
            </div>
          </div>
          {selectedSessionType === 'GROUP' && (
            <div className={styles.formGroup}>
              <label>Select Group</label>
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
          <div className={styles.formActions}>
            <button className={styles.secondaryButton} onClick={() => setShowChangeDataModal(false)}>Cancel</button>
            <button className={styles.primaryButton} onClick={handleChangeData}>Save Changes</button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={styles.studentCourseContainer}>
      <div className={styles.header}>
        <h2>Course Management</h2>
        <div className={styles.actions}>
          <button className={styles.actionButton} onClick={() => setShowCreateSessionModal(true)}>
            Create Session
          </button>
          <button className={styles.actionButton} onClick={() => setShowChangeDataModal(true)}>
            Change Data
          </button>
        </div>
      </div>

      <div className={styles.reportsSection}>
        <h3>Session Reports</h3>
        <div className={styles.reportsList}>
          {reports.map(report => (
            <div key={report.id} className={styles.reportCard}>
              <div className={styles.reportHeader}>
                <h4>{report.sessionTitle}</h4>
                <span className={`${styles.attendanceBadge} ${styles[report.attendence.toLowerCase()]}`}>
                  {report.attendence}
                </span>
              </div>
              <div className={styles.reportInfo}>
                <p className={styles.date}>{new Date(report.createdAt).toLocaleDateString()}</p>
                {report.tardy && <p className={styles.tardy}>Late by {report.tardy} minutes</p>}
              </div>
              {(report.notes || report.homeWork) && (
                <div className={styles.reportDetails}>
                  {report.notes && (
                    <div className={styles.notes}>
                      <strong>Notes:</strong>
                      <p className={expandedReports[report.id] ? styles.expanded : ''}>
                        {report.notes}
                      </p>
                      {report.notes.length > 100 && (
                        <button 
                          className={styles.expandButton}
                          onClick={() => setExpandedReports(prev => ({
                            ...prev,
                            [report.id]: !prev[report.id]
                          }))}
                        >
                          {expandedReports[report.id] ? 'Show less' : 'Read more'}
                        </button>
                      )}
                    </div>
                  )}
                  {report.homeWork && (
                    <div className={styles.homework}>
                      <strong>Homework:</strong>
                      <p className={expandedReports[report.id] ? styles.expanded : ''}>
                        {report.homeWork}
                      </p>
                      {report.homeWork.length > 100 && (
                        <button 
                          className={styles.expandButton}
                          onClick={() => setExpandedReports(prev => ({
                            ...prev,
                            [report.id]: !prev[report.id]
                          }))}
                        >
                          {expandedReports[report.id] ? 'Show less' : 'Read more'}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <CreateSessionModal />
      <ChangeDataModal />
    </div>
  );
};

export default StudentCourse;