import "../App.css";
import MaterialContents from "../components/materialContents";
import { Button, TextField } from "@mui/material";
import { useFolders } from "../hooks/useFolders";

function MaterialsPage() {
  // Importing the root fodler id from the environment variables
  const root_folder_api = import.meta.env.VITE_ROOT_FOLDER_ID;
  const {
    folderName,
    setFolderName,
    loading,
    error: queryError,
    handleCreateFolder,
    folderIds
  } = useFolders(root_folder_api);

  if (loading) return <div>Loading...</div>;
  if (queryError) return <div>Error: {queryError.message}</div>;

  return (
    <div className="p-4">
      <TextField
        label="Folder Name"
        value={folderName}
        onChange={(e) => setFolderName(e.target.value)}
        variant="outlined"
        size="small"
        className="mb-4 mr-2"
      />
      <Button
        variant="contained"
        color="primary"
        onClick={handleCreateFolder}
        disabled={!folderName.trim()}
        sx={{ ml: 1 }}
      >
        Create Folder
      </Button>
      <MaterialContents folderIds={folderIds} />
    </div>
  );
}

export default MaterialsPage;
