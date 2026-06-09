import { createContext, useContext } from 'react'

// Provides image resolution + editing for candy tiles.
//   imageFor(candyId)      -> url string ('' when none)
//   onEditImage(candyId)   -> open the URL editor for a candy (optional)
const ImagesContext = createContext({
  imageFor: () => '',
  onEditImage: null,
})

export function ImagesProvider({ value, children }) {
  return <ImagesContext.Provider value={value}>{children}</ImagesContext.Provider>
}

export function useImages() {
  return useContext(ImagesContext)
}
