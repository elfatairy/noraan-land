import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useCourseFiles } from "../../../hooks/coursefileshook";
import Loading from "../../../components/loading/loading";
import { toast } from "react-toastify";
import { FaFolder, FaFile, FaChevronRight } from "react-icons/fa";
import "./files.css";

const Files = () => {
  const { id: courseId } = useParams();
  const [currentPath, setCurrentPath] = useState("");
  const [content, setContent] = useState([]);
  const [breadcrumbs, setBreadcrumbs] = useState([""]);

  const { isLoading, openFolder, downloadFile } = useCourseFiles();

  useEffect(() => {
    fetchContent();
  }, [currentPath]);

  const fetchContent = async () => {
    try {
      const response = await openFolder(courseId, currentPath);
      setContent(response.data.content || []);
    } catch (error) {
      toast.error('Failed to fetch content');
    }
  };

  const handleNavigate = (index) => {
    const newPath = breadcrumbs.slice(0, index + 1).join('/');
    setCurrentPath(newPath);
    setBreadcrumbs(breadcrumbs.slice(0, index + 1));
  };

  const handleFolderClick = (folder) => {
    const newPath = currentPath ? `${currentPath}/${folder}` : folder;
    setCurrentPath(newPath);
    setBreadcrumbs([...breadcrumbs, folder]);
  };

  const handleDownload = async (file) => {
    try {
      const path = currentPath ? `${currentPath}/${file}` : file;
      await downloadFile(courseId, path);
    } catch (error) {
      toast.error('Failed to download file');
    }
  };

  if (isLoading) return <Loading isVisible={true} />;

  return (
    <div className="files-container">
      <div className="files-header">
        <div className="breadcrumbs">
          {breadcrumbs.map((crumb, index) => (
            <span key={index} className="breadcrumb-item">
              <button onClick={() => handleNavigate(index)}>
                {crumb || 'Root'}
              </button>
              {index < breadcrumbs.length - 1 && <FaChevronRight />}
            </span>
          ))}
        </div>
      </div>

      <div className="files-grid">
        {content.map((item) => (
          <div key={item} className="file-card">
            <div className="file-icon">
              {item.includes('.') ? <FaFile /> : <FaFolder />}
            </div>
            <span className="file-name">{item}</span>
            <div className="file-actions">
              {item.includes('.') ? (
                <button onClick={() => handleDownload(item)}>Download</button>
              ) : (
                <button onClick={() => handleFolderClick(item)}>Open</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Files;
