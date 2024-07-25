import { Box, OrderedList, ListItem } from '@chakra-ui/react';

const PolygonList = ({ polygons, roundedArea, handleShowPolygon }) => (
  <Box>
    <OrderedList style={{ margin: 0, padding: 0, listStylePosition: 'inside' }}>
      {polygons.map((polygon, index) => (
        <ListItem key={index} onClick={() => handleShowPolygon(index)}>
          {polygon.name} - {roundedArea}
        </ListItem>
      ))}
    </OrderedList>
  </Box>
);

export default PolygonList;
