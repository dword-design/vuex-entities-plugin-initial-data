import parsePackagejsonName from 'parse-packagejson-name'

import packageConfig from '@/package.json'

const packageName = parsePackagejsonName(packageConfig.name).fullName

export default (options = {}) => {
  if (options.data === undefined) {
    throw new Error(`No initial data are defined for ${packageName}.`)
  }

  return context => ({
    init: () => context.store.dispatch('entities/inject', options.data),
  })
}
