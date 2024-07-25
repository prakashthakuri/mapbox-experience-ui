import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PolygonForm from '../component/CustomPolygon/PolygonForm.component';


describe('PolygonForm Component', () => {
  const handleSavePolygon = jest.fn();
  const handleClearPolygon = jest.fn();
  const handleUpdatePolygon = jest.fn();
  const setPolygonAreaName = jest.fn();

  it('renders with initial state', () => {
    render(
      <PolygonForm
        polygonAreaName=""
        setPolygonAreaName={setPolygonAreaName}
        handleSavePolygon={handleSavePolygon}
        handleClearPolygon={handleClearPolygon}
        selectedPolygon={null}
        handleUpdatePolygon={handleUpdatePolygon}
      />
    );

    expect(screen.getByPlaceholderText('Polygon name')).toBeInTheDocument();
    expect(screen.getByText('Save')).toBeInTheDocument();
    expect(screen.getByText('Clear')).toBeInTheDocument();
  });

  it('calls setPolygonAreaName on input change', () => {
    render(
      <PolygonForm
        polygonAreaName=""
        setPolygonAreaName={setPolygonAreaName}
        handleSavePolygon={handleSavePolygon}
        handleClearPolygon={handleClearPolygon}
        selectedPolygon={null}
        handleUpdatePolygon={handleUpdatePolygon}
      />
    );

    fireEvent.change(screen.getByPlaceholderText('Polygon name'), { target: { value: 'New Polygon' } });
    expect(setPolygonAreaName).toHaveBeenCalledWith('New Polygon');
  });

  it('calls handleSavePolygon on Save button click', () => {
    render(
      <PolygonForm
        polygonAreaName="Polygon 1"
        setPolygonAreaName={setPolygonAreaName}
        handleSavePolygon={handleSavePolygon}
        handleClearPolygon={handleClearPolygon}
        selectedPolygon={null}
        handleUpdatePolygon={handleUpdatePolygon}
      />
    );

    fireEvent.click(screen.getByText('Save'));
    expect(handleSavePolygon).toHaveBeenCalled();
  });

  it('calls handleUpdatePolygon on Update button click', () => {
    render(
      <PolygonForm
        polygonAreaName="Polygon 1"
        setPolygonAreaName={setPolygonAreaName}
        handleSavePolygon={handleSavePolygon}
        handleClearPolygon={handleClearPolygon}
        selectedPolygon={1}
        handleUpdatePolygon={handleUpdatePolygon}
      />
    );

    fireEvent.click(screen.getByText('Update'));
    expect(handleUpdatePolygon).toHaveBeenCalled();
  });

  it('calls handleClearPolygon on Clear button click', () => {
    render(
      <PolygonForm
        polygonAreaName="Polygon 1"
        setPolygonAreaName={setPolygonAreaName}
        handleSavePolygon={handleSavePolygon}
        handleClearPolygon={handleClearPolygon}
        selectedPolygon={1}
        handleUpdatePolygon={handleUpdatePolygon}
      />
    );

    fireEvent.click(screen.getByText('Clear'));
    expect(handleClearPolygon).toHaveBeenCalled();
  });
});
