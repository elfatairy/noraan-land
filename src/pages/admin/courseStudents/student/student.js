import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useGetCoursePrivateStudents } from "../../../../hooks/newHooks/getCoursePrivateStudents";
import { useGetCourseNewStudents } from "../../../../hooks/newHooks/getCourseNewStudents";
import { useGetCourseGroupStudents } from "../../../../hooks/newHooks/getCourseGroupStudents";
import { useGetGroups } from "../../../../hooks/newHooks/getGroupshook";
import { useCreateGroups } from "../../../../hooks/newHooks/createGroup";
import { useDeleteGroups } from "../../../../hooks/newHooks/deleteGroup";
import { useCreateSession } from "../../../../hooks/newHooks/createSession";
import Loading from "../../../../components/loading/loading";
import { toast } from "react-toastify";
import "./student.css";
import {
  FaUsers,
  FaPlus,
  FaTrash,
  FaCalendarPlus,
  FaCalendarAlt,
} from "react-icons/fa";

const SessionModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  activeTab, 
  availableGroups, 
  availableStudents, 
  sessionData, 
  onInputChange,
  isLoading 
}) => {
  // Filter students based on active tab
  const filteredStudents = availableStudents.filter(student => {
    if (activeTab === "private") {
      return (
        student.preferredSessionType === "PRIVATE" &&
        student.hours !== null &&
        student.groupId === null
      );
    } else if (activeTab === "new") {
      return (
        student.hours === null &&
        student.groupId === null
      );
    }
    return true;
  });

  if (!isOpen || isLoading) return null;

  return (
    <div className="session-modal-overlay show" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>Create New Session</h2>
        {isLoading ? (
          <Loading isVisible={true} />
        ) : (
          <form onSubmit={onSubmit}>
            <div className="form-group">
              <label htmlFor="title">Session Title</label>
              <input
                id="title"
                type="text"
                placeholder="Enter session title"
                value={sessionData.title}
                onChange={e => onInputChange('title', e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                placeholder="Enter session description"
                value={sessionData.description}
                onChange={e => onInputChange('description', e.target.value)}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="date">Session Date</label>
                <input
                  id="date"
                  type="datetime-local"
                  value={sessionData.date}
                  onChange={e => onInputChange('date', e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="duration">Duration (minutes)</label>
                <input
                  id="duration"
                  type="text"
                  placeholder="e.g. 60"
                  value={sessionData.duration}
                  onChange={e => {
                    const value = e.target.value;
                    // Only allow numbers and limit to reasonable duration
                    if (/^\d*$/.test(value) && parseInt(value) <= 480) {
                      onInputChange('duration', value);
                    }
                  }}
                  required
                  min="15"
                  max="480"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="participant">
                {activeTab === 'group' ? 'Select Group' : 'Select Student'}
              </label>
              <select
                id="participant"
                className="modal-select"
                value={activeTab === 'group' ? sessionData.groupId : sessionData.privateStudentId}
                onChange={e => onInputChange(
                  activeTab === 'group' ? 'groupId' : 'privateStudentId',
                  e.target.value
                )}
                required
              >
                <option value="">
                  {activeTab === 'group' ? 'Choose a group' : 'Choose a student'}
                </option>
                {activeTab === 'group'
                  ? availableGroups.map(group => (
                      <option key={group.id} value={group.id}>
                        {group.name} ({group.studentsCount} students)
                      </option>
                    ))
                  : filteredStudents.map(student => (
                      <option 
                        key={student.id} 
                        value={student.studentId || student.id}
                      >
                        {student.student?.name || student.name}
                      </option>
                    ))
                }
              </select>
            </div>

            <div className="form-group">
              <label>Session Type</label>
              <div className="radio-group">
                <label className="radio-label">
                  <input
                    type="radio"
                    name="isFree"
                    checked={!sessionData.isFree}
                    onChange={() => onInputChange('isFree', false)}
                  />
                  <span>Paid Session</span>
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="isFree"
                    checked={sessionData.isFree}
                    onChange={() => onInputChange('isFree', true)}
                  />
                  <span>Free Session</span>
                </label>
              </div>
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={sessionData.isRecurring}
                  onChange={e => onInputChange('isRecurring', e.target.checked)}
                />
                <span>Recurring Session</span>
              </label>
            </div>

            <div className="modal-buttons">
              <button 
                type="submit" 
                className="submit-btn"
                disabled={isLoading}
              >
                {isLoading ? 'Creating...' : 'Create Session'}
              </button>
              <button
                type="button"
                className="cancel-btn"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

// Memoize the modal
const MemoizedSessionModal = React.memo(SessionModal);

const Students = () => {
  const { id: courseId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Get prices from URL params or default to 0
  const urlGroupPrice = parseFloat(searchParams.get('groupPrice')) || 0;
  const urlPrivatePrice = parseFloat(searchParams.get('privatePrice')) || 0;

  const [activeTab, setActiveTab] = useState("private");
  const [students, setStudents] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sessionModalData, setSessionModalData] = useState({
    title: "",
    description: "",
    date: "",
    duration: 60,
    sessionType: "PRIVATE",
    groupId: null,
    isRecurring: false,
    privateStudentId: null,
    isFree: false,
  });

  const [availableStudents, setAvailableStudents] = useState([]);
  const [availableGroups, setAvailableGroups] = useState([]);
  const [prices, setPrices] = useState({
    privatePrice: urlPrivatePrice,
    groupPrice: urlGroupPrice
  });

  const { execute: getPrivateStudents, isLoading: isLoadingPrivate } =
    useGetCoursePrivateStudents();
  const { execute: getNewStudents, isLoading: isLoadingNew } =
    useGetCourseNewStudents();
  const { execute: getGroupStudents, isLoading: isLoadingGroup } =
    useGetCourseGroupStudents();
  const { execute: getGroups, isLoading: isLoadingGroups } = useGetGroups();
  const { execute: createGroup } = useCreateGroups();
  const { execute: deleteGroup } = useDeleteGroups();
  const { execute: createSession, isLoading: isCreatingSession } = useCreateSession();

  useEffect(() => {
    fetchData();
  }, [activeTab, courseId, selectedGroupId]);

  const fetchData = async () => {
    try {
      switch (activeTab) {
        case "private":
          const privateResponse = await getPrivateStudents(courseId);
          setStudents(privateResponse.data.students || []);
          // Only update prices from API if URL params are not present
          if (!searchParams.has('privatePrice') && !searchParams.has('groupPrice')) {
            setPrices({
              privatePrice: privateResponse.data.privatePrice || 0,
              groupPrice: privateResponse.data.groupPrice || 0
            });
          }
          break;
        case "group":
          const groupsResponse = await getGroups(courseId);
          const fetchedGroups = groupsResponse.data.groups || [];
          setGroups(fetchedGroups);
          if (selectedGroupId || fetchedGroups[0]?.id) {
            const groupId = selectedGroupId || fetchedGroups[0].id;
            setSelectedGroupId(groupId);
            const groupStudentsResponse = await getGroupStudents(
              courseId,
              groupId
            );
            setStudents(groupStudentsResponse.data.students || []);
          }
          break;
        case "new":
          const newResponse = await getNewStudents(courseId);
          setStudents(newResponse.data.newStudents || []);
          break;
      }
    } catch (error) {
      toast.error("Failed to fetch data");
      setStudents([]);
    }
  };

  useEffect(() => {
    const fetchModalData = async () => {
      if (!isSessionModalOpen) return;

      try {
        if (activeTab === "group") {
          const groupsResponse = await getGroups(courseId);
          setAvailableGroups(groupsResponse.data.groups || []);
        } else if (activeTab === "new") {
          const newStudentsResponse = await getNewStudents(courseId);
          setAvailableStudents(newStudentsResponse.data.newStudents || []);
        } else {
          const studentsResponse = await getPrivateStudents(courseId);
          setAvailableStudents(studentsResponse.data.students || []);
        }
      } catch (error) {
        toast.error("Failed to fetch data for session creation");
      }
    };

    fetchModalData();
  }, [isSessionModalOpen, activeTab, courseId]);

  const handleCreateGroup = async () => {
    try {
      await createGroup(courseId);
      toast.success("Group created successfully");
      fetchData();
    } catch (error) {
      toast.error("Failed to create group");
    }
  };

  const handleDeleteGroup = async (groupId) => {
    try {
      await deleteGroup(courseId, groupId);
      toast.success("Group deleted successfully");
      setSelectedGroupId(null);
      fetchData();
    } catch (error) {
      toast.error("Failed to delete group");
    }
  };

  const handleCreateSession = async (e) => {
    e.preventDefault();
    try {
      // Validate and format the input data
      if (!sessionModalData.title.trim()) {
        toast.error("Please enter a session title");
        return;
      }
  
      if (!sessionModalData.date) {
        toast.error("Please select a session date");
        return;
      }
  
      // Format date properly and ensure it's valid
      const dateObj = new Date(sessionModalData.date);
      if (isNaN(dateObj.getTime())) {
        toast.error("Invalid date format");
        return;
      }
      const formattedDate = dateObj.toISOString();
  
      // Ensure duration is a valid number between 15 and 480
      const duration = parseInt(sessionModalData.duration);
      if (isNaN(duration) || duration < 15 || duration > 480) {
        toast.error("Duration must be between 15 and 480 minutes");
        return;
      }
  
      // Prepare request payload
      const payload = {
        title: sessionModalData.title.trim(),
        description: sessionModalData.description.trim() || "", // Ensure description is never null
        date: formattedDate,
        duration: duration,
        sessionType: activeTab === "group" ? "GROUP" : "PRIVATE",
        groupId: activeTab === "group" ? parseInt(selectedGroupId) : null,
        privateStudentId: activeTab === "group" ? null : parseInt(sessionModalData.privateStudentId),
        isRecurring: Boolean(sessionModalData.isRecurring), // Ensure boolean
        isFree: Boolean(sessionModalData.isFree) // Ensure boolean
      };
  
      // Additional validation based on session type
      if (payload.sessionType === "GROUP" && !payload.groupId) {
        toast.error("Please select a group");
        return;
      }
      if (payload.sessionType === "PRIVATE" && !payload.privateStudentId) {
        toast.error("Please select a student");
        return;
      }
  
      // Send request
      const response = await createSession(courseId, payload);
      
      if (response.data) {
        toast.success("Session created successfully");
        setIsSessionModalOpen(false);
        // Reset form data
        setSessionModalData({
          title: "",
          description: "",
          date: "",
          duration: 60,
          sessionType: "PRIVATE",
          groupId: null,
          isRecurring: false,
          privateStudentId: null,
          isFree: false,
        });
      }
    } catch (error) {
      console.error('Session creation error:', error);
      toast.error(error?.response?.data?.message || "Failed to create session");
    }
  };

  const renderActionButtons = () => (
    <div className="action-buttons">
      <button
        className="action-btn session-btn"
        onClick={() => setIsSessionModalOpen(true)}
        title="Create New Session"
      >
        <FaCalendarPlus />
      </button>

      {activeTab === "group" && (
        <>
          <button
            className="action-btn view-sessions-btn"
            onClick={() =>
              navigate(
                `/admin/courses/${courseId}/sessions?groupId=${selectedGroupId}`
              )
            }
            title="View Group Sessions"
          >
            <FaCalendarAlt />
          </button>
          <button
            className="action-btn create-group-btn"
            onClick={handleCreateGroup}
            title="Create New Group"
          >
            <FaPlus />
          </button>
          {selectedGroupId && (
            <button
              className="action-btn delete-group-btn"
              onClick={() => handleDeleteGroup(selectedGroupId)}
              title="Delete Selected Group"
            >
              <FaTrash />
            </button>
          )}
        </>
      )}
    </div>
  );

  const buildManageUrl = (student, privatePrice, groupPrice) => {
    const params = new URLSearchParams();
    
    // Set session type
    params.set('sessionType', student.preferredSessionType || 'GROUP');
    
    // Set both prices
    params.set('privatePrice', privatePrice || 0);
    params.set('groupPrice', groupPrice || 0);
    
    // Set hours (use 0 if null)
    params.set('hours', student.hours || 0);
    
    // Add group parameter only if it exists
    if (student.groupId) {
      params.set('group', student.groupId);
    }
    
    return `/admin/students/${student.studentId || ''}/courses/${courseId}?${params.toString()}`;
  };

  const StudentCard = ({ student, privatePrice, groupPrice }) => {
    const [isExpanded, setIsExpanded] = useState(false);
  
    // Provide default values and null checks
    const studentData = student?.student || {};
    const courseSubscription = student?.StudentCourseSubscription || {};
    const availableTime = student?.availableTime || "";
    const studentNotes = student?.studentNotes || "";
    const preferredSessionType = student?.preferredSessionType || "N/A";
    const hours = student?.hours || "N/A";
  
    return (
      <div className="student-card">
        <div className="student-header">
          <h3>{studentData.name || "Unknown Student"}</h3>
          <span
            className={`status-badge ${
              courseSubscription.subscriptionStatus || ""
            }`}
          >
            {courseSubscription.subscriptionStatus || "No Status"}
          </span>
        </div>
        <div className={`student-details ${isExpanded ? "expanded" : ""}`}>
          <p>
            <strong>Available Time:</strong>
            {isExpanded
              ? availableTime
              : availableTime.length > 50
              ? availableTime.substring(0, 50) + "..."
              : availableTime}
          </p>
          <p>
            <strong>Notes:</strong>
            {isExpanded
              ? studentNotes
              : studentNotes.length > 50
              ? studentNotes.substring(0, 50) + "..."
              : studentNotes}
          </p>
          <p>
            <strong>Session Type:</strong> {preferredSessionType}
          </p>
          {hours !== "N/A" && (
            <p>
              <strong>Hours:</strong> {hours}
            </p>
          )}
        </div>
        <div className="card-actions">
          {(availableTime.length > 50 || studentNotes.length > 50) && (
            <button
              className="expand-btn"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? "Show Less" : "View More"}
            </button>
          )}
          <button
            className="manage-btn"
            onClick={() => navigate(buildManageUrl(student, privatePrice, groupPrice))}
          >
            Manage
          </button>
        </div>
      </div>
    );
  };

  const filteredStudents = students.filter((student) => {
    const studentName = student?.student?.name?.toLowerCase() || "";
    const matchesSearch = studentName.includes(searchTerm.toLowerCase());
    if (activeTab === "private") {
      return (
        matchesSearch &&
        student?.groupId === null &&
        student?.preferredSessionType === "PRIVATE" &&
        student?.hours !== null
      );
    }
    return matchesSearch;
  });

  if (isLoadingPrivate || isLoadingNew || isLoadingGroup || isLoadingGroups)
    return <Loading isVisible={true} />;

  // Handler for form input changes
  const handleInputChange = (field, value) => {
    setSessionModalData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  return (
    <div className="students-container">
      <div className="header-section">
        <div className="header-content">
          <div className="top-row">
            <div className="tabs-container">
              <button
                className={`tab ${activeTab === "private" ? "active" : ""}`}
                onClick={() => setActiveTab("private")}
              >
                Private Students
              </button>
              <button
                className={`tab ${activeTab === "group" ? "active" : ""}`}
                onClick={() => setActiveTab("group")}
              >
                Group Students
              </button>
              <button
                className={`tab ${activeTab === "new" ? "active" : ""}`}
                onClick={() => setActiveTab("new")}
              >
                New Applications
              </button>
            </div>
            {renderActionButtons()}
          </div>
          <div className="bottom-row">
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {activeTab === "group" && (
              <select
                value={selectedGroupId || ""}
                onChange={(e) => setSelectedGroupId(e.target.value)}
                className="group-select"
              >
                <option value="">Select Group</option>
                {groups.map((group) => (
                  <option key={group.id} value={group.id}>
                    <FaUsers /> {group.name} ({group.studentsCount} students)
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      </div>

      <div className="students-grid">
        {filteredStudents.map((student) => (
          <StudentCard
            key={student?.student?.id || student?.id}
            student={student}
            privatePrice={prices.privatePrice}
            groupPrice={prices.groupPrice}
          />
        ))}
      </div>
      {isCreatingSession && <Loading isVisible={true} />}
      <MemoizedSessionModal
        isOpen={isSessionModalOpen}
        onClose={() => setIsSessionModalOpen(false)}
        onSubmit={handleCreateSession}
        activeTab={activeTab}
        availableGroups={availableGroups}
        availableStudents={availableStudents}
        sessionData={sessionModalData}
        onInputChange={handleInputChange}
        isLoading={isCreatingSession}
      />
    </div>
  );
};

export default Students;
