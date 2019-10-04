import _ from 'lodash'
import passport from 'passport'
import {
  Strategy,
  StrategyOptionsWithRequest,
  VerifyFunctionWithRequest
} from 'passport-oauth2'

import { OAUTH_CALLBACK_ERROR_CODE } from 'common/enums'
import { environment } from 'common/environment'
import logger from 'common/logger'
import { UserService } from 'connectors'

class LikeCoinStrategy extends Strategy {
  constructor(
    options: StrategyOptionsWithRequest,
    verify: VerifyFunctionWithRequest
  ) {
    options = options || {}
    super(options, verify)
    this.name = 'likecoin'
  }
}

export default () => {
  passport.use(
    new LikeCoinStrategy(
      {
        authorizationURL: environment.likecoinAuthorizationURL,
        tokenURL: environment.likecoinTokenURL,
        clientID: environment.likecoinClientId,
        clientSecret: environment.likecoinClientSecret,
        callbackURL: environment.likecoinCallbackURL,
        passReqToCallback: true
      },
      async (req, accessToken, refreshToken, params, profile, done) => {
        const userService = new UserService()
        const viewer = req.app.locals.viewer
        const userId = _.get(viewer, 'id')
        const likerId = _.get(params, 'user')

        if (!userId) {
          return done(null, undefined, {
            code: OAUTH_CALLBACK_ERROR_CODE.userNotFound,
            message: 'viewer not found.'
          })
        }

        if (!likerId) {
          return done(null, undefined, {
            code: OAUTH_CALLBACK_ERROR_CODE.likerNotFound,
            message: 'liker not found.'
          })
        }

        try {
          // check if likerId is already exists
          const liker = await userService.findLiker({
            likerId
          })

          if (liker && liker.likerId !== viewer.likerId) {
            return done(null, undefined, {
              code: OAUTH_CALLBACK_ERROR_CODE.likerExists,
              message: 'liker already exists'
            })
          }

          // transfer viewer's temporary LikerID to his own LikerID
          if (viewer.likerId) {
            const fromLiker = await userService.findLiker({
              likerId: viewer.likerId
            })

            if (fromLiker && fromLiker.accountType === 'temporal') {
              await userService.transferLikerId({
                fromLiker,
                toLiker: {
                  likerId,
                  accessToken
                }
              })
            }
          }

          // save authorized liker and remove the existing temporary one
          await userService.saveLiker({
            userId,
            likerId,
            accessToken,
            refreshToken,
            accountType: 'general'
          })

          // activate user
          const user = await userService.activate({ id: viewer.id })

          return done(null, user)
        } catch (e) {
          logger.error(e)
          return done(null, undefined)
        }
      }
    )
  )
}
