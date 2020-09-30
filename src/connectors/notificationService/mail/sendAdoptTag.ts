import { EMAIL_TEMPLATE_ID } from 'common/enums'
import { environment } from 'common/environment'
import { notificationQueue } from 'connectors/queue/notification'
import { LANGUAGES } from 'definitions'

import { trans } from './utils'

export const sendAdoptTag = async ({
  to,
  language = 'zh_hant',
  recipient,
  tag,
}: {
  to: string
  language?: LANGUAGES
  recipient: {
    displayName: string
    userName: string
  }
  tag: {
    content: string
  }
}) => {
  const templateId = EMAIL_TEMPLATE_ID.adoptTag[language]
  notificationQueue.sendMail({
    from: environment.emailFromAsk as string,
    templateId,
    personalizations: [
      {
        to,
        // @ts-ignore
        dynamic_template_data: {
          subject: trans.tag.adoptTag(language, {
            displayName: recipient.displayName,
            content: tag.content,
          }),
          siteDomain: environment.siteDomain,
          recipient,
          tag,
        },
      },
    ],
  })
}
