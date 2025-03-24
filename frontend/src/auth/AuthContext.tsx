import React, { useEffect, createContext, useState } from 'react'
import { getAuth, getConfig } from '../lib/allauth'
import Loading from "../pages/Loading.tsx";
import {AuthContextValue, AuthData} from "../types/auth";

export const AuthContext = createContext<AuthContextValue>({
  auth: undefined,
  config: undefined,
});

function LoadingError () {
  return <div>Loading error!</div>
}

export function AuthContextProvider (props: React.PropsWithChildren) {
  const [auth, setAuth] = useState<AuthData | false | undefined>(undefined)
  const [config, setConfig] = useState<any>(undefined)

  useEffect(() => {
    function onAuthChanged (e: Event) {
      const { detail } = e as CustomEvent<AuthData>;
      setAuth(auth => {
        if (typeof auth === 'undefined') {
          console.log('Authentication status loaded')
        } else {
          console.log('Authentication status updated')
        }
        return detail
      }
      )
    }

    document.addEventListener('allauth.auth.change', onAuthChanged)
    getAuth().then(data => setAuth(data)).catch((e) => {
      console.error(e)
      setAuth(false)
    })
    getConfig().then(data => setConfig(data)).catch((e) => {
      console.error(e)
    })
    return () => {
      document.removeEventListener('allauth.auth.change', onAuthChanged)
    }
  }, [])
  const loading = (typeof auth === 'undefined') || config?.status !== 200
  return (
    <AuthContext.Provider value={{ auth, config }}>
      {loading
        ? <Loading />
        : (auth === false
            ? <LoadingError />
            : props.children)}
    </AuthContext.Provider>
  )
}
