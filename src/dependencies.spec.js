import nock from 'nock'
import npa from 'npm-package-arg'
import sinon from 'sinon'

import dependencies from './dependencies.js'
const getExactVersion = dependencies.__get__('getExactVersion')
const resolveDependencies = dependencies.__get__('resolveDependencies')

describe('getExactVersion', () => {
  let sandbox

  beforeEach(() => {
    sandbox = sinon.createSandbox()
  })

  it('should return exact version when exact version provided', async () => {
    sandbox.stub(npa, 'resolve').callsFake((packageName) => {
      return {
        escapedName: packageName,
        type: 'version'
      }
    })
    expect(await getExactVersion('express', '3.0.0')).toEqual({
      packageName: 'express',
      exactVersion: '3.0.0'
    })
  })

  it('should return exact version when no exact version provided', async () => {
    sandbox.stub(npa, 'resolve').callsFake((packageName) => {
      return {
        escapedName: packageName,
        type: 'not exact'
      }
    })
    nock('https://registry.npmjs.org')
      .get('/express')
      .reply(200, {
        versions: {
          '3.21.2': {},
          '3.0.0': {}
        }
      })
    expect(await getExactVersion('express', '^3.0.0')).toEqual({
      packageName: 'express',
      exactVersion: '3.21.2'
    })
  })

  afterEach(() => {
    sandbox.restore()
  })
})

describe('resolveDependencies', () => {
  let sandbox

  beforeEach(() => {
    sandbox = sinon.createSandbox()
    dependencies.__set__('getExactVersion', sandbox.stub().callsFake((packageName, requestedVersion) => {
      return {
        packageName,
        exactVersion: requestedVersion
      }
    }))
  })

  it('should return correct results when there are dependencies', async () => {
    nock('https://registry.npmjs.org')
      .get('/express/3.0.0')
      .reply(200, {
        dependencies: {
          'fake-package': '1.0.0'
        }
      })
    nock('https://registry.npmjs.org')
      .get('/fake-package/1.0.0')
      .reply(200, {
        dependencies: {}
      })
    expect(await resolveDependencies('express', '3.0.0', null)).toEqual({
      'express@3.0.0': {
        'fake-package@1.0.0': {}
      }
    })
  })

  it('should return correct results when there are no dependencies', async () => {
    nock('https://registry.npmjs.org')
      .get('/express/3.0.0')
      .reply(200, {
        dependencies: {}
      })
    expect(await resolveDependencies('express', '3.0.0', null)).toEqual({})
  })

  afterEach(() => {
    sandbox.restore()
  })
})
