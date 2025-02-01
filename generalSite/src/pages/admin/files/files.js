import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useCourseFiles } from "../../../hooks/coursefileshook";
import Loading from "../../../components/loading/loading";
import { toast } from "react-toastify";
import {
  FaFolder,
  FaFile,
  FaUpload,
  FaFolderPlus,
  FaPencilAlt,
  FaTrash,
  FaChevronRight,
} from "react-icons/fa";
import "./files.css";

const Files = () => {
  const { id: courseId } = useParams();
  const [currentPath, setCurrentPath] = useState("");
  const [content, setContent] = useState([]);
  const [breadcrumbs, setBreadcrumbs] = useState([""]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const {
    isLoading,
    openFolder,
    createFolder,
    downloadFile,
    uploadFile: uploadFileApi,
    renameItem,
    deleteItem,
  } = useCourseFiles();

  useEffect(() => {
    fetchContent();
  }, [currentPath]);

  const fetchContent = async () => {
    try {
      const response = await openFolder(courseId, currentPath);
      setContent(response.data.content || []);
    } catch (error) {
      toast.error("Failed to fetch content");
    }
  };

  const handleFileSelect = (e) => {
    setUploadFile(e.target.files[0]);
    setIsUploadModalOpen(true);
  };

  const handleNavigate = (index) => {
    const newPath = breadcrumbs.slice(0, index + 1).join("/");
    setCurrentPath(newPath);
    setBreadcrumbs(breadcrumbs.slice(0, index + 1));
  };

  const handleFolderClick = (folder) => {
    const newPath = currentPath ? `${currentPath}/${folder}` : folder;
    setCurrentPath(newPath);
    setBreadcrumbs([...breadcrumbs, folder]);
  };

  const handleCreateFolder = async (e) => {
    e.preventDefault();
    try {
      await createFolder(courseId, currentPath, newFolderName);
      toast.success("Folder created successfully");
      setIsCreateModalOpen(false);
      setNewFolderName("");
      fetchContent();
    } catch (error) {
      toast.error("Failed to create folder");
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile) {
      toast.error("Please select a file");
      return;
    }

    try {
      await uploadFileApi(courseId, currentPath, uploadFile);
      toast.success("File uploaded successfully");
      setIsUploadModalOpen(false);
      setUploadFile(null);
      fetchContent();
    } catch (error) {
      toast.error("Failed to upload file");
      setUploadFile(null);
    }
  };

  const handleRename = async (e) => {
    e.preventDefault();
    try {
      const path = currentPath
        ? `${currentPath}/${selectedItem}`
        : selectedItem;
      await renameItem(courseId, path, newFolderName);
      toast.success("Item renamed successfully");
      setIsRenameModalOpen(false);
      setNewFolderName("");
      setSelectedItem(null);
      fetchContent();
    } catch (error) {
      toast.error("Failed to rename item");
    }
  };

  const handleDelete = async (item) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        const path = currentPath ? `${currentPath}/${item}` : item;
        await deleteItem(courseId, path);
        toast.success("Item deleted successfully");
        fetchContent();
      } catch (error) {
        toast.error("Failed to delete item");
      }
    }
  };

  const handleDownload = async (file) => {
    try {
      const path = currentPath ? `${currentPath}/${file}` : file;
      await downloadFile(courseId, path);
    } catch (error) {
      toast.error("Failed to download file");
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
                {crumb || "Root"}
              </button>
              {index < breadcrumbs.length - 1 && <FaChevronRight />}
            </span>
          ))}
        </div>
        <div className="action-buttons">
          <button
            className="create-button"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <FaFolderPlus /> New Folder
          </button>
          <label className="upload-button">
            <FaUpload /> Upload File
            <input type="file" onChange={handleFileSelect} hidden />
          </label>
        </div>
      </div>

      <div className="files-grid">
        {content.map((item) => (
          <div key={item} className="file-card">
            <div className="file-icon">
              {item.includes(".") ? <FaFile /> : <FaFolder />}
            </div>
            <span className="file-name">{item}</span>
            <div className="file-actions">
              {item.includes(".") ? (
                <button onClick={() => handleDownload(item)}>Download</button>
              ) : (
                <button onClick={() => handleFolderClick(item)}>Open</button>
              )}
              <button
                className="rename-button"
                onClick={() => {
                  setSelectedItem(item);
                  setNewFolderName(item);
                  setIsRenameModalOpen(true);
                }}
              >
                <FaPencilAlt />
              </button>
              <button
                className="delete-button"
                onClick={() => handleDelete(item)}
              >
                <FaTrash />
              </button>
            </div>
          </div>
        ))}
      </div>

      {isUploadModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Upload File</h2>
            <form onSubmit={handleFileUpload}>
              <p>Selected file: {uploadFile?.name}</p>
              <div className="modal-buttons">
                <button type="submit">Upload</button>
                <button
                  type="button"
                  onClick={() => {
                    setIsUploadModalOpen(false);
                    setUploadFile(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isCreateModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Create New Folder</h2>
            <form onSubmit={handleCreateFolder}>
              <input
                type="text"
                placeholder="Folder Name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                required
              />
              <div className="modal-buttons">
                <button type="submit">Create</button>
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setNewFolderName("");
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isRenameModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Rename Item</h2>
            <form onSubmit={handleRename}>
              <input
                type="text"
                placeholder="New Name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                required
              />
              <div className="modal-buttons">
                <button type="submit">Rename</button>
                <button
                  type="button"
                  onClick={() => {
                    setIsRenameModalOpen(false);
                    setNewFolderName("");
                    setSelectedItem(null);
                  }}
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

export default Files;
