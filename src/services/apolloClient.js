import { ApolloClient, createHttpLink, InMemoryCache } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

const httpLink = createHttpLink({
    uri: process.env.VITE_REACT_APP_GRAPHQL_URI ||  'http://localhost:8080/graphql',
})
const authLink = setContext((_, { headers }) => {
    return {
        headers: {
            ...headers,
            "x-apollo-operation-name": "mapbox-service", 
            "apollo-require-preflight": "true" 
        }
    };
});
export const client = new ApolloClient({
    cache: new InMemoryCache(),
    link: authLink.concat(httpLink),})