import React from 'react';
import { Box, Text, Table, Thead, Tbody, Tr, Th, Td } from '@chakra-ui/react';

const PolygonList = ({ polygons, polygonArea, handleShowPolygon, setDisableSaveButton }) => {
  const handleRowClick = (index) => {
    setDisableSaveButton(false);
    handleShowPolygon(index);
  };

  const renderTableBody = () => (
    polygons.map((polygon, index) => (
      <Tr key={index} onClick={() => handleRowClick(index)} cursor="pointer" _hover={{ backgroundColor: "gray.100" }}>
        <Td>{polygon.name}</Td>
        <Td>{polygonArea} m<sup>2</sup></Td>
      </Tr>
    ))
  );

  return (
    <Box p={4} borderWidth={1} borderRadius="md" boxShadow="md">
      {polygons.length > 0 ? (
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>Area</Th>
            </Tr>
          </Thead>
          <Tbody>
            {renderTableBody()}
          </Tbody>
        </Table>
      ) : (
        <Box textAlign="center" py={10} px={6}>
          <Text fontSize="lg" color="gray.500">
            Your polygons will show up here.
          </Text>
        </Box>
      )}
    </Box>
  );
};

export default PolygonList;
