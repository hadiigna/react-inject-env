import replace from 'replace-in-file'
import shell from 'shelljs'
import { Cfg } from '../app/Config'
import { retrieveDotEnvCfg, retrieveReactEnvCfg } from './Utils'
import { writeFileSync } from 'fs'
import crypto from 'crypto';

function generateFromTo(envCfg: Record<string, string>): {
  from: string[] | RegExp[]
  to: string[]
} {
  const from = Object.keys(envCfg)
    .map((key) => `${Cfg.PLACEHOLDER_2}${key}`)
    .map((key) => new RegExp(`\\b${key}\\b`, 'g'))
  const to = Object.values(envCfg)
  return {
    from: from,
    to: to
  }
}

function getMd5ShortHash(contents: string): string {
  let hash = crypto.createHash('md5')
  hash.update(contents)
  const finalHash = hash.digest('hex')

  return finalHash.substring(0, 7);
}

function appendToFilename(filename: string, stringToAppend: string): string {
  const dotIndex = filename.lastIndexOf('.')
  if (dotIndex == -1) return filename + stringToAppend
  else return filename.substring(0, dotIndex) + stringToAppend + filename.substring(dotIndex)
}

export function copyFolder(dir: string, copyDir: string): string {
  shell.cp('-R', dir, copyDir)
  return copyDir
}

export function replaceFile(dirPath: string, envConfig: Record<string, string>) {
  const { from, to } = generateFromTo(envConfig)
  const results = replace.sync({
    files: `${dirPath}/**/*`,
    from: from,
    to: to,
    countMatches: true
  })
  results.forEach((it) => {
    if (it.hasChanged) {
      console.info(`Replaced ${it.numReplacements} variable(s) in '${it.file}'`)
    }
  })
}

export function replaceFilesInDir(dir: string) {
  const envCfg = { ...retrieveDotEnvCfg(), ...retrieveReactEnvCfg() }
  console.info('Injecting the following environment variables:')
  console.info(envCfg)
  replaceFile(dir, envCfg)
}

export function outputEnvFile(folder: string, fileName: string, envCfg: Record<string, string>, varName: string): string {
  shell.mkdir('-p', './build')
  console.info('Setting the following environment variables:')
  console.info(envCfg)
  let envJson = JSON.stringify(envCfg, null, 2)
  let hash = getMd5ShortHash(envJson)
  let hashedFileName = appendToFilename(fileName, `.${hash}.`)
  writeFileSync(`${folder}/${hashedFileName}`, `window.${varName} = ${envJson}`)

  // Return hashed filename
  return hashedFileName
}