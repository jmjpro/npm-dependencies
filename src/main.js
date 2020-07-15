import treeify from 'treeify'

import { resolveDependenciesMemoized } from './functions'

(async () => {
  try {
    const packageName = process.argv[2]
    const requestedVersion = process.argv[3]
    const dependencies = await resolveDependenciesMemoized(packageName, requestedVersion)
    console.log(treeify.asTree(dependencies))
  } catch(err) {
    console.error(err)
  } 
})()
