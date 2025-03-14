import { FaGraduationCap } from "react-icons/fa";
import { useApplyForCourse } from "../../hooks/applyforcourse";
import { useState } from "react";
import { toast } from "react-toastify";
import Loading from "../loading/loading";
import './courseCard.css';

export const CourseCard = ({ course }) => {
    const { execute: applyForCourse, isLoading: isLoadingApply } = useApplyForCourse();
    const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [enrollmentData, setEnrollmentData] = useState({
        availableTime: '',
        userNotes: '',
        sessionType: 'GROUP'
    });

    const handleEnroll = async (e) => {
        e.preventDefault();
        try {
            await applyForCourse({
                courseId: selectedCourse.id,
                ...enrollmentData
            });
            toast.success('Application submitted successfully');
            handleCloseModal();
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to apply');
        }
    };

    const handleCloseModal = () => {
        setIsEnrollModalOpen(false);
        setSelectedCourse(null);
        setEnrollmentData({
            availableTime: '',
            userNotes: '',
            sessionType: 'GROUP'
        });
    };

    if (isLoadingApply) {
        return <Loading isVisible={true} />;
    }

    return <>
        <div key={course.id} className="course-card">
            <div className="top">
                <div className="card-header">
                    <h3>{course.name}</h3>
                </div>
                <p>{course.description}</p>
                <div className="price-info">
                    <span>Group: ${course.groupPrice} / hour</span>
                    <span>Private: ${course.privatePrice} / hour</span>
                </div>
            </div>
            <button
                className="enroll-button"
                onClick={() => {
                    setSelectedCourse(course);
                    setIsEnrollModalOpen(true);
                }}
            >
                <FaGraduationCap /> Enroll Now
            </button>
        </div>
        {isEnrollModalOpen && (
            <div className="modal-overlay">
                <div className="modal">
                    <h2>Enroll in {selectedCourse.name}</h2>
                    <form onSubmit={handleEnroll}>
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
                            value={enrollmentData.userNotes}
                            onChange={e => setEnrollmentData({
                                ...enrollmentData,
                                userNotes: e.target.value
                            })}
                        />
                        <div className="modal-buttons">
                            <button type="submit">Submit Application</button>
                            <button type="button" onClick={handleCloseModal}>Cancel</button>
                        </div>
                    </form>
                </div>
            </div>
        )}
    </>

}