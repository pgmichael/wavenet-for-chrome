import fs from 'fs'
import path from 'path'

export async function watchFilesInDir(dir, callback) {
  const files = await fs.promises.readdir(dir)

  for (const file of files) {
    const filePath = path.join(dir, file)
    const stats = await fs.promises.stat(filePath)

    // Only watch the file if it is not a directory
    if (stats.isFile()) {
      fs.watchFile(filePath, { interval: 100 }, (curr, prev) => callback(filePath))
    }

    // If it is a directory, we recursively watch files in it
    if (stats.isDirectory()) {
      await watchFilesInDir(filePath, callback)
    }
  }
}
