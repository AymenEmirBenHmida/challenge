import React, { useEffect, useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { useParams } from "react-router-dom";
// Import GraphQL queries and mutations
import { GET_FOLDER_CONTENTS } from "../api/querries";
import {
  CREATE_DOCUMENT_MUTATION,
  DELETE_DOCUMENT_MUTATION,
  UPDATE_DOCUMENT_MUTATION,
} from "../api/mutations";
// Import type definitions for folder and document data
import { FolderDocumentData as FolderData } from "../interfaces";
// Import a separate component for rendering the documents list
import DocumentsList from "../components/documentsList";

const MaterialsNotesPage: React.FC = () => {
  // Retrieve folderId from URL parameters
  const { folderId } = useParams<{ folderId: string }>();

  // Use the GET_FOLDER_CONTENTS query to fetch folder details (documents, subfolders, etc.)
  // refetch can be used to reload data when mutations occur
  const { loading, error, data, refetch } = useQuery<FolderData>(
    GET_FOLDER_CONTENTS,
    {
      variables: { ids: [folderId] },
    }
  );

  // Local state for holding new document data (textContent and description)
  const [textContent, setTextContent] = useState("");
  const [description, setDescription] = useState("");

  // Local state for handling document editing:
  // editingDocumentId stores the id of the document currently being edited.
  const [editingDocumentId, setEditingDocumentId] = useState<string | null>(
    null
  );
  // editText holds the updated text content during edit mode.
  const [editText, setEditText] = useState("");

  // Use effect to refetch data when the component mounts ensuring data freshness
  useEffect(() => {
    refetch();
  }, []);

  // Mutation hook to create a new document;
  // refetchQueries is used to update the current folder's contents after creation of document
  const [createDocument] = useMutation(CREATE_DOCUMENT_MUTATION, {
    refetchQueries: [
      { query: GET_FOLDER_CONTENTS, variables: { ids: [folderId] } },
    ],
  });

  // mutation hook to update an existing document's text content
  const [updateDocument] = useMutation(UPDATE_DOCUMENT_MUTATION, {
    refetchQueries: [
      { query: GET_FOLDER_CONTENTS, variables: { ids: [folderId] } },
    ],
  });

  // Mutation hook to delete a document
  const [deleteDocument] = useMutation(DELETE_DOCUMENT_MUTATION, {
    refetchQueries: [
      { query: GET_FOLDER_CONTENTS, variables: { ids: [folderId] } },
    ],
  });

  // Render loading and error states
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  // Extract the folder from the data returned by the query
  const folder = data?.foldersById.edges[0]?.node;
  if (!folder) return <div>No folder found</div>;

  // Handler to create a new document. On form submission:
  // • Calls the mutation with folderId, textContent, and description.
  // • Clears the form inputs upon success.
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
      setTextContent("");
      setDescription("");
    } catch (err) {
      console.error("Error creating document:", err);
    }
  };

  // Handler to initiate edit mode for a document.
  // Sets the editingDocumentId to the selected document id and preloads its current text.
  const handleEditDocument = (docId: string, currentText: string) => {
    setEditingDocumentId(docId);
    setEditText(currentText);
  };

  // Handler to save the edited document.
  // Calls the update mutation with the new text and exits edit mode.
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

  // Handler to delete a document.
  // Asks for user confirmation before calling the delete mutation.
  const handleDeleteDocument = async (docId: string) => {
    if (!window.confirm("Are you sure you want to delete this document?")) {
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
      <h3>Contents of Folder: {folder.name}</h3>

      {/* Render the list of documents using the separate DocumentsList component.
          Pass down all required props and handler functions for editing and deletion. */}
      <DocumentsList
        documents={folder.documents.edges}
        onEditDocument={handleEditDocument}
        onDeleteDocument={handleDeleteDocument}
        editingDocumentId={editingDocumentId}
        editText={editText}
        setEditText={setEditText}
        onSaveEdit={handleSaveEdit}
        onCancelEdit={() => setEditingDocumentId(null)}
      />

      {/* Document Creation Form for adding a new document to the folder */}
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
