import React, { useEffect, useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { useParams } from "react-router-dom";
// GraphQL query and mutations imported from separate API files
import { GET_FOLDER_CONTENTS } from "../api/querries";
import {
  CREATE_DOCUMENT_MUTATION,
  DELETE_DOCUMENT_MUTATION,
  UPDATE_DOCUMENT_MUTATION,
} from "../api/mutations";
// Type definitions for folder/document data
import { FolderDocumentData as FolderData } from "../interfaces";

const MaterialsNotesPage: React.FC = () => {
  // Retrieve folderId from URL parameters
  const { folderId } = useParams<{ folderId: string }>();

  // Fetch folder contents (documents, subfolders, etc.) using the folderId
  const { loading, error, data, refetch } = useQuery<FolderData>(
    GET_FOLDER_CONTENTS,
    {
      variables: { ids: [folderId] },
    }
  );

  // Local state for new document's text content and description
  const [textContent, setTextContent] = useState("");
  const [description, setDescription] = useState("");

  // State for handling document editing
  const [editingDocumentId, setEditingDocumentId] = useState<string | null>(
    null
  );
  const [editText, setEditText] = useState("");

  // Refetch data on component mount (optional, ensures data freshness)
  useEffect(() => {
    refetch();
  }, []);

  // Mutation for creating a new document; automatically refetch folder contents on success
  const [createDocument] = useMutation(CREATE_DOCUMENT_MUTATION, {
    refetchQueries: [
      { query: GET_FOLDER_CONTENTS, variables: { ids: [folderId] } },
    ],
  });

  // Mutation for updating document contents
  const [updateDocument] = useMutation(UPDATE_DOCUMENT_MUTATION, {
    refetchQueries: [
      { query: GET_FOLDER_CONTENTS, variables: { ids: [folderId] } },
    ],
  });

  // Mutation for deleting a document; refetches folder contents afterward
  const [deleteDocument] = useMutation(DELETE_DOCUMENT_MUTATION, {
    refetchQueries: [
      { query: GET_FOLDER_CONTENTS, variables: { ids: [folderId] } },
    ],
  });

  // Render loading/error states if necessary
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  // Extract the folder from returned data
  const folder = data?.foldersById.edges[0]?.node;
  if (!folder) return <div>No folder found</div>;

  // Handler: Create a new document using the provided text and description.
  // This mutation sends the new document data and then resets the form fields.
  const handleCreateDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createDocument({
        variables: {
          folderId,
          textContent,
          description,
        },
      });
      // Clear form inputs on success
      setTextContent("");
      setDescription("");
    } catch (err) {
      console.error("Error creating document:", err);
    }
  };

  // Handler: Initiate editing for a document by setting its ID and preloading its current text.
  const handleEditDocument = (docId: string, currentText: string) => {
    setEditingDocumentId(docId);
    setEditText(currentText);
  };

  // Handler: Save the updated document text via mutation and end edit mode.
  const handleSaveEdit = async (docId: string) => {
    try {
      await updateDocument({
        variables: {
          id: docId,
          textContent: editText,
        },
      });
      setEditingDocumentId(null);
    } catch (err) {
      console.error("Error updating document:", err);
    }
  };

  // Handler: Delete the document after confirming user intention.
  const handleDeleteDocument = async (docId: string) => {
    if (!window.confirm("Are you sure you want to delete this document?")) {
      // Do not return JSX from non-render functions—simply exit.
      return;
    }
    try {
      await deleteDocument({
        variables: {
          input: { id: docId },
        },
      });
    } catch (err) {
      console.error("Error deleting document:", err);
    }
  };

  return (
    <div>
      {/* Folder name header */}
      <h3>Contents of Folder: {folder.name}</h3>

      {/* List Documents */}
      <h4>Documents:</h4>
      <ul className="subfolder-list">
        {folder.documents.edges.map(({ node }) => (
          <li className="subfolder-item" key={node.id}>
            {/* Display document description; falls back to a default string */}
            <strong>{node.description || "No description"}</strong>
            {/* Toggle between edit mode and view mode */}
            {editingDocumentId === node.id ? (
              <div>
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                />
                <button onClick={() => handleSaveEdit(node.id)}>Save</button>
                <button onClick={() => setEditingDocumentId(null)}>
                  Cancel
                </button>
              </div>
            ) : (
              <p>{node.textContent}</p>
            )}
            <small>Created at: {node.createdAt}</small>
            {/* Action buttons: only show edit and delete when not editing */}
            {editingDocumentId !== node.id && (
              <>
                <button
                  onClick={() => handleEditDocument(node.id, node.textContent)}
                >
                  Edit
                </button>
                <button
                  style={{ color: "red" }}
                  onClick={() => handleDeleteDocument(node.id)}
                >
                  Delete
                </button>
              </>
            )}
          </li>
        ))}
      </ul>

      {/* Document Creation Form */}
      <h4>Create a New Document:</h4>
      <form onSubmit={handleCreateDocument}>
        <div>
          <label htmlFor="description">Description:</label>
          <input
            type="text"
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter document description"
          />
        </div>
        <div>
          <label htmlFor="textContent">Text Content:</label>
          <textarea
            id="textContent"
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
            placeholder="Enter document text content"
          />
        </div>
        <button type="submit">Create Document</button>
      </form>
    </div>
  );
};

export default MaterialsNotesPage;
