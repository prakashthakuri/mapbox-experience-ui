import React from 'react'

import { useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import { VITE_REACT_APP_MAPBOX_KEY } from '../../settings';

const PolygonMap = ({ mapContainerRef }) => {

  useEffect(() => {
    mapboxgl.accessToken = VITE_REACT_APP_MAPBOX_KEY;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-74.5, 40],
      zoom: 9,
    });

    return () => {
      map.remove();
    };
  }, [mapContainerRef]);


  return <div ref={mapContainerRef} style={{ height: '70%', width: '100%' }} />;
};

export default PolygonMap;
