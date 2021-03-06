# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## DEPRECATED

We will no longer update this file, please check out the [releases page](https://github.com/thematters/matters-server/releases) for the latest changelog.

## [3.2.0] - 2020-06-11

### Changed

- Store language to db #1149
- Strip off viewer for query that name contains `Public` suffix #1166

## [3.1.0] - 2020-06-05

### Added

- Add "nodes" root query #1137

### Changed

- Move objectCache to field and use args in objectCache #1105
- Add prevention of multiple pending payout transactions. #1115
- Add error code for payment password. #1116
- Catch known error. #1127
- Adjust fee of Matters service. #1136
- Fix amount of payout email #1143

## [3.0.0] - 2020-05-23

### Added

- Payout #1065 #1066 #1071 #1072 #1073 #1077 #1085
- Create default code of conduct #1084

### Changed

- Add admin state to feature flag #1070
- Add order for donator list. #1078
- Add safety check for HKD payment maximum amount. #1049
- Add recaptcha check to appreciate and corresponding feature flag #1044
- Add daily donation limit for HKD. #1051
- Remove & Regenerate Environment Variables #1086
- Revise notice content of user ban. #1050
- Drop extra transaction purpose constraints. #1087

## [2.14.0] - 2020-05-15

### Added

- Matters Pay #884 #930 #946 #971 #983 #984 #985 #1006 #1007 #1011 #1016 #1023 #1030 #1031 #1035 #1040
- A/B Grouping #977
- Read Timer #992
- Feature Flag #1039
- Apache 2.0 License #1028

### Changed

- Add ab test for front page feed
- Add "Draft.article" query; #991
- Implementation of auto-unban user. #959
- Add `@scope` for field `role` and partially retire downstream and upstream. #961
- Record agent hash's mapping email. #945
- Make "liker.likerId" public #952

## [2.13.0] - 2020-04-20

### Added

- @objectCache directive #907

### Changed

- Rename "Transaction" to "Appreciation" in schema #882
- Disable ban-user for sending verification code. #917
- Add matching for article URL in search key #908
- Add an index to user table #919
- Revise query and add a new connection handler. #922
- Fix appreciation data and schema #915
- Fix constraints for `appreciation` table #923

## [2.12.0] - 2020-04-09

### Added

- BlockList API #826
- ReCaptcha #850
- Operation Limits #880
- Churn Emails #828 #844 #851 #806

### Changed

- Add appreciation table and update SQL queries #896
- Increase TTL value for general cache. #898
- Revise logics of saving agent hash for archived user #881
- Upgrade to Prettier 2.0 #853

## [2.11.0] - 2020-03-27

### Added

- Add blocklist table and related methods #814

### Changed

- Add development email template ids #817
- Change node version of Drone CI & Dockerfile to 12.16 #819
- Fix ES search filter #820

## [2.10.0] - 2020-03-20

### Added

- Add index into article and article_read_count table. #808

### Changed

- Remove comment voted notification; #809

## [2.9.0] - 2020-03-18

### Added

- Migration API & email template #790 #793 #795 #796 #803
- Add `tag.selected` #797

### Changed

- Remove email templates #800
- Revert "Disable fallback to set candidate cover" #792
- Add timeout param to eb deploy #770

## [2.8.0] - 2020-02-28

### Added

- Migration of article read table #752

## [2.7.0] - 2020-02-06

### Changed

- Migration queue and service #669
- Change article tag schema and rename APIs. #677
- Alter tag API for filtering out selected or all articles under a specific tag #715
- Update userName index field for searching #670
- Update recommendation engine #696
- Use `@matters/passport-likecoin` #697

## [2.6.0] - 2020-01-13

### Added

- Add Medium strategy and API for migration. #662 #664

### Changed

- Allow onboarding users to appreciate articles #663
- Alter `user_oauth` table #660 #661
- Bump deps #653

## [2.5.1] - 2019-12-31

### Changed

- Send welcome email to new register user #636

## [2.5.0] - 2019-12-27

### Added

- Onboarding User Restrictions #618 #622

### Changed

- Fix refresh view by renaming queue jobs #617
- Bug Fixes of user deletion #620
- Enhancement of recommendation #619 #621
  - exclude collection articles from related articles
  - add query for recommendation articles for user
  - add default vector score
- Allow "@matters.news" to use "+" sign #624

## [2.4.0] - 2019-12-13

### Added

- Add more indexes #601
- Delete user #605
- Convert webp to jpeg #608
- Test case of managing tag #610
- Update search document after tag management action #612
- Update tags' cache after management actions #613

### Changed

- Add `LIKER_EMAIL_EXISTS` and `LIKER_USER_ID_EXISTS` errors #599
- Reduce interval of tag refresh from 3.1 hours to 2 minutes #609

## [2.3.0] - 2019-11-28

### Added

- Collapse Comment #589 #591 #592 #594
- Add indexes #588
- Add id token to `oauth/access_token` response #590

### Changed

- Return proper response when doing publish #583
- Use winston transport instead of format pipe for Sentry. #587
- Add option to disable `+` sign in `isValidateEmail` #597

## [2.2.0] - 2019-11-20

### Added

- Civic Liker #567 #569 #573
- Web Push Notification #552 #557 #558 #562 #564 #575
- featured comments materialized view #565 #572

### Changed

- Change followee articles queries #563
- Update article activity rank #566 #570
- Add indexes for transaction and comment tables. #568
- Async LikeCoin API calling with queue #576

## [2.1.2] - 2019-11-04

### Added

- Add `updateUserRole` mutation #551

### Changed

- Add support for batch update comments' state; #550

## [2.1.1] - 2019-10-31

### Added

- likecoin analytics #547

## [2.1.0] - 2019-10-29

### Added

- Block User #539 #541 #543

### Changed

- Encode URL using encodeURI (ask by LikeCoin team). #536
- Upgrade es to 7.3 #523
- Remove LikeCoin migration related mutations; Remove unused error codes; #538

## [2.0.0] - 2019-10-15

### Changed

- Enable LikeCoin features for client-side

## [1.11.0] - 2019-10-03

### Added

- Use `nanoid` to generate oauth access/refresh tokens #454
- Add handlers for "temporal" liker account #460
- `Article.featuredComments` API #465
- Add purge cache middleware #468
- APIs for likecoin related UI #474
- Add backdoor for `LikeCoin` OAuth Client to finish `Login with Matters` flow #476
- Add `GenerateTempLikerIds` mutation to generate temp likerId for users #478
- Add transaction type #490
- Add cache service for other async service #495

### Changed

- Alter `changeEmail` mutation to return a user #455
- Fix `validateScope` #456
- Create and revise directive for cache #477
- Sort `appreciatedBy` and `appreciations` by `desc` #483
- Transfer MAT to pending LIKE #484
- Update LikeCoin APIs #488
- Remove unused appreciation related fields #489
- Alter `transaction_delta_view`; Filter transaction type to transfer LIKE #494
- Filter out users that MAT <= 0 #496
- Allow admin to change special display name (e.g. Matty) #498
- Disable injecting cache control into http header #501

## [1.10.0] - 2019-09-02

### Changed

- Update `userRegister` mutation to support custom userName #440
- Update userName validate rule #440
- Change asset's structure of path and name #443
- Update user state in search #446
- Fix response not showing archived comments #445

## [1.9.0] - 2019-08-23

### Added

- Sticky article #410 #416
- Cache Control #418 #420 #423 #437

### Changed

- Fix publish #419
- Reopen articleCount field and move totalWordCount into UserStatus . #425
- Add `oss.comments` query and `updateCommentState` mutation #432
- Re-add removeOnComplete option for queue service. #436
- Refactoring the business logics of "putComment" related notices #431

## [1.8.1] - 2019-08-07

### Changed

- Alter fields of OAuth tables to text array #411
- Fix user migration and word count #412
- Fix word count #413

## [1.8.0] - 2019-08-06

### Added

- PoC of OAuth login with LikeCoin #387 #394

### Changed

- Alter API for profile #398
- Fix notice issues #399 #403
- Update user search #400
- Update fuzziness to AUTO as suggested in documentation #402
- Add multiple redirectUris support for OAuth Server #407

## [1.7.0] - 2019-07-29

### Changed

- Add API for total written word counts. #396
- Add migration for correcting word count. #395
- Block specific users. #390
- OAuth Server #386
- Add rate-limiting to matters-server #384
- Make author info as link with utm parameter for IPFS file #378 #379
- API docs #377 #380
- Remove `Official.gatewayUrls` #376

## [1.6.0] - 2019-07-02

### Changed

- Update the logic of notification distribution #366
- Add documentation for Article related APIs #367
- Resource Limitations #368
- Alter preview/preheader text of daily summary email #369
- User doc & handle null req #370
- Admin can also access user's inactive articles #371
- Enhance search user accuracy #372

## [1.5.0] - 2019-06-24

### Changed

- Alter article activity view definition based on collection metrics #362
- Fix dups first post reward issue #361
- Change collection management in backend #360
- Reduce interval of refreshing view for hottest recommendation #359
- Fix response count and query result contains archived articles #358
- Fix user unable to register if the submitted email has uppercase character #357

## [1.4.0] - 2019-05-14

### Added

- Activation by comment #316
- Add asset map handler #317
- Add "embedaudio" asset type #321
- Notice dot for "Follow" tab #328

### Changed

- Alter Draft query and mutation for returning assets #318
- Increase upload file size to 100MB for audio #319
- Simplify publishing procedure #320
- Audio and iframe support for IPFS #322
- change "文章" to "作品" #323
- Fix activation transaction #324
- Set default cover when saving Draft #325
- Update password rule #326
- Fix unable to clear collection #327
- Fix unable to extend article #329
- Fix cover & asset #330
- Enable collection for all #331

## [1.3.1] - 2019-04-30

### Added

- Add collection notice #312

## [1.3.0] - 2019-04-27

### Added

- Sentry bug tracker #305 #307 #309

### Changed

- Add "sort" support to "oss.tags" query #306
- Add "email_reset_confirm" code type #308

## [1.2.0] - 2019-04-25

### Added

- Allow partner to edit collections #300

### Changed

- ElasticSearch optimization #285
- Remove comment mentioned user table and related scripts #293
- Fix empty string, false and 0 are deleted #296
- Fix content-encoding of S3 images #302

## [1.1.0] - 2019-04-20

### Added

- Collection APIs #283 #286 #287 #289
- Mention notification after publishing #288
- Migration script for producing collection data #273

### Changed

- Make all article public & search tags with ES #284
- Fix create duplicate notice #292
- Skip check email for "email_reset" type in sendVerificationCode mutation #291

## [1.0.5] - 2019-04-09

### Added

- Compress and resize images #267 #274
- DB: Create `collection` table #269
- DB: Alter `draft` schema for `collection` #269

### Changed

- DB: Alter schema for matters today #265
- Re-use uuid in asset key #268
- Fix upload file extension name #270
- Update upload limit to 5MB #271

## [1.0.4] - 2019-04-02

### Added

- Added an API for updating matters today #257

### Changed

- Add url support for singleFileUpload, used when user refer to external images #259
- Add "data-", "class" and iframe to XSS Whitelist #258
- Define S3 bucket using env variables #258

## [1.0.3] - 2019-03-28

### Added

- Monitor EB memory usage in CloudWatch

# [1.0.2] - 2019-03-25

### Changed

- Skip ES recommendation engine until it recovers #244
- Use recent readAt for read history #244
- Replace line break with space in summary #244
- Add iframe into xss white list #242
- Fix subscription `nodeEdited`

## [1.0.1] - 2019-03-21

### Added

- `User.status.role` #230
- Invitation related notices #234

### Changed

- Make state of newly registered user as onboarding #229 #237
- Fix email reseting content has no user data #232
- Fix duplication issue in tags, authors and hottest articles #233
- Fix bug with word count #233
- Prioritize viewer language setting over header #233
- Optimize summary generation #233
- Strip html tag and redundant spaces in content #235
- Check permission if viewer request to edit comment #238
