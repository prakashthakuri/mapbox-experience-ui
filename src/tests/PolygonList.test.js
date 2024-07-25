import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PolygonList from '../component/CustomPolygon/PolygonList.component';


describe('PolygonList Component', () => {
    const polygons = [
      { name: 'Polygon 1' },
      { name: 'Polygon 2' }
    ];
    const polygonArea = 50;
    const handleShowPolygon = jest.fn();
  
    it('renders polygons when the list is not empty', () => {
      render(<PolygonList polygons={polygons} polygonArea={polygonArea} handleShowPolygon={handleShowPolygon} />);
  
      expect(screen.getByText('Polygon 1')).toBeInTheDocument();
      expect(screen.getByText('Polygon 2')).toBeInTheDocument();
    });
  
    it('calls handleShowPolygon when a polygon is clicked', () => {
      render(<PolygonList polygons={polygons} polygonArea={polygonArea} handleShowPolygon={handleShowPolygon} />);
  
      fireEvent.click(screen.getByText('Polygon 1'));
      expect(handleShowPolygon).toHaveBeenCalledWith(0);
  
      fireEvent.click(screen.getByText('Polygon 2'));
      expect(handleShowPolygon).toHaveBeenCalledWith(1);
    });
  
    it('renders message when the list is empty', () => {
      render(<PolygonList polygons={[]} polygonArea={polygonArea} handleShowPolygon={handleShowPolygon} />);
  
      expect(screen.getByText('Your polygons will show up here.')).toBeInTheDocument();
    });
  });
  