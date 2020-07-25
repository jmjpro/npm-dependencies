import treeify from 'treeify'

import { resolveDependenciesMemoized } from './dependencies'

export default async (packageName, requestedVersion) => {
  try {
    const dependencies = await resolveDependenciesMemoized(packageName, requestedVersion)
    return treeify.asTree(dependencies)
  } catch(err) {
    console.error(err)
  } 
}