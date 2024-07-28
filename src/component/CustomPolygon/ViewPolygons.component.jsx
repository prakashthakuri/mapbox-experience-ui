import React, { useEffect, useState, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import { useLazyQuery } from '@apollo/client';
import { GET_POLYGON_BY_SESSION_ID } from '../../queries/queries';
import { useLocation, Link } from 'react-router-dom';
import { Box, Table, Thead, Tbody, Tr, Th, Td, Alert, AlertIcon, Text, AlertDescription } from '@chakra-ui/react';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import PolygonMap from './PolygonMap.component';
import { displayPolygonOnMap } from '../../util';
import { VITE_REACT_APP_MAPBOX_KEY } from '../../settings';

const useQueryParams = () => {
  return new URLSearchParams(useLocation().search);
};

const ViewPolygons = () => {
  const [polygons, setPolygons] = useState([]);
  const queryParams = useQueryParams();
  const sessionId = queryParams.get('session_id');
  const [errorMessageForShowingPolygon, setErrorMessageForShowingPolygon] = useState('');
  const [getPolygonsBySession, { loading, data, error }] = useLazyQuery(GET_POLYGON_BY_SESSION_ID);

  const mapContainerRef = useRef(null);
  const drawRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    mapboxgl.accessToken = VITE_REACT_APP_MAPBOX_KEY;

    const initializeMap = () => {
      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [-74.5, 40],
        zoom: 9,
      });

      const draw = new MapboxDraw({
        displayControlsDefault: false,
        userProperties: false,
        boxSelect: false,
        touchEnabled: false,
      });

      drawRef.current = draw;
      map.addControl(draw);

      mapRef.current = map;

      return () => {
        map.remove();
      };
    };

    initializeMap();
  }, []);

  useEffect(() => {
    if (sessionId) {
      getPolygonsBySession({ variables: { session_id: sessionId } });
    }
  }, [sessionId, getPolygonsBySession]);

  useEffect(() => {
    if (data) {
      setPolygons(data.getPolygonsBySession);
      data.getPolygonsBySession.forEach((polygon) => {
        drawRef.current.add({
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: polygon.coordinates,
          },
          properties: {},
        });
      });
    }
  }, [data]);

  const handlePolygonClick = (polygon) => {
    try {
      setErrorMessageForShowingPolygon('');
      displayPolygonOnMap(mapRef, drawRef, polygon);
    } catch (error) {
      setErrorMessageForShowingPolygon(error.message);
    }
  };

  const renderTableBody = () =>
    polygons.map((polygon) => (
      <Tr key={polygon.id} onClick={() => handlePolygonClick(polygon)} style={{ cursor: 'pointer' }}>
        <Td>{polygon.name}</Td>
        <Td>{JSON.stringify(polygon.coordinates)}</Td>
      </Tr>
    ));

  return (
    <Box p={4} borderWidth={1} borderRadius="md" boxShadow="md">
      <Text mb={4}>Affected Area for {sessionId}</Text>
      <Box ref={mapContainerRef} m={2} style={{ height: '80vh', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <PolygonMap mapContainerRef={mapContainerRef} />
      </Box>
      {loading && <p>Loading...</p>}
      {error && (
        <Alert status="error" mb={4}>
          <AlertIcon />
          {error.message}
        </Alert>
      )}
      {!loading && !error && polygons.length === 0 && (
        <Alert status="warning" mb={4}>
          <AlertIcon />
          No data found.
        </Alert>
      )}
      <Alert status="info" mt={4}>
        <AlertIcon />
        <AlertDescription>
          This is view-only mode. You cannot edit or make changes here. To update, go to the 
          <Link to="/"> HOME</Link>.
        </AlertDescription>
      </Alert>

      {errorMessageForShowingPolygon && (
        <Alert status="error" mt={4}>
          <AlertIcon />
          <AlertDescription>{errorMessageForShowingPolygon}</AlertDescription>
        </Alert>
      )}

      {polygons.length > 0 && (
        <Table variant="simple" mt={4}>
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>Coordinates</Th>
            </Tr>
          </Thead>
          <Tbody>{renderTableBody()}</Tbody>
        </Table>
      )}
    </Box>
  );
};

export default ViewPolygons;
