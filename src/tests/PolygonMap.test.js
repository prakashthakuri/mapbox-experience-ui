
import React from 'react'
import { render } from '@testing-library/react';
// import '@testing-library/jest-dom/extend-expect';
import PolygonMap from '../component/CustomPolygon/PolygonMap.component';

// Make sure to use the correct Jest functions
describe('PolygonMap Component', () => {
  test('renders the map container', () => {
    const mapContainerRef = { current: document.createElement('div') };
    const { container } = render(<PolygonMap mapContainerRef={mapContainerRef} />);
    expect(container.firstChild).toBeInTheDocument();
  });

  // Additional tests can be added here
  test('map container has correct class name', () => {
    const mapContainerRef = { current: document.createElement('div') };
    const { container } = render(<PolygonMap mapContainerRef={mapContainerRef} />);
    expect(container.firstChild).toHaveClass('map-container'); // Assuming your container has this class
  });

  test('renders with correct props', () => {
    const mapContainerRef = { current: document.createElement('div') };
    const { getByTestId } = render(<PolygonMap mapContainerRef={mapContainerRef} />);
    const mapContainer = getByTestId('map-container'); // Assuming you have a data-testid="map-container"
    expect(mapContainer).toBeInTheDocument();
  });
});
