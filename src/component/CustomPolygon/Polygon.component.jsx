import { useEffect, useRef } from 'react';
import mapboxgl, {Map, NavigationControl} from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MAPBOX_KEY } from '../../settings';

const Polygon = () => {
  const mapContainerRef = useRef();
  const mapRef = useRef();


  useEffect(() => {
    mapboxgl.accessToken = MAPBOX_KEY;

    mapRef.current = new Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-74.5, 40],
      zoom: 9,
    });

    mapRef.current.addControl(new NavigationControl());

  }, []);



  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vh' }}>
      <div ref={mapContainerRef} style={{ height: '80%', width: '100%' }}></div>
     <div>
        Button functionality goes here
        
     </div>
     </div>
  );
};

export default Polygon;
