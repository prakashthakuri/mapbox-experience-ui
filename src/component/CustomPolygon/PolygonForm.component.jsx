import { Box, Text, Input, ButtonGroup, Button } from '@chakra-ui/react';
import React from 'react'
const PolygonForm = ({
  polygonAreaName,
  setPolygonAreaName,
  handleSavePolygon,
  handleClearPolygon,
  handleEditPolygon,
  selectedPolygon,
}) => (
  <Box display='flex' alignItems='center' p={4}>
    <Text mr={2}>Title:</Text>
    <Input
      placeholder='Polygon name'
      value={polygonAreaName}
      onChange={(e) => {
        setPolygonAreaName(e.target.value);
      }}
    />
    <ButtonGroup variant='outline' spacing='6' ml={4}>
      <Button colorScheme='blue' onClick={selectedPolygon === null ? handleSavePolygon : handleEditPolygon}>
        {selectedPolygon === null ? 'Save' : 'Update'}
      </Button>
      <Button colorScheme='red' onClick={handleClearPolygon}>
        Clear
      </Button>
    </ButtonGroup>
  </Box>
);

export default PolygonForm;
