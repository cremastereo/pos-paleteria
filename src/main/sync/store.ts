import { eq } from 'drizzle-orm'
import type { DeviceLinkView, DeviceStatus } from '../../shared/sync-api'
import { getDatabase } from '../db/client'
import { deviceLink, posUser, syncCursor } from '../db/schema'
import type { BranchSummary, DeviceSummary, PosUserPayload } from './contracts'

export const DEVICE_LINK_ID = 'current'
export const POS_USERS_MODULE = 'posUsers'

export interface DeviceLinkRecord {
  deviceId: string
  deviceName: string | null
  deviceStatus: DeviceStatus
  branchId: string
  branchName: string
  branchAddress: string | null
  branchActive: boolean
}

export function linkRecordFromSummaries(
  device: DeviceSummary,
  branch: BranchSummary
): DeviceLinkRecord {
  return {
    deviceId: device.id,
    deviceName: device.name,
    deviceStatus: device.status,
    branchId: branch.id,
    branchName: branch.name,
    branchAddress: branch.address,
    branchActive: branch.active
  }
}

function viewFromRecord(record: DeviceLinkRecord): DeviceLinkView {
  return {
    linked: true,
    device: {
      id: record.deviceId,
      name: record.deviceName,
      status: record.deviceStatus
    },
    branch: {
      id: record.branchId,
      name: record.branchName,
      address: record.branchAddress,
      active: record.branchActive
    }
  }
}

export async function readDeviceLink(): Promise<DeviceLinkView | null> {
  const rows = await getDatabase()
    .select()
    .from(deviceLink)
    .where(eq(deviceLink.id, DEVICE_LINK_ID))
    .limit(1)
  const row = rows[0]
  if (!row) return null
  return viewFromRecord({
    deviceId: row.deviceId,
    deviceName: row.deviceName,
    deviceStatus: row.deviceStatus,
    branchId: row.branchId,
    branchName: row.branchName,
    branchAddress: row.branchAddress,
    branchActive: row.branchActive
  })
}

export async function saveDeviceLink(record: DeviceLinkRecord): Promise<DeviceLinkView> {
  const values = { id: DEVICE_LINK_ID, ...record }
  await getDatabase().insert(deviceLink).values(values).onConflictDoUpdate({
    target: deviceLink.id,
    set: record
  })
  return viewFromRecord(record)
}

export async function clearDeviceLink() {
  await getDatabase().delete(deviceLink).where(eq(deviceLink.id, DEVICE_LINK_ID))
}

export async function readPosUsersCursor(): Promise<string | null> {
  const rows = await getDatabase()
    .select({ cursor: syncCursor.cursor })
    .from(syncCursor)
    .where(eq(syncCursor.module, POS_USERS_MODULE))
    .limit(1)
  const cursor = rows[0]?.cursor
  if (!cursor) return null
  return cursor
}

export async function applyPosUsersSnapshot(input: {
  users: PosUserPayload[]
  cursor: string | null
  pulledAt: string
  link: DeviceLinkRecord
}): Promise<DeviceLinkView> {
  const database = getDatabase()
  await database.transaction(async (tx) => {
    await tx.delete(posUser)
    if (input.users.length > 0) {
      await tx.insert(posUser).values(
        input.users.map((user) => ({
          id: user.id,
          name: user.name,
          username: user.username,
          passwordHash: user.passwordHash,
          active: user.active,
          branchIds: user.branchIds,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }))
      )
    }
    await tx
      .insert(syncCursor)
      .values({
        module: POS_USERS_MODULE,
        cursor: input.cursor,
        pulledAt: input.pulledAt
      })
      .onConflictDoUpdate({
        target: syncCursor.module,
        set: { cursor: input.cursor, pulledAt: input.pulledAt }
      })
    await tx
      .insert(deviceLink)
      .values({ id: DEVICE_LINK_ID, ...input.link })
      .onConflictDoUpdate({
        target: deviceLink.id,
        set: input.link
      })
  })
  return viewFromRecord(input.link)
}
