// src/apolloClient.ts
import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";

const httpUrl = import.meta.env.VITE_API_URL;
const API_KEY = import.meta.env.VITE_API_KEY;

const client = new ApolloClient({
  link: new HttpLink({
    uri: httpUrl,
    headers: {
      Authorization: `api-key ${API_KEY}`,
    },
  }),
  cache: new InMemoryCache(),
});

export default client;
