import _get from 'lodash/get'
// local
import { toGlobalId } from 'common/utils'
import { knex } from 'connectors/db'
import { testClient } from './utils'

afterAll(knex.destroy)

const USER_ID = toGlobalId({ type: 'User', id: 1 })
const GET_NOTICES = `
  query($nodeInput: NodeInput!) {
    node(input: $nodeInput) {
      ... on User {
        notices(input:{ first: 100 }) {
          edges {
            node {
              id
              __typename
              createdAt
              unread
            }
          }
        }
      }
    }
  }
`

test('query notices', async () => {
  const { query } = await testClient({ isAuth: true })
  const { data } = await query({
    query: GET_NOTICES,
    // @ts-ignore
    variables: {
      nodeInput: { id: USER_ID }
    }
  })
  const notices = _get(data, 'node.notices.edges')
  expect(notices.length).toBeGreaterThan(0)
})
