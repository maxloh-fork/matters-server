import { Resolver, BatchParams, Context } from 'definitions'

const resolver: Resolver = async (
  { id }: { id: string },
  { input: { offset, limit } }: BatchParams,
  { dataSources: { userService } }: Context
) => await userService.findNoticesInBatch(id, offset, limit)

export default resolver