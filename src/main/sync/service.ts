import { app } from 'electron'
import { hostname } from 'node:os'
import {
  unlinkedStatus,
  type DeviceLinkView,
  type SyncErrorCode,
  type SyncFailure,
  type SyncPairResult,
  type SyncPullResult,
  type SyncStatusResult
} from '../../shared/sync-api'
import {
  pairResponseSchema,
  pullResponseSchema,
  type PairRequest,
  type PullRequest
} from './contracts'
import {
  assertEncryptionAvailable,
  clearDeviceToken,
  EncryptionUnavailableError,
  loadDeviceToken,
  saveDeviceToken
} from './device-token'
import { getDevice, postJson, type HttpResult } from './http'
import {
  applyPosUsersSnapshot,
  clearDeviceLink,
  linkRecordFromSummaries,
  readDeviceLink,
  readPosUsersCursor,
  saveDeviceLink,
  type DeviceLinkRecord
} from './store'

function failure(code: SyncErrorCode, message: string, status: DeviceLinkView): SyncFailure {
  return { ok: false, code, message, status }
}

function deviceMetadata() {
  return {
    platform: process.platform,
    hostname: hostname(),
    appVersion: app.getVersion()
  }
}

async function forgetLink(): Promise<DeviceLinkView> {
  clearDeviceToken()
  await clearDeviceLink()
  return unlinkedStatus
}

async function markBranchInactive(status: DeviceLinkView): Promise<DeviceLinkView> {
  if (!status.device || !status.branch) return status
  const record: DeviceLinkRecord = {
    deviceId: status.device.id,
    deviceName: status.device.name,
    deviceStatus: status.device.status,
    branchId: status.branch.id,
    branchName: status.branch.name,
    branchAddress: status.branch.address,
    branchActive: false
  }
  return saveDeviceLink(record)
}

async function settle(
  result: Extract<HttpResult<unknown>, { ok: false }>,
  current: DeviceLinkView
): Promise<SyncFailure> {
  if (result.code === 'UNAUTHORIZED' || result.code === 'DEVICE_REVOKED') {
    return failure(result.code, result.message, await forgetLink())
  }
  if (result.code === 'BRANCH_INACTIVE') {
    return failure(result.code, result.message, await markBranchInactive(current))
  }
  return failure(result.code, result.message, current)
}

async function readSession(): Promise<
  { ok: true; token: string | null; status: DeviceLinkView } | { ok: false; failure: SyncFailure }
> {
  try {
    const token = loadDeviceToken()
    if (!token) return { ok: true, token: null, status: unlinkedStatus }
    const stored = await readDeviceLink()
    return {
      ok: true,
      token,
      status: stored ?? { linked: true, device: null, branch: null }
    }
  } catch (error) {
    if (error instanceof EncryptionUnavailableError) {
      return {
        ok: false,
        failure: failure('ENCRYPTION_UNAVAILABLE', error.message, unlinkedStatus)
      }
    }
    throw error
  }
}

export async function getStatus(): Promise<SyncStatusResult> {
  const session = await readSession()
  if (!session.ok) return session.failure
  if (!session.token) return { ok: true, status: session.status }

  const remote = await getDevice(session.token)
  if (!remote.ok) return settle(remote, session.status)
  const status = await saveDeviceLink(
    linkRecordFromSummaries(remote.data.device, remote.data.branch)
  )
  return { ok: true, status }
}

export async function pair(pairingCode: unknown): Promise<SyncPairResult> {
  const session = await readSession()
  if (!session.ok) return session.failure

  if (typeof pairingCode !== 'string' || pairingCode.trim() === '') {
    return failure('VALIDATION_ERROR', 'Ingresa el código de vinculación.', session.status)
  }

  try {
    assertEncryptionAvailable()
  } catch (error) {
    if (error instanceof EncryptionUnavailableError) {
      return failure('ENCRYPTION_UNAVAILABLE', error.message, session.status)
    }
    throw error
  }

  const body: PairRequest = {
    pairingCode: pairingCode.trim().toUpperCase(),
    device: deviceMetadata()
  }
  const paired = await postJson('/pair', body, pairResponseSchema)
  if (!paired.ok) return settle(paired, session.status)

  try {
    saveDeviceToken(paired.data.deviceToken)
  } catch (error) {
    if (error instanceof EncryptionUnavailableError) {
      return failure('ENCRYPTION_UNAVAILABLE', error.message, session.status)
    }
    throw error
  }
  let status = await saveDeviceLink({
    deviceId: paired.data.deviceId,
    deviceName: null,
    deviceStatus: 'active',
    branchId: paired.data.branch.id,
    branchName: paired.data.branch.name,
    branchAddress: paired.data.branch.address,
    branchActive: paired.data.branch.active
  })

  const remote = await getDevice(paired.data.deviceToken)
  if (!remote.ok) {
    if (remote.code === 'UNAUTHORIZED' || remote.code === 'DEVICE_REVOKED') {
      return settle(remote, status)
    }
    return { ok: true, status }
  }

  status = await saveDeviceLink(linkRecordFromSummaries(remote.data.device, remote.data.branch))
  return { ok: true, status }
}

export async function pull(): Promise<SyncPullResult> {
  const session = await readSession()
  if (!session.ok) return session.failure
  if (!session.token) {
    return failure('NOT_LINKED', 'Este punto de venta no está vinculado.', unlinkedStatus)
  }

  const cursor = await readPosUsersCursor()
  const body: PullRequest = {
    cursors: cursor ? { posUsers: cursor } : undefined,
    device: deviceMetadata()
  }
  const remote = await postJson('/sync/pull', body, pullResponseSchema, session.token)
  if (!remote.ok) return settle(remote, session.status)

  // warehouse arrives in the same payload, is validated by the schema, and is not stored.
  const posUsers = remote.data.modules.posUsers
  const status = await applyPosUsersSnapshot({
    users: posUsers.data,
    cursor: posUsers.cursor,
    pulledAt: remote.data.serverTime,
    link: linkRecordFromSummaries(remote.data.device, remote.data.branch)
  })
  return {
    ok: true,
    userCount: posUsers.data.length,
    pulledAt: remote.data.serverTime,
    status
  }
}
