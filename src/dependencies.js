import mem from 'mem'
import got from 'got'
import npa from 'npm-package-arg'
import semver from 'semver'

export const REGISTRY = 'https://registry.npmjs.org'

export function test (p1) {
  return p1
}

async function getExactVersion (packageName, requestedVersion) {
  const resolveResult = npa.resolve(packageName, requestedVersion)
  const { escapedName } = resolveResult
  const versionType = resolveResult.type
  // no need to do a lookup if the requested version is already an exact version
  if (versionType === 'version') {
    return {
      packageName,
      exactVersion: requestedVersion
    }
  }
  const urlGetVersions = `${ REGISTRY }/${ escapedName }`
  const npmResponse = await got(urlGetVersions).json()
  try {
    const exactVersion = semver.maxSatisfying(Object.keys(npmResponse.versions), requestedVersion)
    return {
      packageName,
      exactVersion
    }
  } catch(error) {
    console.error({
      versionType,
      packageName,
      escapedName,
      requestedVersion
    })
  }
}

const getExactVersionMemoized = mem((packageName, requestedVersion) => getExactVersion(packageName, requestedVersion), {
  cacheKey: arguments_ => arguments_.join(',')
})

async function resolveDependencies (packageName, requestedVersion, tree) {
  //console.log({packageName, requestedVersion, tree})
  const packageNameExactVersion = await getExactVersionMemoized(packageName, requestedVersion)
  const exactVersion = packageNameExactVersion?.exactVersion
  if (!exactVersion) { // unable to determine exact version; bail
    return tree
  }
  const versionedPackageName = `${ packageName }@${ exactVersion }`

  let isTopLevel = false
  if (!tree) {
    // isTopLevel = true
    tree = {}
    tree[versionedPackageName] = {}
  }
  const urlGetPackageInfo = `${ REGISTRY }/${ packageName }/${ exactVersion }`
  const packageInfo = await got(urlGetPackageInfo).json()
  const { dependencies, devDependencies, optionalDependencies } = packageInfo
  // include non-prod dependencies only for top level
  const combinedDependencies = isTopLevel ? { ...dependencies, ...devDependencies, ...optionalDependencies } : { ...dependencies }
  const combinedDependenciesKeys = Object.keys(combinedDependencies)
  if (!combinedDependenciesKeys.length > 0) {
    return {}
  }
  const exactVersionPromises = combinedDependenciesKeys.reduce((acc, dependencyName) => {
    const dependencyVersion = combinedDependencies[dependencyName]
    acc.push(getExactVersion(dependencyName, dependencyVersion))
    return acc
  }, [])
  const exactVersions = await Promise.all(exactVersionPromises)
  const dependencyNameExactVersionMap = exactVersions.reduce((acc, exactVersionResult) => {
    const packageName = exactVersionResult?.packageName
    const exactVersion = exactVersionResult?.exactVersion
    if (!packageName || !exactVersion) {
      return acc
    }
    acc[packageName] = exactVersion
    return acc
  }, {})

  const resolveDependenciesPromises = combinedDependenciesKeys.reduce((acc, dependencyName) => {
    const dependencyExactVersion = dependencyNameExactVersionMap[dependencyName]
    const versionedDependencyName = `${ dependencyName }@${ dependencyExactVersion }`
    tree[versionedPackageName][versionedDependencyName] = {}
    const resolvedDependencies = resolveDependenciesMemoized(dependencyName, dependencyExactVersion, tree[versionedPackageName])
    acc.push(resolvedDependencies)
    return acc
  }, [])
  try {
    await Promise.all(resolveDependenciesPromises)
  } catch(err) {
    console.log(err)
  }
  return tree
}

export const resolveDependenciesMemoized = mem((packageName, requestedVersion, tree) => resolveDependencies(packageName, requestedVersion, tree), {
  cacheKey: arguments_ => arguments_.slice(0, 2).join(',')
})
