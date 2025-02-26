import React, { useEffect, useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import { GET_FOLDER_CONTENTS } from "../api/querries";
import {
  CREATE_DOCUMENT_MUTATION,
  DELETE_SUBFOLDER,
  UPDATE_SUBFOLDER_NAME,
} from "../api/mutations";
import { FolderContentsProps, FolderData, TimeTableRow } from "../interfaces";
import { Button, TextField } from "@mui/material/";

const MaterialContents: React.FC<FolderContentsProps> = ({ folderIds }) => {
  // Fetch folder contents using the provided folderId
  const { loading, error, data, refetch } = useQuery<FolderData>(
    GET_FOLDER_CONTENTS,
    {
      variables: { ids: folderIds[0] },
    }
  );

  // Mutation for updating subfolder name, with automatic refetching on success
  const [updateSubfolder] = useMutation(UPDATE_SUBFOLDER_NAME, {
    refetchQueries: [
      { query: GET_FOLDER_CONTENTS, variables: { ids: [folderIds[0]] } },
    ],
  });

  // Mutation for deleting a subfolder, with refetching once done
  const [deleteSubfolder] = useMutation(DELETE_SUBFOLDER, {
    refetchQueries: [
      { query: GET_FOLDER_CONTENTS, variables: { ids: [folderIds[0]] } },
    ],
  });

  // Mutation for creating a new document. Its refetchQueries option makes sure UI updates.
  const [createDocumentMutation] = useMutation(CREATE_DOCUMENT_MUTATION, {
    refetchQueries: [
      { query: GET_FOLDER_CONTENTS, variables: { ids: [folderIds[0]] } },
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
  // Add useEffect to listen for folder changes
  useEffect(() => {
    // Refetch when folderId changes or component mounts
    refetch();
  }, [folderIds, refetch]);

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
    // Handle exceptional cases
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
  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4">Error: {error.message}</div>;

  // Early fallback if folder is not found
  const folder = data?.foldersById.edges[0]?.node;
  if (!folder) return <div className="p-4">No folder found</div>;

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
    <div className="p-4">
      {/* Navigation button */}
      {/* <Button variant="text" onClick={() => navigate("/")} className="mb-4">
        ⬅ Back to Home
      </Button> */}

      <h3 className="text-xl font-semibold mb-4">
        Contents of Folder: {folder.name}
      </h3>

      {/* Button to trigger document creation based on current time/timetable */}
      <Button
        variant="contained"
        color="primary"
        onClick={handleAddDocumentForCurrentTime}
        sx={{ mb: 2 }}
      >
        Add Document for Current Time
      </Button>

      {/* Document creation form: showing only when showDocumentForm is true */}
      {showDocumentForm && (
        <form
          onSubmit={handleSubmitDocument}
          className="mb-6 p-4 border rounded"
        >
          <h4 className="text-lg font-medium mb-4">Create Document</h4>
          <div className="mb-4">
            <TextField
              label="Content"
              value={docContent}
              onChange={(e) => setDocContent(e.target.value)}
              variant="outlined"
              size="small"
              fullWidth
            />
          </div>
          <div className="mb-4">
            <TextField
              label="Description"
              value={docDescription}
              onChange={(e) => setDocDescription(e.target.value)}
              variant="outlined"
              size="small"
              fullWidth
            />
          </div>
          <div className="space-x-2">
            <Button
              sx={{ mr: 1 }}
              type="submit"
              variant="contained"
              color="primary"
            >
              Create Document
            </Button>
            <Button
              type="button"
              variant="outlined"
              color="secondary"
              onClick={() => setShowDocumentForm(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      {/* Displaying subfolders with options to edit or delete */}
      <h4 className="text-lg font-medium mb-2">Subfolders:</h4>
      <ul className="space-y-4">
        {folder.subfolders.edges.map(({ node }) => (
          <li key={node.id} className="p-4 border rounded">
            {editingSubfolder === node.id ? (
              <div className="flex items-center space-x-2">
                <TextField
                  value={subfolderName}
                  onChange={(e) => setSubfolderName(e.target.value)}
                  variant="outlined"
                  size="small"
                  className="flex-1"
                />
                <Button
                  sx={{ mr: 1, ml: 1 }}
                  variant="contained"
                  color="primary"
                  onClick={() => handleSaveSubfolder(node.id)}
                >
                  Save
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => setEditingSubfolder(null)}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <div className="flex flex-col">
                <span
                  onClick={() => navigate(`/folder/${node.id}`)}
                  className="cursor-pointer text-blue-600 font-bold mb-1"
                >
                  {node.name}
                </span>
                <p className="mb-2">{node.documentCount} document(s)</p>
                <div className="space-x-2">
                  <Button
                    sx={{ mr: 1 }}
                    variant="contained"
                    color="primary"
                    onClick={() => handleEditSubfolder(node.id, node.name)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => handleDeleteSubfolder(node.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MaterialContents;
