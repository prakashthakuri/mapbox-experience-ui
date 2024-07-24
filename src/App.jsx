
import { ApolloProvider } from '@apollo/client'
import './App.css'
import Polygon from './component/CustomPolygon/Polygon.component'
import { client } from './services/apolloClient'

function App() {

  return (
    <ApolloProvider client={client}>
          <div>
      <Polygon />
          </div>
    </ApolloProvider>
  )
}

export default App
