import mapboxgl from 'mapbox-gl';

export const displayPolygonOnMap = (mapRef, drawRef, polygon) => {
  if (!polygon || !polygon.coordinates) {
    throw new Error('Invalid polygon data. Select another valid polygon'); // thisis because 
    // there are some invalid poluygons on db
  }

  try {
    drawRef.current.deleteAll();
    drawRef.current.add({
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: polygon.coordinates,
      },
      properties: {},
    });

    const bounds = new mapboxgl.LngLatBounds();
    polygon.coordinates[0].forEach(coord => {
      bounds.extend(coord);
    });
    mapRef.current.fitBounds(bounds, { padding: 20 });
  } catch (error) {
    throw new Error('Error adding polygon to map. please try again!' );
  }
};
