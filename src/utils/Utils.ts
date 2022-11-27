import { Cfg } from '../app/Config'

export function retrieveReactEnvCfg(prefix?: string): Record<string, string> {
  const env = process.env
  const keys = Object.keys(env)
  const reactKeys = keys.filter(key => {
    return key.startsWith(prefix ?? Cfg.PREFIX) || key === 'PUBLIC_URL'
  })

  const envCfg: Record<string, string> = {}
  for (const key of reactKeys) {
    // @ts-ignore
    envCfg[key] = process.env[key]
  }
  return envCfg
}

export function retrieveDotEnvCfg(prefix?: string): Record<string, string> {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const env = require('dotenv').config().parsed ?? {}

  const keys = Object.keys(env)
  const reactKeys = keys.filter(key => {
    return key.startsWith(prefix ?? Cfg.PREFIX) || key === 'PUBLIC_URL'
  })

  const envCfg: Record<string, string> = {}
  for (const key of reactKeys) {
    // @ts-ignore
    envCfg[key] = process.env[key]
  }
  return envCfg
}
