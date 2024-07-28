import { ApolloClient, createHttpLink, InMemoryCache } from "@apollo/client";

const httpLink = createHttpLink({
    uri: process.env.VITE_REACT_APP_GRAPHQL_URI ||  'http://localhost:8080/graphql',
})

export const client = new ApolloClient({
    cache: new InMemoryCache(),
    link: httpLink
})