import { deepFreeze } from 'deep-freeze-es6'

export const defineConfig = (config) => deepFreeze(config)
