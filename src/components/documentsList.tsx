import React from "react";

// Define the structure of a document
interface Document {
  id: string;
  textContent: string;
  description: string;
  createdAt: string;
}

// Wrap a Document in an edge interface (common pattern for GraphQL responses)
interface DocumentEdge {
  node: Document;
}

// Props for the DocumentsList component
interface DocumentsListProps {
  documents: DocumentEdge[]; // List of document edges to display
  onEditDocument: (docId: string, currentText: string) => void; // Called when user initiates editing a document
  onDeleteDocument: (docId: string) => void; // Called when user deletes a document
  editingDocumentId: string | null; // ID of the document currently being edited, if any
  editText: string; // The current text in the edit mode for a document
  setEditText: (text: string) => void; // Setter to update the edit text state
  onSaveEdit: (docId: string) => void; // Called to save changes after editing
  onCancelEdit: () => void; // Called to cancel the edit mode
}

const DocumentsList: React.FC<DocumentsListProps> = ({
  documents,
  onEditDocument,
  onDeleteDocument,
  editingDocumentId,
  editText,
  setEditText,
  onSaveEdit,
  onCancelEdit,
}) => {
  return (
    <div>
      {/* Header for the documents section */}
      <h4>Documents:</h4>
      {/* List of documents rendered as an unordered list */}
      <ul className="subfolder-list">
        {documents.map(({ node }) => (
          <li className="subfolder-item" key={node.id}>
            {/* Display document description or fallback message */}
            <strong>{node.description || "No description"}</strong>
            {editingDocumentId === node.id ? (
              // If this document is in edit mode, show a textarea for editing
              <div>
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                />
                {/* Save button to commit the edit */}
                <button onClick={() => onSaveEdit(node.id)}>Save</button>
                {/* Cancel button to exit edit mode */}
                <button onClick={onCancelEdit}>Cancel</button>
              </div>
            ) : (
              // Otherwise, display the document's text content
              <p>{node.textContent}</p>
            )}
            {/* Show creation date of the document */}
            <small>Created at: {node.createdAt}</small>
            {editingDocumentId !== node.id && (
              <>
                {/* Button to trigger editing of this document */}
                <button
                  onClick={() => onEditDocument(node.id, node.textContent)}
                >
                  Edit
                </button>
                {/* Button to trigger deletion of this document */}
                <button onClick={() => onDeleteDocument(node.id)}>
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

export default DocumentsList;
