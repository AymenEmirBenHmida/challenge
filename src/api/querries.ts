import { gql } from "@apollo/client";

/**
 * GET_FOLDERS query:
 * This query retrieves folder details along with their associated documents.
 * It fetches the folder id, name, and a list of documents (each document's id and textContent).
 */
export const GET_FOLDERS = gql`
  query GetFolderContents($ids: [String]!) {
    foldersById(ids: $ids) {
      edges {
        node {
          id
          name
          documents {
            edges {
              node {
                id
                textContent
              }
            }
          }
        }
      }
    }
  }
`;

/**
 * GET_FOLDER_CONTENTS query:
 * This query retrieves comprehensive details for folders.
 * It returns:
 *  - Folder id and name.
 *  - Documents within the folder including id, textContent, createdAt timestamp, and description.
 *  - Subfolders details including id, name, and document count.
 */
export const GET_FOLDER_CONTENTS = gql`
  query GetFolderContents($ids: [String]!) {
    foldersById(ids: $ids) {
      edges {
        node {
          id
          name
          documents {
            edges {
              node {
                id
                textContent
                createdAt
                description
              }
            }
          }
          subfolders(after: null, first: 10) {
            edges {
              node {
                id
                name
                documentCount
              }
            }
          }
        }
      }
    }
  }
`;

// This is an alternative version of GET_FOLDER_CONTENTS and it's commented out,
// but it shows an alternate structure for fetching documents inside a folder.

/*
export const GET_FOLDER_CONTENTS = gql`
  query GetFolderContents($ids: [String]!) {
    foldersById(ids: $ids) {
      edges {
        node {
          id
          name
          documents {
            edges {
              node {
                id
                textContent
                createdAt
                description
              }
            }
          }
        }
      }
    }
  }
`;
*/
