import { useEffect, useState, useRef } from 'react';
import mapboxgl, {Map} from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import { MAPBOX_KEY } from '../../settings';
import { ButtonGroup, Button, Input, Box, Text } from '@chakra-ui/react';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import * as turf from '@turf/turf';

const Polygon = () => {
  const mapContainerRef = useRef();
  const mapRef = useRef();
  const drawRef = useRef(null)
  const [polygons, setPolygons] = useState([]);
  const [selectedPolygon, setSelectedPolygon] = useState(null);
    const [roundedArea, setRoundedArea] = useState();
    const [polygonAreaName, setPolygonAreaName] = useState('')


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
        console.log(lines, lines.length, "LINES")
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

    const handleSavePolygon = () => {
        console.log("save")
    }
    const handleClearPolygon = () =>{
        console.log("clear polygon")
    }
    const handleEditPolygon =() => {
        console.log("handle Edit Polygon")
    }



  return (
    <Box display= 'flex' style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vh' }}>
      <Box ref={mapContainerRef} style={{ height: '70%', width: '100%' }}></Box>
     <Box>
   
        <Box display='flex' alignItems='center' p ={4}>
            <Text mr={2} >Title:</Text>
            <Input placeholder='polygon name' />
        
        </Box>



             <Box p={4}>
           <ButtonGroup variant='outline' spacing='6'>
                <Button colorScheme='blue' onClick={handleSavePolygon}>Save</Button>
                <Button colorScheme='red' onClick={handleClearPolygon}>Clear</Button>
                <Button onClick={handleEditPolygon}>Edit</Button>

            </ButtonGroup>
        </Box>
        
     </Box>
     </Box>
  );
};

export default Polygon;
