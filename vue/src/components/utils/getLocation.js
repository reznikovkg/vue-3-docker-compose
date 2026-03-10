import { LOCATIONS } from '../../constants'

export const getLocation = (currentLocationValue) =>
  LOCATIONS.find(({ value }) => value === currentLocationValue)
