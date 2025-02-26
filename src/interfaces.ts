export interface Subfolder {
  id: string;
  name: string;
  documentCount: number;
}

export interface Folder {
  id: string;
  name: string;
  documents: {
    edges: {
      node: {
        id: string;
        textContent: string;
        createdAt: string;
        description: string;
      };
    }[];
  };
  subfolders: {
    edges: {
      node: Subfolder;
    }[];
  };
}

export interface FolderData {
  foldersById: {
    edges: {
      node: Folder;
    }[];
  };
}

export interface FolderContentsProps {
  folderIds: string[];
}

export interface TimeTableRow {
  time: string; // e.g., "8:00 - 10:00"
  cells: string[]; // one cell per day (index 0 = Monday, …, 6 = Sunday)
}

export interface Document {
  id: string;
  textContent: string;
  createdAt: string;
  description: string;
}

export interface FolderWithDocuments {
  id: string;
  name: string;
  documents: {
    edges: {
      node: Document;
    }[];
  };
}
export interface FolderDocumentData {
  foldersById: {
    edges: {
      node: Folder;
    }[];
  };
}

export interface TimeTableRow {
  time: string; // e.g., "8:00 - 10:00"
  cells: string[]; // one cell per day
}
export interface DocumentEdge {
  node: Document;
}
export interface DocumentsListProps {
  documents: DocumentEdge[]; // List of document edges to display
  onEditDocument: (docId: string, currentText: string) => void; // Called when user initiates editing a document
  onDeleteDocument: (docId: string) => void; // Called when user deletes a document
  editingDocumentId: string | null; // ID of the document currently being edited, if any
  editText: string; // The current text in the edit mode for a document
  setEditText: (text: string) => void; // Setter to update the edit text state
  onSaveEdit: (docId: string) => void; // Called to save changes after editing
  onCancelEdit: () => void; // Called to cancel the edit mode
}
export interface FoldersResponse {
  foldersById: {
    edges: Array<{
      node: {
        id: string;
        name: string;
        documents: {
          edges: Array<{
            node: Document;
          }>;
        };
      };
    }>;
  };
}

export interface TimetableRowProps {
  row: TimeTableRow;
  rowIndex: number;
  onTimeChange: (rowIndex: number, value: string) => void;
  onCellChange: (rowIndex: number, cellIndex: number, value: string) => void;
  onRemove: (rowIndex: number) => void;
}