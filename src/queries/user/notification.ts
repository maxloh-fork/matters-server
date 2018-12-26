import { Resolver } from 'definitions'

const resolver: Resolver = async (
  { id },
  _,
  { dataSources: { userService } }
) => userService.findNotifySetting(id)

export default resolver