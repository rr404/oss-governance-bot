import * as github from '@actions/github'
import * as core from '@actions/core'
import {Config, getConfig} from './config'
import {initClient} from './github'

export async function getGovernanceConfig(): Promise<Config> {
  const configPath = core.getInput('config-path', {required: true})
  const config: Config = await getConfig(initClient(), configPath)

  return config
}

export function eventIs(eventName: string, actions?: string[]): boolean {
  return (
    github.context.eventName === eventName &&
    (!actions || actions.includes(github.context.payload.action!))
  )
}
