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
  folderId: string;
}

export interface TimeTableRow {
  time: string; // e.g., "8:00 - 10:00"
  cells: string[]; // one cell per day (index 0 = Monday, …, 6 = Sunday)
}

interface Document {
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
