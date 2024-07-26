
import './App.css'
import { Route, BrowserRouter, Routes } from 'react-router-dom';
import Polygon from './component/CustomPolygon/Polygon.component'
import ViewPolygons from './component/CustomPolygon/ViewPolygons.component';

function App() {
  
  
  return (
<BrowserRouter>
    <Routes>
    <Route path="/" element={<Polygon />} />
    <Route exact path="/view" element={<ViewPolygons />} />
    </Routes>
  </BrowserRouter> 
  )
}

export default App
