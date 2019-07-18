import _ from 'lodash'
// internal
import { toGlobalId } from 'common/utils'
import { PUBLISH_STATE } from 'common/enums'
import {
  GQLNodeInput,
  GQLPublishArticleInput,
  GQLAppreciateArticleInput
} from 'definitions'
// local
import { testClient, publishArticle, putDraft, getViewerMAT } from './utils'

const mediaHash = 'someIpfsMediaHash1'

const ARTICLE_ID = toGlobalId({ type: 'Article', id: 2 })

const GET_ARTICLES = `
  query ($input: ArticlesInput!) {
    oss {
      articles(input: $input) {
        edges {
          node {
            id
          }
        }
      }
    }
  }
`

const RECALL_PUBLISH = `
  mutation($input: RecallPublishInput!) {
    recallPublish(input: $input) {
      publishState
    }
  }
`

const GET_ARTICLE_TAGS = `
  query ($input: NodeInput!) {
    node(input: $input) {
      ... on Article {
        id
        tags {
          content
        }
      }
    }
  }
`
const GET_ARTICLE_MAT = `
  query ($input: NodeInput!) {
    node(input: $input) {
      ... on Article {
        MAT
      }
    }
  }
`
const APPRECIATE_ARTICLE = `
  mutation($input: AppreciateArticleInput!) {
    appreciateArticle(input: $input) {
      MAT
    }
  }
`
const REPORT_ARTICLE = `
  mutation($input: ReportArticleInput!) {
    reportArticle(input: $input)
  }
`
const TOGGLE_ARTICLE_LIVE = `
  mutation($input: ToggleArticleLiveInput!) {
    toggleArticleLive(input: $input) {
      live
    }
  }
`
const TOGGLE_ARTICLE_PUBLIC = `
  mutation($input: ToggleArticlePublicInput!) {
    toggleArticlePublic(input: $input) {
      public
    }
  }
`

const GET_RELATED_ARTICLES = `
  query ($input: ArticleInput!) {
    article(input: $input) {
      relatedArticles(input: {}) {
        edges {
          node {
            title
          }
        }
      }
    }
  }
`

export const getArticleMAT = async (input: GQLNodeInput) => {
  const { query } = await testClient()
  const { data } = await query({
    query: GET_ARTICLE_MAT,
    // @ts-ignore
    variables: { input }
  })
  const { MAT } = data && data.node && data.node
  return MAT
}

export const appreciateArticle = async (input: GQLAppreciateArticleInput) => {
  const { mutate } = await testClient({
    isAuth: true
  })
  const result = await mutate({
    mutation: APPRECIATE_ARTICLE,
    // @ts-ignore
    variables: { input }
  })

  if (result.errors) {
    throw result.errors
  }

  const article = result && result.data && result.data.appreciateArticle
  return article
}

describe('query article', () => {
  test('query articles', async () => {
    const { query } = await testClient({ isAuth: true, isAdmin: true })
    const result = await query({
      query: GET_ARTICLES,
      // @ts-ignore
      variables: { input: {} }
    })
    expect(result.data.oss.articles.edges.length).toBeGreaterThan(1)
  })

  test('query related articles', async () => {
    const { query } = await testClient()
    const result = await query({
      query: GET_RELATED_ARTICLES,
      // @ts-ignore
      variables: { input: { mediaHash } }
    })
    expect(_.get(result, 'data.article.relatedArticles.edges')).toBeDefined()
  })
})

describe('query tag on article', () => {
  test('query tag on article', async () => {
    const id = toGlobalId({ type: 'Article', id: 1 })
    const { query } = await testClient()
    const { data } = await query({
      query: GET_ARTICLE_TAGS,
      // @ts-ignore
      variables: { input: { id } }
    })
    const tags = data && data.node && data.node.tags
    expect(
      new Set(tags.map(({ content }: { content: string }) => content))
    ).toEqual(new Set(['article', 'test']))
  })
})

describe('publish article', () => {
  test('create draft, publish and recall', async () => {
    jest.setTimeout(10000)
    const draft = {
      title: Math.random().toString(),
      content: Math.random().toString()
    }
    const { id } = await putDraft(draft)
    const { publishState } = await publishArticle({ id })
    expect(publishState).toBe(PUBLISH_STATE.pending)

    const { mutate } = await testClient({
      isAuth: true
    })
    const result = await mutate({
      mutation: RECALL_PUBLISH,
      // @ts-ignore
      variables: { input: { id } }
    })
    const draftRecalled = result && result.data && result.data.recallPublish
    expect(draftRecalled.publishState).toBe(PUBLISH_STATE.unpublished)
  })

  test('add collection to article and query', async () => {
    const { mutate } = await testClient({
      isAuth: true
    })

    const collection = [
      toGlobalId({ type: 'Article', id: 1 }),
      toGlobalId({ type: 'Article', id: 2 })
    ]

    const result = await mutate({
      mutation: `
        mutation($id: ID!, $collection: [ID!]!) {
          setCollection(input: { id: $id, collection: $collection }) {
            collection(input: {}) {
              edges {
                node {
                  id
                }
              }
            }
          }
        }
      `,
      // @ts-ignore
      variables: {
        id: toGlobalId({ type: 'Article', id: 4 }),
        collection
      }
    })

    expect(
      _.get(result, 'data.setCollection.collection.edges').map(
        ({ node }: { node: { id: string } }) => node.id
      )
    ).toMatchObject(collection)
  })
})

describe('appreciate article', () => {
  test('appreciate success', async () => {
    const viewerCurrentMAT = await getViewerMAT()
    const articleCurrentMAT = await getArticleMAT({ id: ARTICLE_ID })
    const appreciate = { id: ARTICLE_ID, amount: 1 }
    await appreciateArticle(appreciate)
    const viewerNewMAT = await getViewerMAT()
    const articleNewMAT = await getArticleMAT({ id: ARTICLE_ID })
    expect(viewerNewMAT).toBe(viewerCurrentMAT - appreciate.amount)
    // expect(articleNewMAT).toBe(articleCurrentMAT + appreciate.amount)
  })

  test('appreciate failed', async () => {
    const { totoal: viewerCurrentMAT } = await getViewerMAT()
    const appreciate = { id: ARTICLE_ID, amount: viewerCurrentMAT + 1 }
    try {
      await appreciateArticle(appreciate)
    } catch (e) {
      expect(() => {
        throw e
      }).toThrowError()
    }
  })
})

describe('report article', () => {
  test('report a article without assets', async () => {
    const { mutate } = await testClient({ isAuth: true })
    const result = await mutate({
      mutation: REPORT_ARTICLE,
      // @ts-ignore
      variables: {
        input: {
          id: ARTICLE_ID,
          category: 'spam',
          description: 'desc'
        }
      }
    })
    expect(result.data.reportArticle).toBe(true)
  })

  test('report a article with assets', async () => {
    const { mutate } = await testClient({ isAuth: true })
    const result = await mutate({
      mutation: REPORT_ARTICLE,
      // @ts-ignore
      variables: {
        input: {
          id: ARTICLE_ID,
          category: 'spam',
          description: 'desc',
          assetIds: ['00000000-0000-0000-0000-000000000011']
        }
      }
    })
    expect(result.data.reportArticle).toBe(true)
  })
})

describe('toggle article state', () => {
  test('enable article live', async () => {
    const { mutate } = await testClient({ isAuth: true, isAdmin: true })
    const result = await mutate({
      mutation: TOGGLE_ARTICLE_LIVE,
      // @ts-ignore
      variables: {
        input: {
          id: ARTICLE_ID,
          enabled: true
        }
      }
    })
    expect(result.data.toggleArticleLive.live).toBe(true)
  })

  test('disable article live', async () => {
    const { mutate } = await testClient({ isAuth: true, isAdmin: true })
    const result = await mutate({
      mutation: TOGGLE_ARTICLE_LIVE,
      // @ts-ignore
      variables: {
        input: {
          id: ARTICLE_ID,
          enabled: false
        }
      }
    })
    expect(result.data.toggleArticleLive.live).toBe(false)
  })

  test('enable article public', async () => {
    const { mutate } = await testClient({ isAuth: true, isAdmin: true })
    const { data } = await mutate({
      mutation: TOGGLE_ARTICLE_PUBLIC,
      // @ts-ignore
      variables: {
        input: {
          id: ARTICLE_ID,
          enabled: true
        }
      }
    })
    expect(data.toggleArticlePublic.public).toBe(true)
  })

  test('disable article public', async () => {
    const { mutate } = await testClient({ isAuth: true, isAdmin: true })
    const { data } = await mutate({
      mutation: TOGGLE_ARTICLE_PUBLIC,
      // @ts-ignore
      variables: {
        input: {
          id: ARTICLE_ID,
          enabled: false
        }
      }
    })
    expect(data.toggleArticlePublic.public).toBe(false)
  })
})
