import { useEffect, useState, useRef } from 'react';
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
import { ADD_POLYGON } from '../../queries/mutation';
import { GENERATE_SESSION_ID, GET_POLYGONS } from '../../queries/queries';
import PolygonMap from './PolygonMap.component';
import PolygonForm from './PolygonForm.component';
import PolygonList from './PolygonList.component';


const Polygon = () => {
  const [polygons, setPolygons] = useState([]);
  const [selectedPolygon, setSelectedPolygon] = useState(null);
  const [roundedArea, setRoundedArea] = useState();
  const [polygonAreaName, setPolygonAreaName] = useState('');
  const [clearAlert, setClearAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [sessionId, setSessionId] = useState('');

  const [addPolygon] = useMutation(ADD_POLYGON, {
    onCompleted: (data) => {
      console.log('Polygon added successfully:', data);
    },
    onError: (error) => {
      console.error('Error adding polygon:', error);
      setErrorMessage('Failed to save polygon. ' + error.message);
    }
  });

  const [getAllPolygons, { loading, error, data }] = useLazyQuery(GET_POLYGONS);
  const [getSessionId] = useLazyQuery(GENERATE_SESSION_ID);

  const mapContainerRef = useRef();
  const mapRef = useRef();
  const drawRef = useRef(null);

  useEffect(() => {
    const fetchSessionId = async () => {
      try {
        const result = await getSessionId(); // Await the query trigger
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

    drawRef.current = draw; // this is to add the in drawRef
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

  const updateArea = () => {
    const data = drawRef.current.getAll();
    if (data.features.length > 0) {
      const lines = data.features[0].geometry.coordinates;
      if (lines.length >= 4) {
        const polygon = turf.polygon([[...lines, lines[0]]]);
        const area = turf.area(polygon);
        setRoundedArea(Math.round(area * 100) / 100);
        drawRef.current.deleteAll();
        drawRef.current.add({
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [[...lines, lines[0]]],
          },
          properties: {},
        });
      } else {
        setRoundedArea();
      }
    } else {
      setRoundedArea();
    }
  };

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
        setPolygons([...polygons, newPolygon]);
        setPolygonAreaName('');
      } catch (error) {
        setErrorMessage('Failed to save polygon');
      }
    }
  };

  const handleClearPolygon = () => {
    drawRef.current.deleteAll();
    drawRef.current.changeMode('draw_polygon');
    setClearAlert(true);
  };

  const handleEditPolygon = () => {
    if (selectedPolygon === null) {
      setErrorMessage('Please select a polygon to edit.');
      return;
    }
    drawRef.current.changeMode('direct_select', { featureId: polygons[selectedPolygon].feature.id });
  };

  const handleShowPolygon = (index) => {
    drawRef.current.deleteAll();
    const selectedFeature = polygons[index].feature;
    drawRef.current.add(selectedFeature);
    setPolygonAreaName(polygons[index].name);
    setSelectedPolygon(index);
    setErrorMessage('');
  };

  const handleCloseAlert = () => {
    setClearAlert(false);
    setErrorMessage('');
  };

  const handleUpdatePolygon = () => {
    if (!polygonAreaName) {
      setErrorMessage('Please enter a name for the polygon.');
      return;
    }
    onOpen();
  };

  const handleConfirmUpdatePolygon = () => {
    const data = drawRef.current.getAll();
    if (data.features.length > 0) {
      const updatedPolygons = [...polygons];
      updatedPolygons[selectedPolygon] = {
        name: polygonAreaName,
        feature: data.features[0],
      };
      setPolygons(updatedPolygons);
      setSelectedPolygon(null);
      setPolygonAreaName('');
      setErrorMessage('');
      drawRef.current.deleteAll();
      onClose();
    }
  };

  return (
    <Box display='flex' style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vh' }}>
      <PolygonMap mapContainerRef={mapContainerRef} />
      <PolygonForm
        polygonAreaName={polygonAreaName}
        setPolygonAreaName={setPolygonAreaName}
        handleSavePolygon={handleSavePolygon}
        handleClearPolygon={handleClearPolygon}
        handleEditPolygon={handleEditPolygon}
        selectedPolygon={selectedPolygon}
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
      <PolygonList polygons={polygons} roundedArea={roundedArea} handleShowPolygon={handleShowPolygon} />
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirm Edit</ModalHeader>
          <ModalCloseButton />
          <ModalBody>Are you sure you want to update this polygon: {polygonAreaName}?</ModalBody>
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
