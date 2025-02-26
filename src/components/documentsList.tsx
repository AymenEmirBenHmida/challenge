import React from "react";
import { DocumentsListProps } from "../interfaces";
import {
  Button,
  TextField,
  Card,
  CardContent,
  Typography,
} from "@mui/material";

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
    <div className="mt-6">
      <Typography variant="h5" className="mb-4">
        Documents:
      </Typography>
      <div className="space-y-4">
        {documents.map(({ node }) => (
          <Card key={node.id} className="w-full">
            <CardContent>
              <Typography variant="h6" className="font-bold mb-2">
                {node.description || "No description"}
              </Typography>

              {editingDocumentId === node.id ? (
                <div className="space-y-4">
                  <TextField
                    multiline
                    rows={4}
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    variant="outlined"
                    fullWidth
                  />
                  <div className="space-x-2 mt-[5px]">
                    <Button
                      sx={{ mr: 1 }}
                      variant="contained"
                      color="primary"
                      onClick={() => onSaveEdit(node.id)}
                    >
                      Save
                    </Button>
                    <Button
                      variant="outlined"
                      color="secondary"
                      onClick={onCancelEdit}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <Typography variant="body1" className="whitespace-pre-wrap">
                    {node.textContent}
                  </Typography>
                  <Typography variant="caption" className="block text-gray-600">
                    Created at: {node.createdAt}
                  </Typography>
                  <div className="space-x-2">
                    <Button
                      sx={{ mr: 1 }}
                      variant="contained"
                      color="primary"
                      onClick={() => onEditDocument(node.id, node.textContent)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => onDeleteDocument(node.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DocumentsList;
