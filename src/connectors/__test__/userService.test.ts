import { UserService } from '../userService'
import { knex } from 'connectors/db'

afterAll(knex.destroy)

const userService = new UserService()

test('totalMAT', async () => {
  const count = await userService.totalMAT('1')
  expect(count).toBeDefined()
})

test('transactionHistory', async () => {
  const history = await userService.findTransactionHistory({ id: '1' })
  expect(history.length).toBeTruthy()
})