// external
import querystring from 'querystring'
import { Router } from 'express'
import bodyParser from 'body-parser'
import passport from 'passport'

// internal
import { OAuthService } from 'connectors'
import { getViewerFromReq } from 'common/utils/getViewer'
import { environment } from 'common/environment'
import {
  OAUTH_AUTHORIZATION_TOKEN_EXPIRES_IN,
  OAUTH_ACCESS_TOKEN_EXPIRES_IN,
  OAUTH_REFRESH_TOKEN_EXPIRES_IN
} from 'common/enums'

// local
import initPassportStrategies from './strategies'
import OAuthServer from './express-oauth-server'

const oAuthRouter = Router()
const oAuthService = new OAuthService()
const oAuthServer = new OAuthServer({
  model: {
    generateAccessToken: oAuthService.generateAccessToken,
    generateRefreshToken: oAuthService.generateRefreshToken,
    getAuthorizationCode: oAuthService.getAuthorizationCode,
    getClient: oAuthService.getClient,
    saveToken: oAuthService.saveToken,
    saveAuthorizationCode: oAuthService.saveAuthorizationCode,
    revokeAuthorizationCode: oAuthService.revokeAuthorizationCode,
    validateScope: oAuthService.validateScope,
    getAccessToken: oAuthService.getAccessToken,
    getRefreshToken: oAuthService.getRefreshToken,
    revokeToken: oAuthService.revokeToken,
    verifyScope: oAuthService.verifyScope
  },
  allowEmptyState: true,
  authenticateHandler: {
    handle: async (req: any, res: any) => {
      const viewer = await getViewerFromReq({ req, res })

      if (!viewer.id) {
        return false
      }

      return viewer
    }
  },
  authorizationCodeLifetime: OAUTH_AUTHORIZATION_TOKEN_EXPIRES_IN / 1000,
  accessTokenLifetime: OAUTH_ACCESS_TOKEN_EXPIRES_IN / 1000,
  refreshTokenLifetime: OAUTH_REFRESH_TOKEN_EXPIRES_IN / 1000
})

/**
 * Routes
 */
oAuthRouter.use(passport.initialize())
oAuthRouter.use(bodyParser.json())
oAuthRouter.use(bodyParser.urlencoded({ extended: false }))
oAuthRouter.use(async (req, res, next) => {
  const viewer = await getViewerFromReq({ req, res })
  req.app.locals.viewer = viewer
  next()
})

/**
 * Routes:Provider
 */
oAuthRouter.use('/authorize', async (req, res, next) => {
  const qs = querystring.stringify(req.query)
  const grantUrl = `${environment.siteDomain}/oauth/authorize?${qs}`
  const loginUrl = `${environment.siteDomain}/login?${querystring.stringify({
    target: grantUrl
  })}`
  let redirectUrl = ''

  if (req.app.locals.viewer.id) {
    if (req.method === 'POST') {
      return next()
    } else {
      redirectUrl = grantUrl
    }
  } else {
    redirectUrl = loginUrl
  }

  res.redirect(redirectUrl)
})
oAuthRouter.post('/authorize', oAuthServer.authorize())
oAuthRouter.use('/access_token', oAuthServer.token())

/**
 * Routes:Receiver
 */
initPassportStrategies()

oAuthRouter.use('/:provider', (req, res, next) => {
  const fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl
  const qs = querystring.stringify({
    target: fullUrl
  })
  const loginUrl = `${environment.siteDomain}/login?${qs}`
  let redirectUrl = ''

  if (!req.app.locals.viewer.id) {
    redirectUrl = loginUrl
    return res.redirect(redirectUrl)
  }

  next()
})
oAuthRouter.get('/:provider', (req, res, next) => {
  passport.authenticate(req.params.provider)(req, res, next)
})
oAuthRouter.get('/:provider/callback', (req, res, next) => {
  const provider = req.params.provider

  passport.authenticate(provider, (err, user, info) => {
    if (err) {
      return next(err)
    }

    const qs = querystring.stringify(info)
    const successRedirect = `${environment.siteDomain}/oauth/${provider}/success`
    const failureRedirect = `${environment.siteDomain}/oauth/${provider}/failure?${qs}`

    if (!user) {
      return res.redirect(failureRedirect)
    }

    res.redirect(successRedirect)
  })(req, res, next)
})

export const oauth = oAuthRouter