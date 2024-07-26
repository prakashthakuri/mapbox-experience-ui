import React, { useEffect, useState, useRef } from 'react';
import mapboxgl, { Map } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import { MAPBOX_KEY } from '../../settings';
import {
  Box,
  Alert,
  AlertIcon,
  CloseButton,
  AlertDescription,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Button,
} from '@chakra-ui/react';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import * as turf from '@turf/turf';
import { useLazyQuery, useMutation } from '@apollo/client';
import { ADD_POLYGON, UPDATE_POLYGON } from '../../queries/mutation';
import { GENERATE_SESSION_ID, GET_POLYGONS } from '../../queries/queries';
import PolygonMap from './PolygonMap.component';
import PolygonForm from './PolygonForm.component';
import PolygonList from './PolygonList.component';
import PolygonViewer from './PolygonViewer.component';

const Polygon = () => {
  const [polygons, setPolygons] = useState([]);
  const [selectedPolygon, setSelectedPolygon] = useState(null);
  const [roundedArea, setRoundedArea] = useState(0.00);
  const [polygonAreaName, setPolygonAreaName] = useState('');
  const [clearAlert, setClearAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [sessionId, setSessionId] = useState('');

  const [addPolygon] = useMutation(ADD_POLYGON, {
    onCompleted: (data) => {
      console.log('Polygon added successfully:', data);
      setPolygons([...polygons, data.addPolygon]);
      setPolygonAreaName('');
    },
    onError: (error) => {
      console.error('Error adding polygon:', error);
      setErrorMessage('Failed to save polygon. ' + error.message);
    }
  });

  const [updatePolygon] = useMutation(UPDATE_POLYGON, {
    onCompleted: (data) => {
      console.log('Polygon updated successfully:', data);
      const updatedPolygons = polygons.map(polygon => 
        polygon.id === data.updatePolygon.id ? data.updatePolygon : polygon
      );
      setPolygons(updatedPolygons);
      setPolygonAreaName('');
      setSelectedPolygon(null);
    },
    onError: (error) => {
      console.error('Error updating polygon:', error);
      setErrorMessage('Failed to update polygon. ' + error.message);
    }
  });

  
  const [getSessionId] = useLazyQuery(GENERATE_SESSION_ID);

  const mapContainerRef = useRef();
  const mapRef = useRef();
  const drawRef = useRef(null);

  useEffect(() => {
    const fetchSessionId = async () => {
      try {
        const result = await getSessionId();
        if (result.data?.generateSessionId) {
          setSessionId(result.data.generateSessionId);
          console.log(result.data.generateSessionId, 'sessionID');
        }
      } catch (error) {
        console.error('Error generating session ID:', error);
      }
    };

    fetchSessionId();
  }, [getSessionId]);

  const updateArea = () => {
    const data = drawRef.current.getAll();
    if (data.features.length > 0) {
      const lines = data?.features[0]?.geometry?.coordinates[0];
      if (lines.length >= 4) {
        const polygon = turf.polygon([[...lines, lines[0]]]);
        const area = Math.round(turf.area(polygon) * 100) / 100;  
        setRoundedArea(area);
        drawRef.current.deleteAll();
        drawRef.current.add({
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [[...lines, lines[0]]],
          },
          properties: {},
        });
      }
    }
  };

  useEffect(() => {
    mapboxgl.accessToken = MAPBOX_KEY;

    mapRef.current = new Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-74.5, 40],
      zoom: 9,
    });

    const draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        polygon: true,
        trash: true,
      },
      defaultMode: 'draw_polygon',
    });

    drawRef.current = draw;
    mapRef.current.addControl(draw);

    mapRef.current.on('draw.create', updateArea);
    mapRef.current.on('draw.delete', updateArea);
    mapRef.current.on('draw.update', updateArea);

    return () => {
      mapRef.current.off('draw.create', updateArea);
      mapRef.current.off('draw.delete', updateArea);
      mapRef.current.off('draw.update', updateArea);
      mapRef.current.remove();
    };
  }, []);

  const handleSavePolygon = async () => {
    if (!polygonAreaName) {
      setErrorMessage('Please enter a valid name for a polygon');
      return;
    }
    const data = drawRef.current.getAll();
    if (data.features.length > 0) {
      const newPolygon = {
        name: polygonAreaName,
        coordinates: data.features[0].geometry.coordinates,
      };
      try {
        await addPolygon({
          variables: {
            input: {
              name: newPolygon.name,
              coordinates: newPolygon.coordinates,
              session_id: sessionId,
            },
          },
        });
      } catch (error) {
        setErrorMessage('Failed to save polygon');
      }
    }
  };

  const handleClearPolygon = () => {
    drawRef.current.deleteAll();
    drawRef.current.changeMode('draw_polygon');
    setClearAlert(true);
    setSelectedPolygon(null);
    setPolygonAreaName('');
  };

  const handleShowPolygon = (index) => {
    if (selectedPolygon === index) {
      setSelectedPolygon(null);
      setPolygonAreaName('');
      drawRef.current.deleteAll();
      return;
    }
    const selectedFeature = polygons[index];
    if (!selectedFeature || !selectedFeature.coordinates) {
      setErrorMessage('Invalid polygon data');
      return;
    }
    try {
      drawRef.current.add({
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: selectedFeature.coordinates,
        },
        properties: {},
      });
      setPolygonAreaName(selectedFeature.name);
      setSelectedPolygon(index);
      setErrorMessage('');
    } catch (error) {
      setErrorMessage('Failed to load polygon: ' + error.message);
      console.error('Error adding polygon to map:', error);
    }
  };

  const handleUpdatePolygon = async () => {
    if (selectedPolygon === null) {
      setErrorMessage('Please select a polygon to edit.');
      return;
    }
    const polygonToEdit = polygons[selectedPolygon];
    if (polygonToEdit.sessionId !== sessionId) {
      setErrorMessage('Unauthorized to edit this polygon.');
      return;
    }
    onOpen();
  };

  const handleConfirmUpdatePolygon = async () => {
    if (!polygonAreaName) {
      setErrorMessage('Please enter a name for the polygon.');
      return;
    }
    const data = drawRef.current.getAll();
    if (data.features.length > 0) {
      const updatedPolygon = {
        id: polygons[selectedPolygon].id,
        name: polygonAreaName,
        coordinates: data.features[0].geometry.coordinates,
      };
      try {
        await updatePolygon({
          variables: {
            id: updatedPolygon.id,
            input: {
              name: updatedPolygon.name,
              coordinates: updatedPolygon.coordinates,
              session_id: sessionId,
            },
          },
        });
      } catch (error) {
        setErrorMessage('Failed to update polygon');
      }
      onClose();
    }
  };

  const handleCloseAlert = () => {
    setClearAlert(false);
    setErrorMessage('');
  };


console.log(polygons, "pol")
  return (
    <Box display='flex' ml={2} mr={2} style={{ display: 'flex', flexDirection: 'row', height: '100vh', width: '100vh' }} onClick={handleCloseAlert}>
      <Box flex='1' display='flex' flexDirection='column'>
        <PolygonMap mapContainerRef={mapContainerRef} />
        <PolygonForm
          polygonAreaName={polygonAreaName}
          setPolygonAreaName={setPolygonAreaName}
          handleSavePolygon={handleSavePolygon}
          handleClearPolygon={handleClearPolygon}
          selectedPolygon={selectedPolygon}
          handleUpdatePolygon={handleUpdatePolygon}
        />
        {clearAlert && (
          <Alert status='success'>
            <AlertIcon />
            <Box>
              <AlertDescription>Polygon was Cleared</AlertDescription>
            </Box>
            <CloseButton position='absolute' top={2} right={2} onClick={handleCloseAlert} />
          </Alert>
        )}
        {errorMessage && (
          <Alert status='error'>
            <AlertIcon />
            <Box>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Box>
            <CloseButton position='absolute' top={2} right={2} onClick={handleCloseAlert} />
          </Alert>
        )}
        
        <Box>
        {polygons?.length > 0 && 
          <Alert status="info" mt={4}>
          <AlertIcon />
          <AlertDescription>
          TO UPDATE: Select an item from the list to display details. Double-click the polygon to edit. Click 'Update' to save changes.        </AlertDescription>
         
        </Alert>
        }
      

          <PolygonList polygons={polygons} polygonArea={roundedArea} polygonName={polygonAreaName} handleShowPolygon={handleShowPolygon} />

        </Box>

    

      </Box>
    
      <Box flex='1'>
        <PolygonViewer sessionId={sessionId} />
      </Box>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirm Edit</ModalHeader>
          <ModalCloseButton />
          <ModalBody>Are you sure you want to update this polygon?</ModalBody>
          <ModalFooter>
            <Button colorScheme='blue' mr={3} onClick={handleConfirmUpdatePolygon}>
              OK
            </Button>
            <Button variant='ghost' onClick={onClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Polygon;
