import { ApolloClient, createHttpLink, InMemoryCache } from "@apollo/client";

const httpLink = createHttpLink({
    uri: 'http://localhost:8080/graphql',
    credentials: 'include'
})

export const client = new ApolloClient({
    cache: new InMemoryCache(),
    link: httpLink
})