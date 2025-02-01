import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaFile, FaQuestionCircle } from 'react-icons/fa';
import './materials.css';

const Materials = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  return (
    <div className="materials-container">
      <h2>Course Materials</h2>
      <div className="materials-grid">
        <div 
          className="material-card files"
          onClick={() => navigate(`/admin/courses/${id}/materials/files`)}
        >
          <div className="card-content">
            <FaFile className="card-icon" />
            <h3>Files</h3>
            <p>Manage course files and documents</p>
          </div>
        </div>

        <div 
          className="material-card quizzes"
          onClick={() => navigate(`/admin/courses/${id}/materials/quizez`)}
        >
          <div className="card-content">
            <FaQuestionCircle className="card-icon" />
            <h3>Quizzes</h3>
            <p>Manage course quizzes and assessments</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Materials;