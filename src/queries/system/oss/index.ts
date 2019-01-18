import { AuthenticationError } from 'apollo-server'
import { Context } from 'definitions'

export * from './users'
export * from './articles'
export * from './tags'
export * from './reports'
export * from './report'
export * from './today'

export const rootOSS = (_: any, __: any, { viewer }: Context) => {
  if (!viewer.id) {
    throw new AuthenticationError('visitor has no permission')
  }

  if (viewer.role !== 'admin') {
    throw new AuthenticationError('only admin can do this')
  }

  return true
}