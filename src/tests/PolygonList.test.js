import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PolygonList from '../component/CustomPolygon/PolygonList.component';

describe('PolygonList Component', () => {
  const polygons = [
    { name: 'Polygon 1' },
    { name: 'Polygon 2' },
    { name: 'Polygon 3' },
  ];
  const roundedArea = '123.45';
  const handleShowPolygon = jest.fn();

  test('renders the polygon list', () => {
    render(<PolygonList polygons={polygons} roundedArea={roundedArea} handleShowPolygon={handleShowPolygon} />);

    // Check if all polygons are rendered
    polygons.forEach(polygon => {
      expect(screen.getByText(`${polygon.name} - ${roundedArea}`)).toBeInTheDocument();
    });
  });

  test('handles click events correctly', () => {
    render(<PolygonList polygons={polygons} roundedArea={roundedArea} handleShowPolygon={handleShowPolygon} />);

    // Simulate click events
    polygons.forEach((polygon, index) => {
      fireEvent.click(screen.getByText(`${polygon.name} - ${roundedArea}`));
      expect(handleShowPolygon).toHaveBeenCalledWith(index);
    });

    // Ensure handleShowPolygon is called the correct number of times
    expect(handleShowPolygon).toHaveBeenCalledTimes(polygons.length);
  });
});
