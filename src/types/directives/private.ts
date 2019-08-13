import { CacheScope } from 'apollo-cache-control'
import { SchemaDirectiveVisitor } from 'graphql-tools'
import { defaultFieldResolver, GraphQLField } from 'graphql'
import { ForbiddenError } from 'common/errors'

export class PrivateDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field: GraphQLField<any, any>) {
    const { resolve = defaultFieldResolver, name } = field

    field.resolve = async function(...args) {
      const [{ id }, _, { viewer }, { cacheControl }] = args

      if (id === viewer.id || viewer.hasRole('admin')) {
        cacheControl.setCacheHint({ scope: CacheScope.Private })
        return resolve.apply(this, args)
      }

      throw new ForbiddenError(`unauthorized user for field ${name}`)
    }
  }
}
