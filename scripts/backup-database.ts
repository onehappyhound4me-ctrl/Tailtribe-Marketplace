/**
 * Automated Database Backup Script
 * 
 * Run this daily via cron job or GitHub Actions
 * 
 * Usage:
 * npx tsx scripts/backup-database.ts
 */

import { exec } from 'child_process'
import { promisify } from 'util'
import * as fs from 'fs/promises'
import * as path from 'path'

const execAsync = promisify(exec)

const DATABASE_URL = process.env.DATABASE_URL || ''
const BACKUP_DIR = process.env.BACKUP_DIR || './backups'
const KEEP_DAYS = parseInt(process.env.BACKUP_KEEP_DAYS || '30')

async function createBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0]
  const backupFile = path.join(BACKUP_DIR, `tailtribe-backup-${timestamp}.sql`)

  console.log('🔄 Starting database backup...')
  console.log(`Backup file: ${backupFile}`)

  try {
    // Ensure backup directory exists
    await fs.mkdir(BACKUP_DIR, { recursive: true })

    // Determine database type
    if (DATABASE_URL.startsWith('postgresql')) {
      // PostgreSQL backup
      console.log('📊 Backing up PostgreSQL database...')
      
      await execAsync(`pg_dump "${DATABASE_URL}" > "${backupFile}"`)
      
      console.log('✅ PostgreSQL backup complete!')
      
    } else if (DATABASE_URL.startsWith('file:')) {
      // SQLite backup (for development)
      console.log('📊 Backing up SQLite database...')
      
      const dbPath = DATABASE_URL.replace('file:', '').replace('./', '')
      const dbFullPath = path.join(process.cwd(), 'prisma', dbPath)
      
      await fs.copyFile(dbFullPath, backupFile.replace('.sql', '.db'))
      
      console.log('✅ SQLite backup complete!')
      
    } else {
      throw new Error('Unsupported database type')
    }

    // Get backup file size
    const stats = await fs.stat(backupFile)
    const sizeMB = (stats.size / 1024 / 1024).toFixed(2)
    console.log(`📦 Backup size: ${sizeMB} MB`)

    // Cleanup old backups
    await cleanupOldBackups()

    return {
      success: true,
      file: backupFile,
      size: sizeMB,
      timestamp: new Date()
    }

  } catch (error: any) {
    console.error('❌ Backup failed:', error.message)
    
    // Send alert email (implement with Resend)
    // await sendBackupFailureEmail(error.message)
    
    return {
      success: false,
      error: error.message,
      timestamp: new Date()
    }
  }
}

async function cleanupOldBackups() {
  console.log(`\n🧹 Cleaning up backups older than ${KEEP_DAYS} days...`)

  try {
    const files = await fs.readdir(BACKUP_DIR)
    const now = Date.now()
    const maxAge = KEEP_DAYS * 24 * 60 * 60 * 1000

    let deletedCount = 0

    for (const file of files) {
      if (!file.startsWith('tailtribe-backup-')) continue

      const filePath = path.join(BACKUP_DIR, file)
      const stats = await fs.stat(filePath)
      const age = now - stats.mtimeMs

      if (age > maxAge) {
        await fs.unlink(filePath)
        console.log(`  🗑️  Deleted: ${file}`)
        deletedCount++
      }
    }

    if (deletedCount === 0) {
      console.log('  ✅ No old backups to delete')
    } else {
      console.log(`  ✅ Deleted ${deletedCount} old backup(s)`)
    }

  } catch (error: any) {
    console.error('⚠️  Cleanup warning:', error.message)
  }
}

async function listBackups() {
  try {
    const files = await fs.readdir(BACKUP_DIR)
    const backups = files.filter(f => f.startsWith('tailtribe-backup-'))

    console.log(`\n📋 Available backups (${backups.length}):`)
    
    for (const file of backups.slice(0, 10)) {
      const filePath = path.join(BACKUP_DIR, file)
      const stats = await fs.stat(filePath)
      const sizeMB = (stats.size / 1024 / 1024).toFixed(2)
      const date = new Date(stats.mtime).toLocaleString('nl-NL')
      
      console.log(`  📁 ${file} (${sizeMB} MB) - ${date}`)
    }
  } catch (error: any) {
    console.log('  No backups found')
  }
}

async function restoreBackup(backupFile: string) {
  console.log(`\n🔄 Restoring backup: ${backupFile}`)

  try {
    if (DATABASE_URL.startsWith('postgresql')) {
      // PostgreSQL restore
      await execAsync(`psql "${DATABASE_URL}" < "${backupFile}"`)
      console.log('✅ Restore complete!')
      
    } else if (DATABASE_URL.startsWith('file:')) {
      // SQLite restore
      const dbPath = DATABASE_URL.replace('file:', '').replace('./', '')
      const dbFullPath = path.join(process.cwd(), 'prisma', dbPath)
      
      await fs.copyFile(backupFile, dbFullPath)
      console.log('✅ Restore complete!')
      
    }
  } catch (error: any) {
    console.error('❌ Restore failed:', error.message)
  }
}

// Main execution
const command = process.argv[2]

if (command === 'restore') {
  const backupFile = process.argv[3]
  if (!backupFile) {
    console.error('Usage: npm run backup:restore <backup-file>')
    process.exit(1)
  }
  restoreBackup(backupFile)
} else if (command === 'list') {
  listBackups()
} else {
  // Default: create backup
  createBackup().then(result => {
    if (result.success) {
      console.log('\n✅ Backup completed successfully!')
      listBackups()
      process.exit(0)
    } else {
      console.error('\n❌ Backup failed!')
      process.exit(1)
    }
  })
}





