import { gql } from "@apollo/client"


const polygonType = `
    id,
    name,
    coordinates,
    sessionId,
    created_at,
    updated_at        
`

export const GET_POLYGONS = gql `
    query GetPolygons {
    getPolygons {
       ${polygonType}
    }
}`

export const GET_POLYGON_BY_SESSION_ID = gql`
  query getPolygonsBySession($session_id: String!) {
    getPolygonsBySession(session_id: $session_id) {
      id
      name
      coordinates
      created_at
      updated_at
      session_id
    }
  }
`;

export const GENERATE_SESSION_ID = gql`
  query GenerateSessionId {
    generateSessionId
  }
`;

