export const DEVICE_STATUSES = ['pending', 'active', 'revoked'] as const

export type DeviceStatus = (typeof DEVICE_STATUSES)[number]

export interface DeviceLinkView {
  linked: boolean
  device: {
    id: string
    name: string | null
    status: DeviceStatus
  } | null
  branch: {
    id: string
    name: string
    address: string | null
    active: boolean
  } | null
}

export const unlinkedStatus: DeviceLinkView = {
  linked: false,
  device: null,
  branch: null
}

export type SyncErrorCode =
  | 'UNAUTHORIZED'
  | 'DEVICE_REVOKED'
  | 'BRANCH_INACTIVE'
  | 'INVALID_PAIRING_CODE'
  | 'VALIDATION_ERROR'
  | 'INTERNAL'
  | 'NETWORK'
  | 'INVALID_RESPONSE'
  | 'NOT_LINKED'
  | 'ENCRYPTION_UNAVAILABLE'

export interface SyncFailure {
  ok: false
  code: SyncErrorCode
  message: string
  status: DeviceLinkView
}

export interface SyncStatusSuccess {
  ok: true
  status: DeviceLinkView
}

export type SyncStatusResult = SyncStatusSuccess | SyncFailure

export interface SyncPairSuccess {
  ok: true
  status: DeviceLinkView
}

export type SyncPairResult = SyncPairSuccess | SyncFailure

export interface SyncPullSuccess {
  ok: true
  userCount: number
  pulledAt: string
  status: DeviceLinkView
}

export type SyncPullResult = SyncPullSuccess | SyncFailure

export interface SyncApi {
  getStatus: () => Promise<SyncStatusResult>
  pair: (pairingCode: string) => Promise<SyncPairResult>
  pull: () => Promise<SyncPullResult>
}
