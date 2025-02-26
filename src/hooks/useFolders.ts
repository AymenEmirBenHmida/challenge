import { useState, useCallback } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { GET_FOLDERS } from "../api/querries";
import { CREATE_FOLDER } from "../api/mutations";
import { FoldersResponse } from "../interfaces";

export const useFolders = (rootFolderId: string) => {
  const [folderName, setFolderName] = useState("");
  const [folderIds, setFolderIds] = useState<string[]>([rootFolderId]);

  // Query configuration
  const { loading, error, data, refetch } = useQuery<FoldersResponse>(
    GET_FOLDERS,
    {
      variables: { ids: folderIds },
      fetchPolicy: "network-only",
    }
  );

  // Mutation configuration without automatic refetch
  const [createFolder] = useMutation(CREATE_FOLDER);

  // Enhanced folder creation handler with manual refetch sequence
  const handleCreateFolder = useCallback(async () => {
    if (!folderName.trim()) return;

    try {
      // Create the folder
      const { data: newFolderData } = await createFolder({
        variables: {
          input: {
            name: folderName,
            parentId: rootFolderId,
          },
        },
      });

      if (newFolderData?.createFolder?.id) {
        // Update local state
        const newId = newFolderData.createFolder.id;
        setFolderIds((prev) => [...prev, newId]);
        setFolderName(""); // Reset input

        // Manually refetch the folder list
        await refetch({
          ids: rootFolderId,
        });
      }
    } catch (error) {
      console.error("Error creating folder:", error);
    }
  }, [folderName, createFolder, rootFolderId, folderIds, refetch]);

  return {
    folderName,
    setFolderName,
    folderIds,
    loading,
    error,
    data,
    handleCreateFolder,
  };
};
