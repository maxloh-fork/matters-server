// external
import { createTestClient } from 'apollo-server-testing'
import { ApolloServer } from 'apollo-server'
import { Request } from 'express'
// local
import {
  DataSources,
  GQLPublishArticleInput,
  GQLPutDraftInput,
  GQLUserRegisterInput
} from 'definitions'
import {
  ArticleService,
  CommentService,
  DraftService,
  SystemService,
  TagService,
  UserService,
  NotificationService
} from 'connectors'
import { roleAccess } from 'common/utils'
import schema from '../../schema'

export const defaultTestUser = {
  email: 'test1@matters.news',
  password: '123'
}
export const adminUser = {
  email: 'admin1@matters.news',
  password: '123'
}

export const getUserContext = async ({ email }: { email: string }) => {
  const userService = new UserService()
  const user = await userService.findByEmail(email)
  return {
    viewer: user
  }
}

export const delay = (ms: number) =>
  new Promise(resolve => setTimeout(resolve, ms))

export const testClient = async (
  {
    isAuth,
    isAdmin,
    context
  }: { isAuth?: boolean; isAdmin?: boolean; context?: any } = {
    isAuth: false,
    isAdmin: false,
    context: null
  }
) => {
  let _context: any = {}
  if (context) {
    _context = context
  } else if (isAuth) {
    _context = await getUserContext({
      email: isAdmin ? adminUser.email : defaultTestUser.email
    })
  }

  const viewer = (_context && _context.viewer) || { id: null }

  if (!viewer.role) {
    viewer.role = isAdmin ? 'admin' : isAuth ? 'user' : 'visitor'
  }

  _context.viewer = {
    ...viewer,
    hasRole: (requires: string) =>
      roleAccess.findIndex(role => role === viewer.role) >=
      roleAccess.findIndex(role => role === requires)
  }

  const server = new ApolloServer({
    schema,
    context: ({ req }: { req: Request }) => {
      return { req, ..._context }
    },
    dataSources: (): DataSources => ({
      userService: new UserService(),
      articleService: new ArticleService(),
      commentService: new CommentService(),
      draftService: new DraftService(),
      systemService: new SystemService(),
      tagService: new TagService(),
      notificationService: new NotificationService()
    })
  })

  return createTestClient(server)
}

export const publishArticle = async (input: GQLPublishArticleInput) => {
  const PUBLISH_ARTICLE = `
    mutation($input: PublishArticleInput!) {
      publishArticle(input: $input) {
        id
        publishState
        title
        content
        createdAt
      }
    }
  `

  const { mutate } = await testClient({
    isAuth: true
  })

  const result = await mutate({
    mutation: PUBLISH_ARTICLE,
    // @ts-ignore
    variables: { input }
  })

  const article = result && result.data && result.data.publishArticle
  return article
}

export const putDraft = async (draft: GQLPutDraftInput) => {
  const PUT_DRAFT = `
    mutation($input: PutDraftInput!) {
      putDraft(input: $input) {
        id
        upstream {
          id
        }
        cover
        title
        summary
        content
        createdAt
      }
    }
  `
  const { mutate } = await testClient({
    isAuth: true
  })
  const result = await mutate({
    mutation: PUT_DRAFT,
    // @ts-ignore
    variables: { input: draft }
  })

  const putDraft = result && result.data && result.data.putDraft
  return putDraft
}

export const registerUser = async (user: GQLUserRegisterInput) => {
  const USER_REGISTER = `
    mutation UserRegister($input: UserRegisterInput!) {
      userRegister(input: $input) {
        auth
        token
      }
    }
  `

  const { mutate } = await testClient()
  return mutate({
    mutation: USER_REGISTER,
    // @ts-ignore
    variables: { input: user }
  })
}

export const updateUserDescription = async ({
  email,
  description
}: {
  email?: string
  description: string
}) => {
  const UPDATE_USER_INFO_DESCRIPTION = `
    mutation UpdateUserInfo($input: UpdateUserInfoInput!) {
      updateUserInfo(input: $input) {
        info {
          description
        }
      }
    }
  `

  let _email = defaultTestUser.email
  if (email) {
    _email = email
  }
  const context = await getUserContext({ email: _email })
  const { mutate } = await testClient({
    context
  })
  return mutate({
    mutation: UPDATE_USER_INFO_DESCRIPTION,
    // @ts-ignore
    variables: { input: { description } }
  })
}

export const getViewerMAT = async () => {
  const GET_VIEWER_MAT = `
    query {
      viewer {
        status {
          MAT {
            total
          }
        }
      }
    }
  `

  const { query } = await testClient({ isAuth: true })
  const result = await query({
    query: GET_VIEWER_MAT,
    // @ts-ignore
    variables: { input: {} }
  })
  const { data } = result
  const { total } =
    data && data.viewer && data.viewer.status && data.viewer.status.MAT
  return total
}
