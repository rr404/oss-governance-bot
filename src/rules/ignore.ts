import * as github from '@actions/github'
import * as core from '@actions/core'
import {getBotUserId} from '../github'

function is(eventName: string, actions: string[]): boolean {
  return (
    github.context.eventName === eventName &&
    actions.includes(github.context.payload.action!)
  )
}

/**
 * Ignore labeled race condition where it get created before needs labels.
 * Not sure what is a better way to do this.
 */
function ignoreLabeledRaceCondition(): boolean {
  const payload = github.context.payload

  if (
    payload.sender?.type !== 'User' &&
    github.context.payload.action === 'labeled'
  ) {
    return false
  }

  if (is('issues', ['labeled'])) {
    return (
      Date.parse(payload.issue?.created_at) + 5000 >=
      Date.parse(payload.issue?.updated_at)
    )
  }

  if (is('pull_request', ['labeled'])) {
    return (
      Date.parse(payload.pull_request?.created_at) + 5000 >=
      Date.parse(payload.pull_request?.updated_at)
    )
  }

  if (is('pull_request_target', ['labeled'])) {
    return (
      Date.parse(payload.pull_request?.created_at) + 5000 >=
      Date.parse(payload.pull_request?.updated_at)
    )
  }

  return false
}

function isDependabot(): boolean {
  const payload = github.context.payload
  return payload.sender?.login === 'dependabot[bot]'
}

/**
 * Ignore non 'User' to prevent infinite loop.
 */
function ignoreBot(): boolean {
  const payload = github.context.payload
  core.info(
    `ignore: ignore bot - type:${payload.sender?.type} - login:${payload.sender?.login}`
  )
  if (isDependabot()) {
    return false
  }
  return payload.sender?.type !== 'User'
}

/**
 * Ignores if sender is self
 */
async function ignoreSelf(): Promise<boolean> {
  const payload = github.context.payload
  // allow fail because with 'github-token' > 'resource not accessible by integration'
  try {
    return payload.sender?.id === (await getBotUserId())
  } catch (e) {
    return false
  }
}

/**
 * Closed issue and pull_request should not trigger governance
 */
function ignoreClosed(): boolean {
  const payload = github.context.payload
  if (payload?.pull_request?.state === 'closed') {
    return true
  }

  if (payload?.issue?.state === 'closed') {
    return true
  }

  return false
}

/**
 * To prevent mistakes, this will ignore invalid workflow trigger
 */
export default async function (): Promise<boolean> {
  core.debug('ignore init context is: ')
  core.debug(JSON.stringify(github.context))

  if (github.context.eventName === 'schedule') {
    return false
  }

  if (ignoreClosed()) {
    core.info('ignore: closed')
    return true
  }

  if (isDependabot()) {
    if (is('pull_request', ['opened'])) {
      return true
    }
    if (is('pull_request_target', ['opened'])) {
      return true
    }
  }

  if (ignoreLabeledRaceCondition()) {
    core.info('ignore: labeled race condition')
    return true
  }

  if (await ignoreSelf()) {
    if (is('pull_request_target', ['synchronize', 'opened'])) {
      return false
    }
    core.info('ignore: ignore self')
    return true
  }

  if (is('issue_comment', ['created'])) {
    return ignoreBot()
  }

  if (is('pull_request', ['synchronize', 'opened'])) {
    return ignoreBot()
  }

  if (is('pull_request', ['labeled', 'unlabeled'])) {
    return false
  }

  if (is('pull_request_target', ['synchronize', 'opened'])) {
    return ignoreBot()
  }

  if (is('pull_request_target', ['labeled', 'unlabeled'])) {
    return false
  }

  if (is('issues', ['opened'])) {
    return ignoreBot()
  }

  if (is('issues', ['labeled', 'unlabeled'])) {
    return false
  }

  core.info('ignore: catch all')
  return true
}

export function isCreatedOpened(): boolean {
  if (is('issue_comment', ['created'])) {
    return true
  }

  if (is('pull_request', ['opened'])) {
    return true
  }

  if (is('pull_request_target', ['opened'])) {
    return true
  }

  if (is('issues', ['opened'])) {
    return true
  }

  return false
}
