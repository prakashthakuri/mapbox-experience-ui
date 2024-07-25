import { useEffect, useState, useRef } from 'react';
import mapboxgl, {Map} from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import { MAPBOX_KEY } from '../../settings';
import { ButtonGroup, Button, Input, Box, Text, Alert, AlertIcon, CloseButton, AlertDescription, OrderedList, ListItem, Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
useDisclosure } from '@chakra-ui/react';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import * as turf from '@turf/turf';
import { useLazyQuery, useMutation, useQuery } from '@apollo/client';
import { ADD_POLYGON } from '../../queries/mutation';
import { GENERATE_SESSION_ID, GET_POLYGONS } from '../../queries/queries';
import { useSession } from '../../context/SessionContext';

const Polygon = () => {
  const mapContainerRef = useRef();
  const mapRef = useRef();
  const drawRef = useRef(null)
  const [polygons, setPolygons] = useState([]);
  const [selectedPolygon, setSelectedPolygon] = useState(null);
    const [roundedArea, setRoundedArea] = useState();
    const [polygonAreaName, setPolygonAreaName] = useState('')

    const [clearAlert, setClearAlert] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')
      const { isOpen, onOpen, onClose } = useDisclosure();

      const [addPolygon] = useMutation(ADD_POLYGON, {
        onCompleted: (data) => {
          console.log("Polygon added successfully:", data);
        },
        onError: (error) => {
          console.error("Error adding polygon:", error);
          setErrorMessage('Failed to save polygon. ' + error.message);
        }
      });
      const [ getAllPolygons, { loading, error, data }] = useLazyQuery(GET_POLYGONS);
      const [getSessionId] = useLazyQuery(GENERATE_SESSION_ID);
      // const { newsessionId, setSessionId } = useSession();

      const [sessionId, setSessionId] = useState('')

      useEffect(() => {
        const fetchSessionId = async () => {
          try {
            const result = await getSessionId(); // Await the query trigger
            if (result.data?.generateSessionId) {
              setSessionId(result.data.generateSessionId);
              console.log(result.data.generateSessionId, "sessionID");
            }
          } catch (error) {
            console.error('Error generating session ID:', error);
          }
        };
    
        fetchSessionId();
      }, [getSessionId]); 

  useEffect(() => {
     
    
    // console.log(loading, error, data, "get Polygons")
    mapboxgl.accessToken = MAPBOX_KEY;
    // clear extra texts or anythings

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
            trash: true
        },
        defaultMode: 'draw_polygon'
    })

    
drawRef.current = draw // this is to add the in drawRef
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
    const data = drawRef.current.getAll()
    if(data.features.length > 0) {
        const lines = data.features[0].geometry.coordinates;
        console.log(lines)
        if(lines.length >= 4) {
            const polygon = turf.polygon([[...lines, lines[0]]])
            const area = turf.area(polygon);
            setRoundedArea(Math.round(area *100)/100)
            drawRef.current.deleteAll()
            drawRef.current.add({
                type: 'Feature',
                geometry: {
                    type: 'Polygon',
                    coordinates: [[...lines, lines[0]]]
                },
                properties: {}
            })
         } 
         else{
                setRoundedArea();
            }
        }
        else{
            setRoundedArea()
        }

    }

    const handleSavePolygon = async () => {

        if(!polygonAreaName) {
            setErrorMessage('Please enter a valid name for a polygon')
        }
        const data = drawRef.current.getAll();
        if(data.features.length >0) {
            const newPolygon = {
                name: polygonAreaName,
                coordinates: data.features[0].geometry.coordinates
            };
            console.log(newPolygon, 'newPolygon')
            try{
              await addPolygon({
                variables: {
                  input: {
                  name: newPolygon.name,
                  coordinates: newPolygon.coordinates,
                  session_id: sessionId
                }
              }
              })
              setPolygons([...polygons, newPolygon])
              setPolygonAreaName('')
              // drawRef.current.deleteAll() // this could be optional
            }
            catch(error) {
              setErrorMessage('Failed to save polygon')
            }
           
        }

    }
    const handleClearPolygon = () =>{
        console.log("clear polygon")
        drawRef.current.deleteAll();
        drawRef.current.changeMode('draw_polygon');
        setClearAlert(true)
    }
    const handleEditPolygon =() => {
        console.log('handle edit', selectedPolygon)
        // todo: revisit this logic
        if(selectedPolygon) {
            console.log("hello")
            setErrorMessage('Please select Polygon to edit.')
        }
        drawRef.current.changeMode('direct_select', { featureId: polygons[selectedPolygon].feature.id }); // only direct select
    }

    const handleShowPolygon = (index) =>{
            drawRef.current.deleteAll();
    const selectedFeature = polygons[index].feature;
    drawRef.current.add(selectedFeature);
    setPolygonAreaName(polygons[index].name);
    setSelectedPolygon(index);
    setErrorMessage('');

    }
    const handleCloseAlert =() => {
        setClearAlert(false)
        setErrorMessage('')
    }

    const handleUpdatePolygon = () => {
         if (!polygonAreaName) {
      setErrorMessage('Please enter a name for the polygon.');
      return;
    }
    onOpen();
    }

    const handleConfirmUpdatePolygon = () => {
        console.log('updatePolygon')
        const data = drawRef.current.getAll()
        if(data.features.length > 0) {
            const updatedPolygons = [...polygons]
            updatedPolygons[selectedPolygon] ={
                name: polygonAreaName,
                feature: data.features[0]
            }
            setPolygons(updatedPolygons)
            setSelectedPolygon(null)
            setPolygonAreaName('')
            setErrorMessage('')
            drawRef.current.deleteAll()
            onClose();

        }
    }


  return (
    <Box display= 'flex' style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vh' }}>
      <Box ref={mapContainerRef} style={{ height: '70%', width: '100%' }}></Box>   
     <Box display='flex' alignItems='center' p ={4}>
            <Text mr={2} >Title:</Text>
            <Input placeholder='polygon name' value={polygonAreaName} onChange={(e) => {setPolygonAreaName(e.target.value); setErrorMessage('')}} />
        
        </Box>

        {clearAlert &&
         <Alert status='success'>
      <AlertIcon />
      <Box>
        <AlertDescription>
          Polygon was Cleared
        </AlertDescription>
      </Box>
      <CloseButton
       position='absolute'
        top={2}
        right={2}
        onClick={handleCloseAlert}
      />
    </Alert>
        }

        {errorMessage && 
           <Alert status='error'>
      <AlertIcon />
      <Box>
        <AlertDescription>
            {errorMessage}
        </AlertDescription>
      </Box>
      <CloseButton
       position='absolute'
        top={2}
        right={2}
        onClick={handleCloseAlert}
      />
    </Alert>
        }


        <Box p={4}>
           <ButtonGroup variant='outline' spacing='6'>
                <Button colorScheme='blue' onClick={selectedPolygon === null ? handleSavePolygon : handleUpdatePolygon}>{selectedPolygon === null ? 'Save': 'Update'}</Button>
                <Button colorScheme='red' onClick={handleClearPolygon}>Clear</Button>
                <Button onClick={handleEditPolygon}>Edit</Button>

            </ButtonGroup>
        </Box>

        <Box>
  <OrderedList style={{ margin: 0, padding: 0, listStylePosition: 'inside' }}>
            {polygons.map((polygon, index) => (
          <ListItem key={index} onClick={() => handleShowPolygon(index)}>
            {polygon.name} - {roundedArea}
          </ListItem>
        ))}
      </OrderedList>

        </Box>  
        <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirm Edit</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            Are you sure you want to update this polygon: {polygonAreaName}?
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleConfirmUpdatePolygon}>
              OK
            </Button>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>


        
</Box>

  );
};

export default Polygon;
