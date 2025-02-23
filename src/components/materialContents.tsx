import React, { useState } from "react";
import "./materialContents.css";
import { useQuery, useMutation } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import { GET_FOLDER_CONTENTS } from "../api/querries";
import {
  CREATE_DOCUMENT_MUTATION,
  DELETE_SUBFOLDER,
  UPDATE_SUBFOLDER_NAME,
} from "../api/mutations";
import { FolderContentsProps, FolderData, TimeTableRow } from "../interfaces";

const MaterialContents: React.FC<FolderContentsProps> = ({ folderId }) => {
  // Fetch folder contents using the provided folderId
  const { loading, error, data } = useQuery<FolderData>(GET_FOLDER_CONTENTS, {
    variables: { ids: [folderId] },
  });

  // Mutation for updating subfolder name, with automatic refetching on success
  const [updateSubfolder] = useMutation(UPDATE_SUBFOLDER_NAME, {
    refetchQueries: [
      { query: GET_FOLDER_CONTENTS, variables: { ids: [folderId] } },
    ],
  });

  // Mutation for deleting a subfolder, with refetching once done
  const [deleteSubfolder] = useMutation(DELETE_SUBFOLDER, {
    refetchQueries: [
      { query: GET_FOLDER_CONTENTS, variables: { ids: [folderId] } },
    ],
  });

  // Mutation for creating a new document. Its refetchQueries option makes sure UI updates.
  const [createDocumentMutation] = useMutation(CREATE_DOCUMENT_MUTATION, {
    refetchQueries: [
      { query: GET_FOLDER_CONTENTS, variables: { ids: [folderId] } },
    ],
  });
  // used to navigate in the app
  const navigate = useNavigate();

  // Local state for editing subfolder names
  const [editingSubfolder, setEditingSubfolder] = useState<string | null>(null);
  const [subfolderName, setSubfolderName] = useState("");

  // state for document creation form — letting users customize document content.
  const [showDocumentForm, setShowDocumentForm] = useState(false);
  const [docContent, setDocContent] = useState("");
  const [docDescription, setDocDescription] = useState("");
  const [targetFolderId, setTargetFolderId] = useState("");

  // Handler to open the document creation form based on the current timetable material.
  const handleAddDocumentForCurrentTime = () => {
    // Retrieve timetable from localStorage
    const storedTimetable = localStorage.getItem("timetable");
    if (!storedTimetable) {
      console.log("No timetable found.");
      return;
    }
    const timetable: TimeTableRow[] = JSON.parse(storedTimetable);
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    // Map JavaScript day index [0 = Sunday] to our timetable index (0 = Monday, …, 6 = Sunday)
    const jsDay = now.getDay();
    const dayIndex = jsDay === 0 ? 6 : jsDay - 1;

    // Iterate timetable rows to check if current time is within a given interval
    const matchingRow = timetable.find((row) => {
      const [startStr, endStr] = row.time.split(" - ");
      if (!startStr || !endStr) return false;
      // Convert start/end times into minutes
      const [startH, startM] = startStr.split(":").map(Number);
      const [endH, endM] = endStr.split(":").map(Number);
      const startMinutes = startH * 60 + startM;
      const endMinutes = endH * 60 + endM;
      return currentMinutes >= startMinutes && currentMinutes < endMinutes;
    });

    if (!matchingRow) {
      console.log("No matching time interval found in timetable.");
      return;
    }

    const cellContent = matchingRow.cells[dayIndex].trim();
    if (!cellContent) {
      console.log("No material exists in the timetable for the current time.");
      return;
    }

    // Locate the subfolder that matches the cell material
    const folder = data?.foldersById.edges[0]?.node;
    if (!folder) {
      console.log("Main folder not found.");
      return;
    }
    const matchingSubfolder = folder.subfolders.edges.find(
      ({ node }) => node.name === cellContent
    );
    if (!matchingSubfolder) {
      console.log("No matching subfolder found for the current material.");
      return;
    }
    // Set target folder
    setTargetFolderId(matchingSubfolder.node.id);
    // You may choose to prefill these values:
    // setDocContent(cellContent);
    // setDocDescription(matchingRow.time);
    setShowDocumentForm(true);
  };

  // Handle document creation form submission with user's inputs
  const handleSubmitDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createDocumentMutation({
        variables: {
          folderId: targetFolderId,
          textContent: docContent,
          description: docDescription,
        },
      });
      console.log("Document created with provided inputs.");
      // Reset form states after successful creation
      setDocContent("");
      setDocDescription("");
      setTargetFolderId("");
      setShowDocumentForm(false);
    } catch (err) {
      console.error("Error creating document:", err);
    }
  };

  // Display loading or error states early.
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  // Early fallback if folder is not found
  const folder = data?.foldersById.edges[0]?.node;
  if (!folder) return <div>No folder found</div>;

  // Handlers for editing and deleting subfolders.
  const handleEditSubfolder = (id: string, currentName: string) => {
    setEditingSubfolder(id);
    setSubfolderName(currentName);
  };

  const handleSaveSubfolder = async (id: string) => {
    await updateSubfolder({
      variables: { id, name: subfolderName },
    });
    setEditingSubfolder(null);
  };

  const handleDeleteSubfolder = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this subfolder?")) {
      await deleteSubfolder({ variables: { id } });
    }
  };

  return (
    <div>
      {/* Navigation button */}
      {/* <button
        onClick={() => navigate("/")}
        style={{ fontSize: "1.2rem", cursor: "pointer", marginBottom: "10px" }}
      >
        ⬅ Back to Home
      </button> */}

      <h3>Contents of Folder: {folder.name}</h3>

      {/* Button to trigger document creation based on current time/timetable */}
      <button
        onClick={handleAddDocumentForCurrentTime}
        style={{ marginBottom: "15px" }}
      >
        Add Document for Current Time
      </button>

      {/* Document creation form: showing only when showDocumentForm is true */}
      {showDocumentForm && (
        <form onSubmit={handleSubmitDocument} style={{ marginBottom: "20px" }}>
          <h4>Create Document</h4>
          <div>
            <label>
              Content:
              <input
                type="text"
                value={docContent}
                onChange={(e) => setDocContent(e.target.value)}
              />
            </label>
          </div>
          <div>
            <label>
              Description:
              <input
                type="text"
                value={docDescription}
                onChange={(e) => setDocDescription(e.target.value)}
              />
            </label>
          </div>
          <button type="submit">Create Document</button>
          <button type="button" onClick={() => setShowDocumentForm(false)}>
            Cancel
          </button>
        </form>
      )}

      {/* Displaying subfolders with options to edit or delete */}
      <h4>Subfolders:</h4>
      <ul className="subfolder-list">
        {folder.subfolders.edges.map(({ node }) => (
          <li className="subfolder-item" key={node.id} style={{ marginBottom: "10px" }}>
            {editingSubfolder === node.id ? (
              <div >
                <input
                  type="text"
                  value={subfolderName}
                  onChange={(e) => setSubfolderName(e.target.value)}
                />
                <button onClick={() => handleSaveSubfolder(node.id)}>
                  Save
                </button>
                <button onClick={() => setEditingSubfolder(null)}>
                  Cancel
                </button>
              </div>
            ) : (
              <>
                <span
                  onClick={() => navigate(`/folder/${node.id}`)}
                  style={{ cursor: "pointer", color: "blue" }}
                >
                  <strong>{node.name}</strong>
                </span>
                <p>{node.documentCount} document(s)</p>
                <button onClick={() => handleEditSubfolder(node.id, node.name)}>
                  Edit
                </button>
                <button
                  style={{ color: "red" }}
                  onClick={() => handleDeleteSubfolder(node.id)}
                >
                  Delete
                </button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MaterialContents;
