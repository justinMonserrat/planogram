import { createContext, useContext } from 'react'

// Provides the merged candy catalog (built-in + user-added) plus helpers.
//   candies      -> Candy[]            (built-ins first, then custom)
//   getCandy(id) -> Candy | undefined
//   isBuiltin(id)-> boolean            (built-ins can't be deleted)
//   addCandy(d)  -> Candy              (create + persist a custom candy)
//   deleteCandy(id) -> void            (custom only; also clears placements)
const CandyContext = createContext({
  candies: [],
  getCandy: () => undefined,
  isBuiltin: () => true,
  addCandy: () => {},
  deleteCandy: () => {},
})

export function CandyProvider({ value, children }) {
  return <CandyContext.Provider value={value}>{children}</CandyContext.Provider>
}

export function useCandies() {
  return useContext(CandyContext)
}
