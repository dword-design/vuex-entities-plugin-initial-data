import parsePkgName from 'parse-pkg-name'

import packageConfig from '@/package.json'

const packageName = parsePkgName(packageConfig.name).name

export default (options = {}) => {
  if (options.data === undefined) {
    throw new Error(`No initial data are defined for ${packageName}.`)
  }

  return context => ({
    init: () => context.store.dispatch('entities/inject', options.data),
  })
}
