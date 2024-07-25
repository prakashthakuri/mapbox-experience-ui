import { gql } from "@apollo/client"


const polygonType = `
    id,
    name,
    coordinates,
    session_id,
    created_at,
    updated_at        
`

export const GET_POLYGONS = gql `
    query GetPolygons {
    getPolygons {
       ${polygonType}
    }
}`

export const GET_POLYGON_BY_SESSION_ID = gql `query GetPolygonBySession($sessionId: String!) {

        GetPolygonBySession(sessionId: $sessionId){
            ${polygonType}
        }
}`

export const GENERATE_SESSION_ID = gql`
  query GenerateSessionId {
    generateSessionId
  }
`;
