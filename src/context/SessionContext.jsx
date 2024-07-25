
import { useEffect, createContext, useState, useContext } from 'react'


const SessionContext = createContext();

export const SessionProvider= ({children}) => {
  const [newsessionId, setSessionId] = useState(null);
return (
    <SessionContext.Provider value={{ newsessionId, setSessionId }}>
    {children}
  </SessionContext.Provider> 
  )
}

export const useSession = () => useContext(SessionContext);