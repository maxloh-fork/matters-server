import _get from 'lodash/get'
// local
import { toGlobalId } from 'common/utils'
import { knex } from 'connectors/db'
import { testClient } from './utils'

afterAll(knex.destroy)

const isDesc = (ints: number[]) =>
  ints
    .slice(1)
    .map((e, i) => e <= ints[i])
    .every(x => x)

const ARTICLE_ID = toGlobalId({ type: 'Article', id: 1 })
const COMMENT_ID = toGlobalId({ type: 'Comment', id: 1 })
const GET_ARTILCE_COMMENTS = `
  query($nodeInput: NodeInput!, $commentsInput: CommentsInput!) {
    node(input: $nodeInput) {
      ... on Article {
        id
        comments(input: $commentsInput) {
          edges {
            node {
              quote
              upvotes
              pinned
              createdAt
              author {
                id
              }
            }
          }
        }
      }
    }
  }
`
const REPORT_COMMENT = `
  mutation($input: ReportCommentInput!) {
    reportComment(input: $input)
  }
`

const VOTE_COMMENT = `
  mutation($input: VoteCommentInput!) {
    voteComment(input: $input) {
      upvotes
      downvotes
    }
  }
`

const UNVOTE_COMMENT = `
  mutation($input: UnvoteCommentInput!) {
    unvoteComment(input: $input) {
      upvotes
      downvotes
    }
  }
`

const DELETE_COMMENT = `
  mutation($input: DeleteCommentInput!) {
    deleteComment(input: $input)
  }
`

const GET_COMMENT = `
  query($input: NodeInput!) {
    node(input: $input) {
      ... on Comment {
        upvotes
        downvotes
      }
    }
  }
`

const getCommentVotes = async (commentId: string) => {
  const { query } = await testClient()
  const { data } = await query({
    query: GET_COMMENT,
    // @ts-ignore
    variables: {
      input: { id: commentId }
    }
  })
  return data && data.node
}

describe('query comment list on article', async () => {
  test('query comments by author', async () => {
    const authorId = toGlobalId({ type: 'User', id: 2 })
    const { query } = await testClient()
    const { data } = await query({
      query: GET_ARTILCE_COMMENTS,
      // @ts-ignore
      variables: {
        nodeInput: { id: ARTICLE_ID },
        commentsInput: { author: authorId }
      }
    })
    const comments = _get(data, 'node.comments.edges')
    for (const comment of comments) {
      expect(comment.node.author.id).toBe(authorId)
    }
  })

  test('query quoted comments', async () => {
    const { query } = await testClient()
    const { data } = await query({
      query: GET_ARTILCE_COMMENTS,
      // @ts-ignore
      variables: {
        nodeInput: { id: ARTICLE_ID },
        commentsInput: { quote: true }
      }
    })

    const comments = _get(data, 'node.comments.edges')

    for (const comment of comments) {
      expect(comment.node.quote).toBe(true)
    }
  })

  test('sort comments by upvotes', async () => {
    const { query } = await testClient()
    const { data } = await query({
      query: GET_ARTILCE_COMMENTS,
      // @ts-ignore
      variables: {
        nodeInput: { id: ARTICLE_ID },
        commentsInput: { sort: 'upvotes' }
      }
    })

    const comments = _get(data, 'node.comments.edges')

    const commentVotes = comments.map(
      ({ node: { upvotes } }: { node: { upvotes: number } }) => upvotes
    )
    expect(isDesc(commentVotes)).toBe(true)
  })

  test('sort comments by newest', async () => {
    const { query } = await testClient()
    const { data } = await query({
      query: GET_ARTILCE_COMMENTS,
      // @ts-ignore
      variables: {
        nodeInput: { id: ARTICLE_ID },
        commentsInput: { sort: 'newest' }
      }
    })
    const comments = _get(data, 'node.comments.edges')

    const commentTimestamps = comments.map(
      ({ node: { createdAt } }: { node: { createdAt: string } }) =>
        new Date(createdAt).getTime()
    )
    expect(isDesc(commentTimestamps)).toBe(true)
  })
})

describe('Report comment', async () => {
  test('report a comment without asset', async () => {
    const { mutate } = await testClient({ isAuth: true })
    const result = await mutate({
      mutation: REPORT_COMMENT,
      // @ts-ignore
      variables: {
        input: {
          id: COMMENT_ID,
          category: 'spam',
          description: 'desc'
        }
      }
    })
    expect(result.data.reportComment).toBe(true)
  })

  test('report a comment with asset', async () => {
    const { mutate } = await testClient({ isAuth: true })
    const result = await mutate({
      mutation: REPORT_COMMENT,
      // @ts-ignore
      variables: {
        input: {
          id: COMMENT_ID,
          category: 'spam',
          description: 'desc',
          assetIds: ['00000000-0000-0000-0000-000000000011']
        }
      }
    })
    expect(result.data.reportComment).toBe(true)
  })
})

describe('mutations on comment', async () => {
  const commentId = toGlobalId({ type: 'Comment', id: 3 })

  test('upvote a comment', async () => {
    const { mutate } = await testClient({ isAuth: true })
    const { upvotes, downvotes } = await getCommentVotes(commentId)

    // upvote
    const { data } = await mutate({
      mutation: VOTE_COMMENT,
      // @ts-ignore
      variables: {
        input: { id: commentId, vote: 'up' }
      }
    })
    expect(_get(data, 'voteComment.upvotes')).toBe(upvotes + 1)
  })

  test('downvote a comment', async () => {
    const { mutate } = await testClient({ isAuth: true })
    const { upvotes, downvotes } = await getCommentVotes(commentId)
    const { data: downvoteData } = await mutate({
      mutation: VOTE_COMMENT,
      // @ts-ignore
      variables: {
        input: { id: commentId, vote: 'down' }
      }
    })
    expect(_get(downvoteData, 'voteComment.upvotes')).toBe(upvotes - 1)
    expect(_get(downvoteData, 'voteComment.downvotes')).toBe(downvotes + 1)
  })

  test('unvote a comment', async () => {
    const { mutate } = await testClient({ isAuth: true })
    const { upvotes, downvotes } = await getCommentVotes(commentId)
    const { data: unvoteData } = await mutate({
      mutation: UNVOTE_COMMENT,
      // @ts-ignore
      variables: {
        input: { id: commentId }
      }
    })
    expect(_get(unvoteData, 'unvoteComment.upvotes')).toBe(upvotes)
    expect(_get(unvoteData, 'unvoteComment.downvotes')).toBe(downvotes - 1)
  })

  test('delete comment', async () => {
    const { mutate } = await testClient({ isAuth: true })
    const { data } = await mutate({
      mutation: DELETE_COMMENT,
      // @ts-ignore
      variables: {
        input: { id: toGlobalId({ type: 'Comment', id: 1 }) }
      }
    })
    expect(_get(data, 'deleteComment')).toBe(true)
  })
})
