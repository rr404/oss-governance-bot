import * as core from '@actions/core'
import * as github from '@actions/github'
import {Config, getConfig, Governance} from './config'
import ignore from './rules/ignore'
import command from './command'
import operations from './operators'
import schedules from './schedules'
import {initClient} from './github'

/**
 * @return the current governance config based on the context, it could be 'pull_request' or 'issue'.
 */
export async function getGovernance(): Promise<Governance | undefined> {
  const configPath = core.getInput('config-path', {required: true})
  core.debug(`    > configPath = ${configPath}`)
  const config: Config = await getConfig(initClient(), configPath)
  core.debug('Config is: ')
  core.debug(JSON.stringify(config))
  core.debug('Context is: ')
  core.debug(JSON.stringify(github.context))

  if (github.context.payload.comment) {
    if (github.context.payload.issue?.pull_request) {
      return config.pull_request
    }

    if (github.context.payload.issue) {
      return config.issue
    }
  }

  if (github.context.payload.issue) {
    return config.issue
  }

  if (github.context.payload.pull_request) {
    return config.pull_request
  }

  throw new Error('Could not get pull_request or issue from context')
}

/**
 * Get governance config, parse and run commands from context.
 */
export async function runGovernance(): Promise<void> {
  core.info('main: runGovernance Starts!')
  const governance = await getGovernance()
  core.debug('    > fetched governance from config')

  if (!governance) {
    core.debug('    > no governance found, exiting')
    return
  }

  core.info('main: parsing commands')
  const commands = await command()

  core.info('main: running operations')
  await operations(governance, commands)
  core.info('main: runGovernance Completed!')
}

/**
 * Get governance config, parse and run commands from context.
 */
export async function runSchedules(): Promise<void> {
  core.info('runSchedules Starts!')
  core.debug('    > getting config')
  const configPath = core.getInput('config-path', {required: true})
  core.debug(`    > configPath = ${configPath}`)
  const config: Config = await getConfig(initClient(), configPath)

  core.debug('    > running schedules')
  await schedules(config)
  core.info('runSchedules Completed!')
}

/* eslint github/no-then: off */
core.debug('Starting...')
core.debug('About to run ignore workflow')
ignore()
  .then(async toIgnore => {
    if (toIgnore) {
      core.debug('ignore was triggered. exiting...')
      return
    }

    if (github.context.eventName === 'schedule') {
      await runSchedules()
    } else {
      await runGovernance()
    }
  })
  .catch(error => {
    core.error(error)
    core.setFailed(error)
  })
