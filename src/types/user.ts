export default /* GraphQL */ `
  extend type Query {
    viewer: User
    user(input: UserInput!): User
  }

  extend type Mutation {
    "Send verification code for email."
    sendVerificationCode(input: SendVerificationCodeInput!): Boolean

    "Confirm verification code from email."
    confirmVerificationCode(input: ConfirmVerificationCodeInput!): ID!

    "Reset user password."
    resetPassword(input: ResetPasswordInput!): Boolean

    "Change user email."
    changeEmail(input: ChangeEmailInput!): Boolean @authenticate

    "Verify user email."
    verifyEmail(input: VerifyEmailInput!): Boolean @authenticate

    "Register user."
    userRegister(input: UserRegisterInput!): AuthResult!

    "Login user."
    userLogin(input: UserLoginInput!): AuthResult!

    "Logout user."
    userLogout: Boolean!

    # addOAuth(input: AddOAuthInput!): Boolean

    "Update user information."
    updateUserInfo(input: UpdateUserInfoInput!): User! @authenticate

    "Update user notification settings."
    updateNotificationSetting(input: UpdateNotificationSettingInput!): User! @authenticate

    "Follow a given user."
    followUser(input: FollowUserInput!): User! @authenticate

    "Unfollow curent user."
    unfollowUser(input: UnfollowUserInput!): User! @authenticate

    "Clear read history for user."
    clearReadHistory(input: ClearReadHistoryInput!): Boolean @authenticate

    "Clear search history for user."
    clearSearchHistory: Boolean  @authenticate

    "Update state of a user, used in OSS."
    updateUserState(input: UpdateUserStateInput!): User! @authorize
  }

  type User implements Node {
    "Global id of an user."
    id: ID!

    "UUID of an user, for backward compatibility."
    uuid: UUID!

    "Global unique user name of a user."
    userName: String

    "Display name on user profile, can be duplicated."
    displayName: String

    "URL for user avatar."
    avatar: URL

    "User information."
    info: UserInfo!

    "User settings."
    settings: UserSettings! @private

    "Article recommendations for current user."
    recommendation: Recommendation! @private

    "Articles authored by current user."
    articles(input: ConnectionArgs!): ArticleConnection!

    "Drafts authored by current user."
    drafts(input: ConnectionArgs!): DraftConnection! @private

    "Audiodraft by user, currently not used."
    audiodrafts(input: ConnectionArgs!): AudiodraftConnection! @private

    "Articles current user commented on"
    commentedArticles(input: ConnectionArgs!): ArticleConnection!

    subscriptions(input: ConnectionArgs!): ArticleConnection! @private
    activity: UserActivity! @private
    # Followers of this user
    followers(input: ConnectionArgs!): UserConnection!
    # Users that this user follows
    followees(input: ConnectionArgs!): UserConnection!
    # This user is following viewer
    isFollower: Boolean!
    # Viewer is following this user
    isFollowee: Boolean!
    status: UserStatus
    # OSS
    oss: UserOSS! @authorize
    remark: String @authorize
  }

  type Recommendation {
    followeeArticles(input: ConnectionArgs!): ArticleConnection!
    newest(input: ConnectionArgs!): ArticleConnection!
    hottest(input: ConnectionArgs!): ArticleConnection!
    # Matters Today
    today: Article
    # In case you missed it
    icymi(input: ConnectionArgs!): ArticleConnection!
    tags(input: ConnectionArgs!): TagConnection!
    topics(input: ConnectionArgs!): ArticleConnection!
    authors(input: AuthorsInput!): UserConnection!
  }

  input AuthorsInput {
    after: String
    first: Int
    oss: Boolean
    filter: AuthorsFilter
  }

  input AuthorsFilter {
    random: Boolean
    followed: Boolean
  }

  type UserInfo {
    createdAt: DateTime!
    # Unique user name
    userName: String! @deprecated(reason: "Use \`User.userName\`.")
    # Is user name editable
    userNameEditable: Boolean!
    # Display name on profile
    displayName: String! @deprecated(reason: "Use \`User.displayName\`.")
    # User desciption
    description: String
    # URL for avatar
    avatar: URL @deprecated(reason: "Use \`User.avatar\`.")
    email: Email @private
    emailVerified: Boolean
    mobile: String @private
    # Use 500 for now, adaptive in the future
    readSpeed: Int!
    badges: [Badge!]
    agreeOn: DateTime
  }

  type UserSettings {
    # User language setting
    language: UserLanguage!
    # Thrid party accounts binded for the user
    # oauthType: [OAuthType!]
    # Notification settings
    notification: NotificationSetting!
  }

  type UserActivity {
    history(input: ConnectionArgs!): ReadHistoryConnection!
    recentSearches(input: ConnectionArgs!): RecentSearchConnection!
  }

  type UserStatus {
    state: UserState!
    role: UserRole!
    # Total MAT left in wallet
    MAT: MAT! @private
    invitation: InvitationStatus @deprecated(reason: "removed")
    # Number of articles published by user
    articleCount: Int! @deprecated(reason: "Use \`User.articles.totalCount\`.")
    # Number of views on articles
    viewCount: Int! @private
    draftCount: Int! @private @deprecated(reason: "Use \`User.drafts.totalCount\`.")
    # Number of comments posted by user
    commentCount: Int!
    # quotationCount: Int! @deprecated(reason: "not used")
    subscriptionCount: Int! @private @deprecated(reason: "Use \`User.subscriptions.totalCount\`.")
    # Number of user that this user follows
    followeeCount: Int! @deprecated(reason: "Use \`User.followees.totalCount\`.")
    # Number of user that follows this user
    followerCount: Int! @deprecated(reason: "Use \`User.followers.totalCount\`.")
    # Number of unread notices
    unreadNoticeCount: Int! @private

    unreadFolloweeArticles: Boolean!
    unreadResponseInfoPopUp: Boolean!
  }

  ## TODO: remove in OSS
  type InvitationStatus {
    reward: String
    # invitation number left
    left: Int
    # invitations sent
    sent(input: ConnectionArgs!): InvitationConnection
  }

  ## TODO: remove in OSS
  type Invitation {
    id: ID!
    user: User
    email: String
    accepted: Boolean!
    createdAt: DateTime!
  }

  ## TODO: remove in OSS
  type InvitationConnection implements Connection {
    totalCount: Int!
    pageInfo: PageInfo!
    edges: [InvitationEdge!]
  }

  ## TODO: remove in OSS
  type InvitationEdge {
    cursor: String!
    node: Invitation!
  }

  type UserOSS {
    boost: NonNegativeFloat!
    score: NonNegativeFloat!
  }

  type MAT {
    total: Int!
    history(input: ConnectionArgs!): TransactionConnection!
  }

  type Transaction {
    delta: Int!
    purpose: TransactionPurpose!
    content: String!
    createdAt: DateTime!
  }

  type NotificationSetting {
    enable: Boolean!
    email: Boolean!
    mention: Boolean!
    follow: Boolean!
    comment: Boolean!
    appreciation: Boolean!
    articleSubscription: Boolean!
    commentSubscribed: Boolean!
    downstream: Boolean!
    commentPinned: Boolean!
    commentVoted: Boolean!
    # walletUpdate: Boolean!
    officialNotice: Boolean!
    reportFeedback: Boolean!
  }

  type ReadHistory {
    article: Article!
    readAt: DateTime!
  }

  type Badge {
    type: BadgeType!
  }

  type AuthResult {
    auth: Boolean!
    token: String @deprecated(reason: "Use cookie for auth.")
  }

  type UserConnection implements Connection {
    totalCount: Int!
    pageInfo: PageInfo!
    edges: [UserEdge!]
  }

  type UserEdge {
    cursor: String!
    node: User!
  }

  type ReadHistoryConnection implements Connection {
    totalCount: Int!
    pageInfo: PageInfo!
    edges: [ReadHistoryEdge!]
  }

  type ReadHistoryEdge {
    cursor: String!
    node: ReadHistory!
  }

  type RecentSearchConnection implements Connection {
    totalCount: Int!
    pageInfo: PageInfo!
    edges: [RecentSearchEdge!]
  }

  type RecentSearchEdge {
    cursor: String!
    node: String!
  }

  type TransactionConnection implements Connection {
    totalCount: Int!
    pageInfo: PageInfo!
    edges: [TransactionEdge!]
  }

  type TransactionEdge {
    cursor: String!
    node: Transaction!
  }

  input UserInput {
    userName: String!
  }

  input SendVerificationCodeInput {
    email: Email!
    type: VerificationCodeType!
  }

  input ConfirmVerificationCodeInput {
    email: Email!
    type: VerificationCodeType!
    code: String!
  }

  input ResetPasswordInput {
    password: String!
    codeId: ID!
  }

  input ChangeEmailInput {
    oldEmail: Email!
    oldEmailCodeId: ID!
    newEmail: Email!
    newEmailCodeId: ID!
  }

  input VerifyEmailInput {
    codeId: ID!
  }

  input UserRegisterInput {
    email: Email!
    userName: String
    displayName: String!
    password: String!
    description: String
    codeId: ID!
  }

  input UserLoginInput {
    email: Email!
    password: String!
  }

  # input AddOAuthInput {
  #   name: String!
  #   id: String!
  #   type: OAuthType
  # }

  input UpdateNotificationSettingInput {
    type: NotificationSettingType!
    enabled: Boolean!
  }

  input UpdateUserInfoInput {
    displayName: String
    userName: String
    avatar: ID
    description: String
    language: UserLanguage
    agreeOn: Boolean
  }

  input UpdateUserStateInput {
    id: ID!
    state: UserState!
    banDays: PositiveInt
  }


  input FollowUserInput {
    id: ID!
  }

  input UnfollowUserInput {
    id: ID!
  }

  input ImportArticlesInput {
    platform: String
    token: String
  }

  input ClearReadHistoryInput {
    id: ID!
  }

  enum BadgeType {
    seed
  }

  enum VerificationCodeType {
    register
    email_reset
    email_reset_confirm
    password_reset
    email_verify
  }

  enum UserInfoFields {
    displayName
    avatar
    description
    email
    mobile
    agreeOn
  }

  enum UserLanguage {
    en
    zh_hans
    zh_hant
  }

  enum NotificationSettingType {
    enable
    email
    mention
    follow
    comment
    appreciation
    articleSubscription
    commentSubscribed
    downstream
    commentPinned
    commentVoted
    officialNotice
    reportFeedback
  }

  # enum OAuthType {
  #   facebook
  #   wechat
  #   google
  # }

  enum UserState {
    active
    onboarding
    banned
    frozen
    archived
  }

  enum UserRole {
    user
    admin
  }

  enum TransactionPurpose {
    appreciate
    appreciateComment
    appreciateSubsidy
    invitationAccepted
    joinByInvitation
    joinByTask
    firstPost
    systemSubsidy
  }
`
