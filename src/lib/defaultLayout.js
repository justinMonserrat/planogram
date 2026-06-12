import defaultData from '../data/default-layout.json'
import { normalizeRack } from './rack.js'

export function getDefaultRack() {
  const rack = defaultData.rack ?? defaultData
  return normalizeRack(rack)
}
