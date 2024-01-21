import {Config} from '../config'
import {initClient, addLabels, postComment, patchIssue} from '../github'
import {LABEL_STALE} from '../constants'
import * as core from '@actions/core'
import * as github from '@actions/github'

const ACTION_STALE: string = 'stale'
const ACTION_CLOSE: string = 'close'

async function autoStaleAndClose(config: Config) {
  core.info('Starting autoStaleAndClose')
  const client = initClient()

  if (
    config.issue?.automations?.autoStale ||
    config.issue?.automations?.autoClose
  ) {
    core.info(' > Handling issue')
    client.issues
      .listForRepo({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        state: 'open',
        labels: 'provide more details, stale'
      })
      // eslint-disable-next-line github/no-then
      .then(async response => {
        const issues = response.data
        const ms = require('ms')
        const now = new Date()
        const actionsForIssues: Record<number, string> = {}

        // eslint-disable-next-line github/array-foreach
        issues.forEach(issue => {
          core.debug(`- ${issue.title}`)
          const issueUpdatedAt = new Date(issue.updated_at)
          const issueInactivityPeriod = now.getTime() - issueUpdatedAt.getTime() // Difference in seconds

          if (config.issue?.automations?.autoStale) {
            const autoStaleActions = config.issue.automations.autoStale
            const labelsForClose = autoStaleActions.fromTag.split(',')
            const hasTagOnIssue = issue.labels?.some(
              label => labelsForClose.indexOf(label?.name) !== -1
            )
            if (hasTagOnIssue) {
              const thresholdBeforeStale = ms(autoStaleActions.delay) / 1000 // threshold for stale in seconds
              if (issueInactivityPeriod > thresholdBeforeStale) {
                actionsForIssues[issue.number] = ACTION_STALE
              }
            }
          }

          if (config.issue?.automations?.autoClose) {
            const autoCloseActions = config.issue.automations.autoClose
            const labelsForClose = autoCloseActions.fromTag.split(',')
            const hasTagOnIssue = issue.labels?.some(
              label => labelsForClose.indexOf(label?.name) !== -1
            )
            if (hasTagOnIssue) {
              const thresholdBeforeStale = ms(autoCloseActions.delay) / 1000 // threshold for stale in seconds
              if (issueInactivityPeriod > thresholdBeforeStale) {
                actionsForIssues[issue.number] = ACTION_CLOSE
              }
            }
          }

          for (const [issueNumber, action] of Object.entries(
            actionsForIssues
          )) {
            switch (action) {
              case ACTION_CLOSE:
                performIssueClose(parseInt(issueNumber))
                break

              case ACTION_STALE:
                performIssueStale(parseInt(issueNumber))
                break
            }
          }
        })

        return true
      })
      // eslint-disable-next-line github/no-then
      .catch(error => {
        core.error(error)
        core.setFailed(error)
      })
  }
}

async function performIssueStale(issueNumber: number) {
  await postComment(
    "@AUTHOR: This issue has been tagged 'stale', you might need to perform an action to make the issue go forward."
  )
  await addLabels([LABEL_STALE], issueNumber)
}

async function performIssueClose(issueNumber: number) {
  await postComment(
    '@AUTHOR: This issue will be closed as it has been stale for a while'
  )
  await patchIssue({state: 'closed'}, issueNumber)
}

export default async function (config: Config): Promise<any> {
  await autoStaleAndClose(config)
}
