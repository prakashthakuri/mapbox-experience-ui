import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PolygonForm from '../component/CustomPolygon/PolygonForm.component';

describe('PolygonForm Component', () => {
  const mockSetPolygonAreaName = jest.fn();
  const mockHandleSavePolygon = jest.fn();
  const mockHandleClearPolygon = jest.fn();
  const mockHandleEditPolygon = jest.fn();

  const renderComponent = (selectedPolygon = null) => {
    render(
      <PolygonForm
        polygonAreaName="Test Polygon"
        setPolygonAreaName={mockSetPolygonAreaName}
        handleSavePolygon={mockHandleSavePolygon}
        handleClearPolygon={mockHandleClearPolygon}
        handleEditPolygon={mockHandleEditPolygon}
        selectedPolygon={selectedPolygon}
      />
    );
  };

  test('renders PolygonForm with initial values', () => {
    renderComponent();

    expect(screen.getByText('Title:')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Polygon name')).toHaveValue('Test Polygon');
    expect(screen.getByText('Save')).toBeInTheDocument();
    expect(screen.getByText('Clear')).toBeInTheDocument();
  });

  test('handles input change', () => {
    renderComponent();

    fireEvent.change(screen.getByPlaceholderText('Polygon name'), { target: { value: 'New Polygon Name' } });
    expect(mockSetPolygonAreaName).toHaveBeenCalledWith('New Polygon Name');
  });

  test('handles save button click', () => {
    renderComponent();

    fireEvent.click(screen.getByText('Save'));
    expect(mockHandleSavePolygon).toHaveBeenCalled();
  });

  test('handles update button click when selectedPolygon is not null', () => {
    renderComponent(1);

    fireEvent.click(screen.getByText('Update'));
    expect(mockHandleEditPolygon).toHaveBeenCalled();
  });

  test('handles clear button click', () => {
    renderComponent();

    fireEvent.click(screen.getByText('Clear'));
    expect(mockHandleClearPolygon).toHaveBeenCalled();
  });
});
