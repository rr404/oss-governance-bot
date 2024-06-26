import {Capture, ChatOps, Governance, Label} from '../config'
import {Commands} from '../command'
import {isAuthorAssociationAllowed} from '../rules/author-association'
import label from './label'
import capture from './capture'
import chatOpsClose from './chat-ops/close'
import chatOpsComment from './chat-ops/comment'
import chatOpsAssign from './chat-ops/assign'
import chatOpsReview from './chat-ops/review'
import chatOpsLabel from './chat-ops/label'
import autoAssignAnyFrom from './automations/assignAnyFrom'
import resetStale from './automations/resetStale'
import {isCreatedOpened} from '../rules/ignore'
import * as core from '@actions/core'
import * as github from '@actions/github'

async function processLabels(
  labels: Label[],
  commands: Commands
): Promise<void> {
  for (const labelOp of labels) {
    await label(labelOp, commands)
  }
}

async function processCaptures(captures: Capture[]): Promise<void> {
  if (!isCreatedOpened()) {
    return
  }

  for (const captureOp of captures) {
    if (isAuthorAssociationAllowed(captureOp.author_association)) {
      await capture(captureOp)
    }
  }
}

async function processChatOps(
  chatOps: ChatOps[],
  commands: Commands
): Promise<void> {
  if (!isCreatedOpened()) {
    return
  }

  for (const chatOp of chatOps) {
    if (!isAuthorAssociationAllowed(chatOp.author_association)) {
      continue
    }
    switch (chatOp.type) {
      case 'close':
        await chatOpsClose(chatOp, commands)
        break
      case 'assign':
        await chatOpsAssign(chatOp, commands)
        break
      case 'review':
        await chatOpsReview(chatOp, commands)
        break
      case 'comment':
        await chatOpsComment(chatOp, commands)
        break
      case 'label':
        await chatOpsLabel(chatOp, commands)
        break
    }
  }
}

async function processAutomations(governance: Governance) {
  // Auto Assign
  const possibleAssignees = governance.automations?.autoAssignAnyFrom ?? [
    '@'.concat(github.context.repo.owner)
  ]
  await autoAssignAnyFrom(possibleAssignees)
  await resetStale(governance)
}

export default async function (
  governance: Governance,
  commands: Commands
): Promise<any> {
  if (governance.automations) {
    core.info('operations: processAutomations')
    await processAutomations(governance)
  }

  if (governance.captures?.length) {
    core.info('operations: processing captures')
    await processCaptures(governance.captures)
  }

  if (governance.chat_ops?.length) {
    core.info('operations: processing chatops')
    await processChatOps(governance.chat_ops, commands)
  }

  if (governance.labels?.length) {
    core.info('operations: processing labels')
    await processLabels(governance.labels, commands)
  }
}
