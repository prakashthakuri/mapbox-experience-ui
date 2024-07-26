import React, { useState, useEffect, useRef } from 'react';
import { useLazyQuery } from '@apollo/client';
import mapboxgl from 'mapbox-gl';
import { Box, Button, Table, Thead, Tbody, Tr, Th, Td, HStack, Input, Alert, AlertIcon, AlertDescription, Link as ChakraLink } from '@chakra-ui/react';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import { GET_POLYGON_BY_SESSION_ID, GET_POLYGONS } from '../../queries/queries';
import { MAPBOX_KEY } from '../../settings';

const ITEMS_PER_PAGE = 5;

const PolygonViewer = ({ sessionId }) => {
  const [polygons, setPolygons] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [errorMessage, setErrorMessage] = useState('');
  const [userInput, setUserInput] = useState('');

  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const drawRef = useRef(null);

  useEffect(() => {
    mapboxgl.accessToken = MAPBOX_KEY;

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-74.5, 40],
      zoom: 9,
    });

    const draw = new Map({
      displayControlsDefault: false,
      userProperties: false,
      boxSelect: false,
      touchEnabled: false,
    });

    drawRef.current = draw;
    mapRef.current.addControl(draw);

    return () => {
      mapRef.current.remove();
    };
  }, []);

  const [getAllPolygons] = useLazyQuery(GET_POLYGONS, {
    onCompleted: (data) => {
      setPolygons(data?.getPolygons);
      populateMapWithPolygons(data?.getPolygons);
    },
    onError: () => {
      setErrorMessage('Failed to fetch polygons. Please try again!');
    }
  });

  const [getPolygonsBySession] = useLazyQuery(GET_POLYGON_BY_SESSION_ID, {
    onCompleted: (data) => {
      setPolygons(data.getPolygonsBySession);
      populateMapWithPolygons(data.getPolygonsBySession);
    },
    onError: () => {
      setErrorMessage('No data found for the provided session ID.');
    }
  });

  const handleFetchPolygons = () => {
    if (userInput.toLowerCase() === 'admin') {
      getAllPolygons();
    } else {
      getPolygonsBySession({ variables: { session_id: userInput } });
    }
  };

  const populateMapWithPolygons = (polygons) => {
    drawRef.current.deleteAll();
    polygons.forEach((polygon) => {
      drawRef.current.add({
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: polygon.coordinates,
        },
        properties: {},
      });
    });
  };

  const handlePolygonClick = (polygon) => {
    drawRef.current.deleteAll();
    drawRef.current.add({
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: polygon.coordinates,
      },
      properties: {},
    });
  };

  const totalPages = Math.ceil(polygons.length / ITEMS_PER_PAGE);
  const displayedPolygons = polygons.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const sharableLink = `${window.location.origin}/view?session_id=${userInput}`;

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
        <Alert status="error" mb={4}>
          <AlertIcon />
          {errorMessage}
        </Alert>
      }
      <Box ref={mapContainerRef} mb={4} style={{ height: '400px', width: '100%' }} />
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
                <Tr key={polygon.id} onClick={() => handlePolygonClick(polygon)}>
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
      <Alert status="info" mt={4}>
        <AlertIcon />
        <AlertDescription>
          TO UPDATE: Select an item from the list to display details. Double-click the polygon to edit. Click 'Update' to save changes.
        </AlertDescription>
      </Alert>
      {sharableLink && (
        <Box mt={4}>
          <ChakraLink href={sharableLink} isExternal>
            Sharable Link
          </ChakraLink>
        </Box>
      )}
    </Box>
  );
};

export default PolygonViewer;
