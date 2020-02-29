import _difference from 'lodash/difference'

import {
  AuthenticationError,
  ForbiddenError,
  TagNotFoundError,
  UserInputError
} from 'common/errors'
import { fromGlobalId } from 'common/utils'
import { ArticleService, NotificationService } from 'connectors'
import { MutationToPutArticlesTagsResolver } from 'definitions'

const triggerNotice = async ({
  articleId,
  articleService,
  notificationService,
  selected,
  tag,
  viewerId
}: {
  articleId: string
  articleService: InstanceType<typeof ArticleService>
  notificationService: InstanceType<typeof NotificationService>
  selected: boolean
  tag: any
  viewerId: string
}) => {
  const article = await articleService.baseFindById(articleId)
  notificationService.trigger({
    event:
      selected === true
        ? 'article_tag_has_been_added'
        : 'article_tag_has_been_unselected',
    recipientId: article.authorId,
    actorId: viewerId,
    entities: [
      {
        type: 'target',
        entityTable: 'article',
        entity: article
      },
      {
        type: 'tag',
        entityTable: 'tag',
        entity: tag
      }
    ]
  })
}

const resolver: MutationToPutArticlesTagsResolver = async (
  root,
  { input: { id, articles, selected } },
  { viewer, dataSources: { articleService, notificationService, tagService } }
) => {
  if (!viewer.id) {
    throw new AuthenticationError('viewer has no permission')
  }

  if (!articles) {
    throw new UserInputError('"articles" is required in update')
  }

  // temporarily safety check
  if (viewer.email !== 'hi@matters.news') {
    throw new ForbiddenError('only Matty can manage tag at this moment')
  }

  const { id: dbId } = fromGlobalId(id)
  const tag = await tagService.baseFindById(dbId)
  if (!tag) {
    throw new TagNotFoundError('tag not found')
  }

  if (typeof selected === 'boolean') {
    // set article as selected
    const { id: articleId } = fromGlobalId(articles[0])
    await tagService.putArticleTag({
      articleId,
      tagId: dbId,
      data: { selected }
    })

    // trigger notification for adding article tag
    await triggerNotice({
      articleId,
      articleService,
      notificationService,
      selected,
      tag,
      viewerId: viewer.id
    })
  } else {
    // compare new and old article ids which have this tag
    const oldIds = await tagService.findArticleIdsByTagIds([dbId])
    const newIds = articles.map(articleId => fromGlobalId(articleId).id)
    const addIds = _difference(newIds, oldIds)

    // article will be selected by default if the article tag created by admin
    await tagService.createArticleTags({
      articleIds: addIds,
      tagIds: [dbId],
      selected: true
    })

    // trigger notification for adding article tag
    addIds.forEach(async (articleId: string) => {
      await triggerNotice({
        articleId,
        articleService,
        notificationService,
        selected: true,
        tag,
        viewerId: viewer.id
      })
    })
  }
  return tag
}

export default resolver