import { boolean, jsonb, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import type { DeviceStatus } from '../../shared/sync-api'

export const posUser = pgTable('pos_user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  username: text('username').notNull(),
  passwordHash: text('password_hash').notNull(),
  active: boolean('active').notNull(),
  branchIds: jsonb('branch_ids').$type<string[]>().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).notNull()
})

export const syncCursor = pgTable('sync_cursor', {
  module: text('module').primaryKey(),
  cursor: text('cursor'),
  pulledAt: timestamp('pulled_at', { withTimezone: true, mode: 'string' }).notNull()
})

export const deviceLink = pgTable('device_link', {
  id: text('id').primaryKey(),
  deviceId: text('device_id').notNull(),
  deviceName: text('device_name'),
  deviceStatus: text('device_status').$type<DeviceStatus>().notNull(),
  branchId: text('branch_id').notNull(),
  branchName: text('branch_name').notNull(),
  branchAddress: text('branch_address'),
  branchActive: boolean('branch_active').notNull()
})
