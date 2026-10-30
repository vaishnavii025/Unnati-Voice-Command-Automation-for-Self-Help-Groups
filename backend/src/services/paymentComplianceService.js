const crypto = require('crypto')

function normalizeAmount(value) {
  const amount = Number(value)

  if (!Number.isFinite(amount) || amount < 0) {
    return 0
  }

  return Math.round(amount * 100) / 100
}

function validatePayment(payment = {}) {
  const amount = normalizeAmount(payment.amount)

  if (amount <= 0) {
    return {
      valid: false,
      message: 'Payment amount must be greater than 0',
    }
  }

  return {
    valid: true,
    amount,
    message: 'Payment is valid',
  }
}

function validateTransaction(transaction = {}) {
  const result = validatePayment(transaction)

  if (!result.valid) {
    return result
  }

  return {
    ...result,
    transactionId:
      transaction.transactionId ||
      transaction.referenceId ||
      crypto.randomUUID(),
  }
}

function createPaymentReference(prefix = 'PAY') {
  return `${prefix}-${Date.now()}-${crypto
    .randomBytes(4)
    .toString('hex')
    .toUpperCase()}`
}

function sanitizePaymentData(payment = {}) {
  return {
    amount: normalizeAmount(payment.amount),
    paymentMethod: payment.paymentMethod || 'cash',
    referenceId: payment.referenceId || null,
    transactionId: payment.transactionId || null,
    status: payment.status || 'pending',
    notes: payment.notes || '',
  }
}

module.exports = {
  normalizeAmount,
  validatePayment,
  validateTransaction,
  createPaymentReference,
  sanitizePaymentData,
}