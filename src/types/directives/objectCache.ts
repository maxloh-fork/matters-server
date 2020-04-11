import { defaultFieldResolver, GraphQLField, GraphQLObjectType } from 'graphql'
import { SchemaDirectiveVisitor } from 'graphql-tools'

import { CACHE_PREFIX } from 'common/enums'
import { CacheService } from 'connectors'

const cacheService = new CacheService(undefined, CACHE_PREFIX.OBJECTS)

type EnhancedObject = GraphQLObjectType & {
  _ttl?: number
  _cacheFieldsWrapped?: boolean
}

type EnhancedField = GraphQLField<any, any> & { _ttl?: number }

export class ObjectCacheDirective extends SchemaDirectiveVisitor {
  public visitObject(type: EnhancedObject) {
    this.ensureFieldsWrapped(type)
    type._ttl = this.args.maxAge
  }

  public visitFieldDefinition(
    field: EnhancedField,
    details: {
      objectType: GraphQLObjectType
    }
  ) {
    this.ensureFieldsWrapped(details.objectType)
    field._ttl = this.args.maxAge
  }

  ensureFieldsWrapped(objectType: EnhancedObject) {
    // Mark the GraphQLObjectType object to avoid re-wrapping:
    if (objectType._cacheFieldsWrapped) {
      return
    }
    objectType._cacheFieldsWrapped = true

    const fields: { [key: string]: EnhancedField } = objectType.getFields()

    Object.keys(fields).forEach((fieldName) => {
      const field = fields[fieldName]
      const { resolve = defaultFieldResolver } = field
      field.resolve = async function (...args) {
        // Get the required Role from the field first, falling back
        // to the objectType if no Role is required by the field:
        const maxAge = field._ttl || objectType._ttl

        if (maxAge) {
          const [{ id }] = args

          return cacheService.getObject({
            type: objectType.name,
            id,
            field: field.name,
            getter: () => resolve.apply(this, args),
            expire: maxAge,
          })
        }

        return resolve.apply(this, args)
      }
    })
  }
}
