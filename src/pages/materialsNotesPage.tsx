import React, { useState, useCallback } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { useParams } from "react-router-dom";
import { GET_FOLDER_CONTENTS } from "../api/querries";
import {
  CREATE_DOCUMENT_MUTATION,
  DELETE_DOCUMENT_MUTATION,
  UPDATE_DOCUMENT_MUTATION,
} from "../api/mutations";
import { FolderDocumentData as FolderData } from "../interfaces";
import {
  Button,
  TextField,
  Typography,
  Card,
  CardContent,
} from "@mui/material";
import DocumentsList from "../components/documentsList";

// Add memoization for expensive operations and because DocumentsList might receive the same props and has comples render logic
const MemoizedDocumentsList = React.memo(DocumentsList);

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

  // Unnecessary
  // const refreshData = useCallback(() => {
  //   refetch();
  // }, [refetch]);

  // Mutation for creating a new document, automatically refetch folder contents on success
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

  // Mutation for deleting a document, refetches folder contents afterward
  const [deleteDocument] = useMutation(DELETE_DOCUMENT_MUTATION, {
    refetchQueries: [
      { query: GET_FOLDER_CONTENTS, variables: { ids: [folderId] } },
    ],
  });

  // Optimize document creation handler with useCallback
  const handleCreateDocument = useCallback(
    async (e: React.FormEvent) => {
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
    },
    [createDocument, folderId, textContent, description]
  );

  // Optimize edit handler with useCallback
  const handleEditDocument = useCallback(
    (docId: string, currentText: string) => {
      setEditingDocumentId(docId);
      setEditText(currentText);
    },
    []
  );

  // Optimize save edit handler with useCallback
  const handleSaveEdit = useCallback(
    async (docId: string) => {
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
    },
    [updateDocument, editText]
  );

  // Optimize delete handler with useCallback
  const handleDeleteDocument = useCallback(
    async (docId: string) => {
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
    },
    [deleteDocument]
  );

  // Optimize cancel edit handler with useCallback
  const handleCancelEdit = useCallback(() => {
    setEditingDocumentId(null);
  }, []);

  // Render loading/error states if necessary
  if (loading) return <div className="p-4">Loading...</div>;
  if (error)
    return <div className="p-4 text-red-600">Error: {error.message}</div>;

  // Extract the folder from returned data
  const folder = data?.foldersById.edges[0]?.node;
  if (!folder) return <div className="p-4">No folder found</div>;

  return (
    <div className="p-4">
      <Typography variant="h4" className="mb-6">
        Contents of Folder: {folder.name}
      </Typography>

      {/* Document Creation Form */}
      <Card className="mb-8">
        <CardContent>
          <Typography variant="h6" className="mb-4">
            Create a New Document:
          </Typography>
          <form onSubmit={handleCreateDocument} className="space-y-4">
            <div>
              <TextField
                fullWidth
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter document description"
                variant="outlined"
              />
            </div>
            <div>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Text Content"
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                placeholder="Enter document text content"
                variant="outlined"
              />
            </div>
            <Button type="submit" variant="contained" color="primary">
              Create Document
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Documents List */}
      <MemoizedDocumentsList
        documents={folder.documents.edges}
        onEditDocument={handleEditDocument}
        onDeleteDocument={handleDeleteDocument}
        editingDocumentId={editingDocumentId}
        editText={editText}
        setEditText={setEditText}
        onSaveEdit={handleSaveEdit}
        onCancelEdit={handleCancelEdit}
      />
    </div>
  );
};

export default MaterialsNotesPage;
