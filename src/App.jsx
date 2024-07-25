
import './App.css'
import Polygon from './component/CustomPolygon/Polygon.component'
import { SessionProvider } from './context/SessionContext.jsx'


function App() {
  
  
  return (
        <SessionProvider>
        <Polygon /> 
        </SessionProvider>
 
  )
}

export default App
