import { gql } from "@apollo/client";

/**
 * Mutation to create a new folder.
 * Accepts an input of type CreateFolderInputType and returns the folder's id and name.
 */
export const CREATE_FOLDER = gql`
  mutation CreateFolder($input: CreateFolderInputType!) {
    createFolder(input: $input) {
      id
      name
    }
  }
`;

/**
 * Mutation to update the name of an existing subfolder.
 * Takes the subfolder's id and the new name as parameters.
 * Returns success status and updated folder details (id and name).
 */
export const UPDATE_SUBFOLDER_NAME = gql`
  mutation UpdateSubfolder($id: String!, $name: String!) {
    updateFolder(input: { id: $id, name: $name }) {
      success
      folder {
        id
        name
      }
    }
  }
`;

/**
 * Mutation to delete a subfolder by its id.
 * Returns a success flag indicating whether the deletion was successful.
 */
export const DELETE_SUBFOLDER = gql`
  mutation RemoveSubfolder($id: String!) {
    removeFolder(id: $id) {
      success
    }
  }
`;

/**
 * Mutation to create a new document within a folder.
 * Accepts folderId, textContent, and an optional description.
 * Returns newly created document's id, textContent, description, and createdAt timestamp.
 */
export const CREATE_DOCUMENT_MUTATION = gql`
  mutation CreateDocument(
    $folderId: String!
    $textContent: String!
    $description: String
  ) {
    createDocumentText(
      folderId: $folderId
      textContent: $textContent
      description: $description
    ) {
      id
      textContent
      description
      createdAt
    }
  }
`;

// The following is an alternative version for creating a document.
// It demonstrates a different ordering of parameters for the createDocumentText mutation.
/*
export const CREATE_DOCUMENT_MUTATION = gql`
  mutation CreateDocument(
    $folderId: String!
    $textContent: String!
    $description: String
  ) {
    createDocumentText(
      textContent: $textContent
      description: $description
      folderId: $folderId
    ) {
      id
      textContent
      description
      createdAt
    }
  }
`;
*/

/**
 * Mutation to update an existing document's text content.
 * Accepts the document's id and the new textContent.
 * Returns the updated document details including id, textContent, and description.
 */
export const UPDATE_DOCUMENT_MUTATION = gql`
  mutation UpdateDocument($id: String!, $textContent: String!) {
    updateTextContentOnDocument(id: $id, textContent: $textContent) {
      id
      textContent
      description
    }
  }
`;

/**
 * Mutation to delete a document.
 * Accepts an input of type RemoveInputType containing the document id.
 * Returns a success flag indicating whether the deletion was successful.
 */
export const DELETE_DOCUMENT_MUTATION = gql`
  mutation DeleteDocument($input: RemoveInputType!) {
    removeDocument(input: $input) {
      success
    }
  }
`;
