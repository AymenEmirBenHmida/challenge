// src/apolloClient.ts
import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";

const httpUrl = import.meta.env.VITE_API_URL;
const API_KEY = import.meta.env.VITE_API_KEY;

const client = new ApolloClient({
  link: new HttpLink({
    uri: httpUrl, // Replace with your GraphQL API endpoint
    headers: {
      Authorization: `api-key ${API_KEY}`, // Add any necessary headers, e.g., token
    },
  }),
  cache: new InMemoryCache(),
});

export default client;
