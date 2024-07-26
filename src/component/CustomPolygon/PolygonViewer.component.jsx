import React, { useState } from 'react';
import { useLazyQuery } from '@apollo/client';
import { Box, Button, Table, Thead, Tbody, Tr, Th, Td, HStack, Input, Alert, AlertIcon, AlertDescription, Link } from '@chakra-ui/react';
import { GET_POLYGON_BY_SESSION_ID, GET_POLYGONS } from '../../queries/queries';

const ITEMS_PER_PAGE = 5;

const PolygonViewer = ({ sessionId }) => {
  const [polygons, setPolygons] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [errorMessage, setErrorMessage] = useState('')
  const [userInput, setUserInput] = useState('');

  const sharableLink = `${window.location.origin}/view?session_id=${sessionId}`;


  const [getAllPolygons] = useLazyQuery(GET_POLYGONS, {
    onCompleted: (data) => {
      setPolygons(data?.getPolygons);
    },
    onError: () => {
        setErrorMessage(`Failed to fetch polygons. Please try again!`)
    }
  });  

  const [getPolygonsBySession] = useLazyQuery(GET_POLYGON_BY_SESSION_ID, {
    onCompleted: (data) => {
      setPolygons(data.getPolygonsBySession);
    },
    onError: () => {
      setErrorMessage(`No data found for the provided session ID.`);
    }
  });



    const handleFetchPolygons = () => {
        if (userInput.toLowerCase() === 'admin') {
          getAllPolygons();
        } else {
          getPolygonsBySession({ variables: { session_id: userInput } });
        }
      };  


  const totalPages = Math.ceil(polygons.length / ITEMS_PER_PAGE);
  const displayedPolygons = polygons.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <Box p={4} borderWidth={1} borderRadius="md" boxShadow="md" flex="1">
      <Input
        placeholder="Enter 'admin' or session ID"
        mb={4}
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
      />
      <Button onClick={handleFetchPolygons} mb={4}>
        Fetch Polygons
      </Button>
      {errorMessage && 
           <Alert status="info" mt={4}>
           <AlertIcon />
           <AlertDescription>
           TO UPDATE: Select an item from the list to display details. Double-click the polygon to edit. Click 'Update' to save changes.        </AlertDescription>
          
         </Alert>
      }
     
      {polygons.length > 0 && (
        <>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Name</Th>
                <Th>Coordinates</Th>
              </Tr>
            </Thead>
            <Tbody>
              {displayedPolygons.map((polygon) => (
                <Tr key={polygon.id}>
                  <Td>{polygon.name}</Td>
                  <Td>{JSON.stringify(polygon.coordinates)}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
          <HStack mt={4} spacing={4}>
            <Button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage <= 1}>
              Previous
            </Button>
            <Button onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage >= totalPages}>
              Next
            </Button>
          </HStack>
        </>
      )}
      {sharableLink && (
        <Box mt={4}>
            <Link href={sharableLink} isExternal >
            Sharable Link 
            {/*  confused on what to say here
            i guess i can use link from router here that might be better
            */}
            </Link>
     
        </Box>
      )}
    </Box>
  );
};

export default PolygonViewer;
