import {Config} from '../config'
import {initClient, addLabels, postComment, patchIssue} from '../github'
import {LABEL_STALE} from '../constants'
import * as core from '@actions/core'

const ACTION_STALE: string = 'stale'
const ACTION_CLOSE: string = 'close'

async function autoStaleAndClose(config: Config) {
  core.info('Starting autoStaleAndClose')
  const client = initClient()
  const ms = require('ms')
  const now = new Date()
  const actionsForIssues: Record<number, string> = {}

  if (config.issue?.automations?.autoStale) {
    core.info(' > Checking for Stale issues')
    const autoStaleActions = config.issue.automations.autoStale
    const thresholdBeforeStale = ms(autoStaleActions.delay) / 1000 // threshold for stale in seconds
    core.debug(`- thresholdBeforeStale ${thresholdBeforeStale}s`)

    //LF stale
    let issuesListResponse = await client.issues.listForRepo({
      owner: 'rr404',
      repo: 'governanceTest',
      state: 'open',
      labels: `provide more details` //retrieve from config
    })
    let issuesList = issuesListResponse.data
    // eslint-disable-next-line github/array-foreach
    issuesList.forEach(issue => {
      const issueUpdatedAt = new Date(issue.updated_at)
      const issueInactivityPeriod = now.getTime() - issueUpdatedAt.getTime() // Difference in seconds
      core.debug(`- ${issue.title} inactive for ${issueInactivityPeriod}s`)
      if (issueInactivityPeriod > thresholdBeforeStale) {
        actionsForIssues[issue.number] = ACTION_STALE
      }
    })

    //LF close
    issuesListResponse = await client.issues.listForRepo({
      owner: 'rr404',
      repo: 'governanceTest',
      state: 'open',
      labels: `stale` //retrieve from config
    })
    issuesList = issuesListResponse.data

    // eslint-disable-next-line github/array-foreach
    issuesList.forEach(issue => {
      const issueUpdatedAt = new Date(issue.updated_at)
      const issueInactivityPeriod = now.getTime() - issueUpdatedAt.getTime() // Difference in seconds
      core.debug(`- ${issue.title} inactive for ${issueInactivityPeriod}s`)
      if (issueInactivityPeriod > thresholdBeforeStale) {
        actionsForIssues[issue.number] = ACTION_CLOSE
      }
    })

    for (const [issueNumber, action] of Object.entries(actionsForIssues)) {
      switch (action) {
        case ACTION_CLOSE:
          performIssueClose(parseInt(issueNumber))
          break

        case ACTION_STALE:
          performIssueStale(parseInt(issueNumber))
          break
      }
    }
  }
}

async function performIssueStale(issueNumber: number) {
  await postComment(
    "@AUTHOR: This issue has been tagged 'stale', you might need to perform an action to make the issue go forward.",
    issueNumber
  )
  await addLabels([LABEL_STALE], issueNumber)
}

async function performIssueClose(issueNumber: number) {
  await postComment(
    '@AUTHOR: This issue will be closed as it has been stale for a while',
    issueNumber
  )
  await patchIssue({state: 'closed'}, issueNumber)
}

export default async function (config: Config): Promise<any> {
  await autoStaleAndClose(config)
}
