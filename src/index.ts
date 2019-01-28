require('newrelic')
require('module-alias/register')
require('dotenv').config()
// external
import { ApolloServer } from 'apollo-server'
// internal
import logger from 'common/logger'
import { environment, isProd } from 'common/environment'
import { DataSources } from 'definitions'
import { makeContext, initSubscriptions } from 'common/utils'
import scheduleQueue from 'connectors/queue/schedule'
import {
  ArticleService,
  CommentService,
  DraftService,
  SystemService,
  TagService,
  UserService,
  NotificationService
} from 'connectors'
// local
import schema from './schema'

const mocks = {
  JSON: () => ({
    'index.html': '<html><p>hello</p></html>',
    '1.png': 'some png string'
  }),
  DateTime: () => new Date().toISOString(),
  Email: () => 'test@matters.news',
  UUID: () => '00000000-0000-0000-0000-000000000001',
  URL: () => 'test-url'
}

// start schedule jobs
scheduleQueue.start()

const server = new ApolloServer({
  schema,
  context: makeContext,
  engine: {
    apiKey: environment.apiKey
  },
  subscriptions: initSubscriptions(),
  dataSources: (): DataSources => ({
    userService: new UserService(),
    articleService: new ArticleService(),
    commentService: new CommentService(),
    draftService: new DraftService(),
    systemService: new SystemService(),
    tagService: new TagService(),
    notificationService: new NotificationService()
  }),
  debug: !isProd
  // mocks
})

server
  .listen({ port: process.env.PORT || 4000 })
  .then(({ url, subscriptionsUrl }) => {
    logger.info(`🚀 Server ready at ${url}`)
    logger.info(`🚀 Subscriptions ready at ${subscriptionsUrl}`)
  })
