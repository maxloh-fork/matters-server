import { ARTICLE_STATE } from 'common/enums'
import { ForbiddenError } from 'common/errors'
import { connectionFromPromisedArray, cursorToIndex } from 'common/utils'
import { RecommendationToValuedResolver } from 'definitions'

export const valued: RecommendationToValuedResolver = async (
  { id },
  { input },
  { viewer, dataSources: { articleService, draftService } }
) => {
  const { oss = false } = input

  if (oss) {
    if (!viewer.hasRole('admin')) {
      throw new ForbiddenError('only admin can access oss')
    }
  }

  const where = { 'article.state': ARTICLE_STATE.active }

  const { first, after } = input
  const offset = cursorToIndex(after) + 1

  const [totalCount, articles] = await Promise.all([
    articleService.countRecommendHottest({ where: id ? {} : where, oss }),
    articleService.recommendByScore({
      offset,
      limit: first,
      where,
      oss,
      score: 'value',
    }),
  ])
  return connectionFromPromisedArray(
    draftService.dataloader.loadMany(
      articles.map((article) => article.draftId)
    ),
    input,
    totalCount
  )
}
