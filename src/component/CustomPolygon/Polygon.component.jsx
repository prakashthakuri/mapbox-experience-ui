import React, { useEffect, useState, useRef } from 'react';
import mapboxgl, { Map } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
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
import { GENERATE_SESSION_ID } from '../../queries/queries';
import PolygonMap from './PolygonMap.component';
import PolygonForm from './PolygonForm.component';
import PolygonList from './PolygonList.component';
import PolygonViewer from './PolygonViewer.component';
import { VITE_REACT_APP_MAPBOX_KEY } from '../../settings';

const Polygon = () => {
  const [polygons, setPolygons] = useState([]);
  const [selectedPolygon, setSelectedPolygon] = useState(null);
  const [roundedArea, setRoundedArea] = useState(0.00);
  const [polygonAreaName, setPolygonAreaName] = useState('');
  const [clearAlert, setClearAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [sessionId, setSessionId] = useState('');
  const [disableSaveButton , setDisableSaveButton] = useState(false); // this true means that user is clicking from the PolygonViewer, this is cool way lol
  const [addPolygon] = useMutation(ADD_POLYGON, {
    onCompleted: (data) => {
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
        if(!disableSaveButton){
          setRoundedArea(area);
        }
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
    mapboxgl.accessToken = VITE_REACT_APP_MAPBOX_KEY;
    mapRef.current = new Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-94.5, 40],
      zoom: 5,
    });


    const draw = new MapboxDraw({
      displayControlsDefault: true,
      controls: {
        polygon: true,
        trash: true,
      },
      defaultMode: 'draw_polygon',
    });
    drawRef.current =  draw
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
    setSelectedPolygon(null);
    setPolygonAreaName('');
    drawRef.current.deleteAll();
    const selectedFeature = polygons[index];
    if (!selectedFeature || !selectedFeature.coordinates) {
      setErrorMessage('Invalid polygon data');
      return;
    }
    try {
      console.log("trying?")
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
        setErrorMessage('You cannot update this existing map. This feature is not available at this moment.');
      }
      onClose();
    }
  };

  const handleCloseAlert = () => {
    setClearAlert(false);
    setErrorMessage('');
  };


  return (
    <Box display='flex' flex='1' style={{ height: '100vh', width: '100%' }} onClick={handleCloseAlert}>
      <Box flex='1' width='60%' display='flex' flexDirection='column'>
        <PolygonMap mapContainerRef={mapContainerRef} />
        <PolygonForm
          polygonAreaName={polygonAreaName}
          setPolygonAreaName={setPolygonAreaName}
          handleSavePolygon={handleSavePolygon}
          handleClearPolygon={handleClearPolygon}
          selectedPolygon={selectedPolygon}
          handleUpdatePolygon={handleUpdatePolygon}
          disableSaveButton= {disableSaveButton}
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
{               ` TO UPDATE: Select an item from the list to display details. Double-click the polygon to edit. Click 'Update' to save changes.`}              </AlertDescription>
            </Alert>
          }
          <PolygonList polygons={polygons} polygonArea={roundedArea} polygonName={polygonAreaName}  handleShowPolygon={handleShowPolygon}  setDisableSaveButton={setDisableSaveButton} />
        </Box>
      </Box>
    
      <Box width='40%' p={4}>
        <PolygonViewer sessionId={sessionId} mapRef={mapRef} drawRef={drawRef} setDisableSaveButton={setDisableSaveButton}  />
      </Box>
    
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirm Edit</ModalHeader>
          <ModalCloseButton />
          <ModalBody>Are you sure you want to update this polygon?</ModalBody>
          <ModalFooter>
            <Button colorScheme='blue' mr='3' onClick={handleConfirmUpdatePolygon}>
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
