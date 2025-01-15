import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useGetQuizzes } from '../../../hooks/getquiziz';
import { useCreateQuiz } from '../../../hooks/createquiz';
import { useDeleteQuiz } from '../../../hooks/deletequiz';
import Loading from '../../../components/loading/loading';
import { toast } from 'react-toastify';
import { FaTrash, FaPlus, FaLink } from 'react-icons/fa';
import './quizez.css';

const Quizez = () => {
  const { id: courseId } = useParams();
  const [quizzes, setQuizzes] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [link, setLink] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const { execute: getQuizzes, isLoading } = useGetQuizzes();
  const { execute: createQuiz, isLoading: isLoadingCreate } = useCreateQuiz();
  const { execute: deleteQuiz, isLoading: isLoadingDelete } = useDeleteQuiz();

  useEffect(() => {
    fetchQuizzes();
  }, [courseId]);

  const fetchQuizzes = async () => {
    try {
      const response = await getQuizzes(courseId);
      setQuizzes(response.data.quizes);
    } catch (error) {
      toast.error('Failed to fetch quizzes');
    }
  };

  const handleCreateQuiz = async (e) => {
    e.preventDefault();
    try {
      await createQuiz(courseId, link);
      toast.success('Quiz created successfully');
      setIsCreateModalOpen(false);
      setLink('');
      fetchQuizzes();
    } catch (error) {
      toast.error('Failed to create quiz');
    }
  };

  const handleDeleteQuiz = async (quizId) => {
    try {
      await deleteQuiz(courseId, quizId);
      toast.success('Quiz deleted successfully');
      fetchQuizzes();
    } catch (error) {
      toast.error('Failed to delete quiz');
    }
  };

  const filteredQuizzes = quizzes.filter(quiz => 
    quiz.link.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading || isLoadingCreate || isLoadingDelete) {
    return <Loading isVisible={true} />;
  }

  return (
    <div className="quizez-container">
      <div className="quizez-header">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search quizzes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="quizez-list">
        {filteredQuizzes.map(quiz => (
          <div key={quiz.id} className="quiz-card">
            <div className="quiz-content">
              <FaLink className="link-icon" />
              <a href={quiz.link} target="_blank" rel="noopener noreferrer">
                {quiz.link}
              </a>
            </div>
          </div>
        ))}
      </div>

     
    </div>
  );
};

export default Quizez;