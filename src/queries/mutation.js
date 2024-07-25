import { gql } from "@apollo/client";

export const ADD_POLYGON = gql `
mutation AddPolygon($input: PolygonInput!) {
    addPolygon(input: $input) {
      id
      name
      coordinates
      session_id
      created_at
      updated_at
    }
  }
`

export const UPDATE_POLYGON = gql`
  mutation UpdatePolygon($id: ID!, $input: PolygonInput!) {
    updatePolygon(id: $id, input: $input) {
      id
      name
      coordinates
      session_id
      created_at
      updated_at
    }
  }
`