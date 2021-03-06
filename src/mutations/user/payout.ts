import { compare } from 'bcrypt'
import { v4 } from 'uuid'

import {
  PAYMENT_CURRENCY,
  PAYMENT_MAXIMUM_AMOUNT,
  PAYMENT_PAYOUT_MINIMUM_AMOUNT,
  PAYMENT_PROVIDER,
  TRANSACTION_PURPOSE,
} from 'common/enums'
import {
  AuthenticationError,
  EntityNotFoundError,
  ForbiddenError,
  PasswordInvalidError,
  PaymentBalanceInsufficientError,
  PaymentPasswordNotSetError,
  PaymentPayoutTransactionExistsError,
  PaymentReachMaximumLimitError,
  UserInputError,
} from 'common/errors'
import { calcMattersFee } from 'common/utils'
import { payoutQueue } from 'connectors/queue'
import { MutationToPayoutResolver } from 'definitions'

const resolver: MutationToPayoutResolver = async (
  parent,
  { input: { amount, password } },
  { viewer, dataSources: { paymentService } }
) => {
  if (!viewer.id) {
    throw new AuthenticationError('visitor has no permission')
  }

  if (!amount || typeof amount !== 'number' || amount <= 0) {
    throw new UserInputError('amount is incorrect')
  }

  if (amount < PAYMENT_PAYOUT_MINIMUM_AMOUNT.HKD) {
    throw new UserInputError('amount below minimum limit')
  }

  if (!viewer.paymentPasswordHash) {
    throw new PaymentPasswordNotSetError('viewer payment password has not set')
  }

  const verified = await compare(password, viewer.paymentPasswordHash)
  if (!verified) {
    throw new PasswordInvalidError('password is incorrect, payment failed.')
  }

  const [balance, pending, customer] = await Promise.all([
    paymentService.calculateHKDBalance({
      userId: viewer.id,
    }),
    paymentService.countPendingPayouts({ userId: viewer.id }),
    paymentService.findPayoutAccount({ userId: viewer.id }),
  ])

  if (pending > 0) {
    throw new PaymentPayoutTransactionExistsError(
      'viewer already has ongoing payouts'
    )
  }

  if (amount > balance) {
    throw new PaymentBalanceInsufficientError('viewer has insufficient balance')
  }

  const recipient = customer[0]
  if (!recipient || !recipient.accountId) {
    throw new EntityNotFoundError(`payout recipient is not found`)
  }

  // insert pending tx
  const fee = calcMattersFee(amount)
  const transaction = await paymentService.createTransaction({
    amount,
    currency: PAYMENT_CURRENCY.HKD,
    fee,
    purpose: TRANSACTION_PURPOSE.payout,
    provider: PAYMENT_PROVIDER.stripe,
    providerTxId: v4(),
    senderId: viewer.id,
    targetType: undefined,
  })

  // insert queue job
  payoutQueue.payout({ txId: transaction.id })

  return transaction
}

export default resolver
