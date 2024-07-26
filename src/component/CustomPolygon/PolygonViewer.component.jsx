import React, { useState, useEffect } from 'react';
import { useLazyQuery } from '@apollo/client';
import { Box, Button, Table, Thead, Tbody, Tr, Th, Td, HStack } from '@chakra-ui/react';
import { GET_POLYGON_BY_SESSION_ID, GET_POLYGONS } from '../../queries/queries';

const ITEMS_PER_PAGE = 5;

const PolygonViewer = ({ sessionId }) => {
  const [polygons, setPolygons] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sharableLink, setSharableLink] = useState('');
  const [errorMessage, setErrorMessage] = useState('')

  const [getAllPolygons] = useLazyQuery(GET_POLYGONS, {
    onCompleted: (data) => {
      setPolygons(data?.getPolygons);
    },
    onError: (error) => {
        setErrorMessage('Failed to fetch polygons. Please try again!')
    }
  });  
  
  const [{  loading, data, error }] = useLazyQuery(GET_POLYGON_BY_SESSION_ID);

  useEffect(() => {
    if (data) {
      setPolygons(data.getPolygonsBySession);
    }
    
  }, [data]);

  const handleFetchPolygons = () => {
    getAllPolygons()
  };

  const handleGenerateLink = () => {
    const link = `${window.location.origin}/view?session_id=${sessionId}`;
    setSharableLink(link);
  };

  const totalPages = Math.ceil(polygons.length / ITEMS_PER_PAGE);
  const displayedPolygons = polygons.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <Box p={4} borderWidth={1} borderRadius="md" boxShadow="md" flex="1">
      <Button onClick={handleFetchPolygons} mb={4}>
        Fetch Polygons
      </Button>
      <Button onClick={handleGenerateLink} mb={4} ml={4}>
        Generate Sharable Link
      </Button>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error.message}</p>}
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
          <p>Sharable Link:</p>
          <a href={sharableLink} target="_blank" rel="noopener noreferrer">
            {sharableLink}
          </a>
        </Box>
      )}
    </Box>
  );
};

export default PolygonViewer;
