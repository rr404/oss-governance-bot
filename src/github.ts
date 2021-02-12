import * as github from '@actions/github'
import * as core from '@actions/core'
import {GitHub} from '@actions/github/lib/utils'

export function initClient(): InstanceType<typeof GitHub> {
  const token = core.getInput('github-token')
  return github.getOctokit(token)
}

function getNumber(): number | undefined {
  return (
    github.context.payload.pull_request?.number ||
    github.context.payload.issue?.number
  )
}

export function getLabels(): string[] {
  const contents =
    github.context.payload.pull_request || github.context.payload.issue
  return contents?.labels?.map(({name}: {name: string}) => name) || []
}

export async function addLabels(labels: string[]): Promise<void> {
  if (!labels.length) return

  const client = initClient()

  await client.issues.addLabels({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    issue_number: getNumber()!,
    labels: labels
  })
}

export async function removeLabels(labels: string[]): Promise<void> {
  if (!labels.length) return

  const client = initClient()

  await Promise.all(
    labels.map(name =>
      client.issues.removeLabel({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        issue_number: getNumber()!,
        name: name
      })
    )
  )
}

/**
 * Comment to post with added details.
 *
 * @param body comment
 */
export async function postComment(body: string) {
  const client = initClient()

  body = body.replace('$AUTHOR', github.context.payload.sender?.login)
  body += getDetails()

  await client.issues.createComment({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    issue_number: getNumber()!,
    body: body
  })
}

/**
 * Comment details.
 */
function getDetails(): string {
  const repository = github.context.payload.repository

  const configPath = core.getInput('config-path', {required: true})
  const repoUrl = repository?.html_url
  const ownerUrl = repository?.owner.html_url
  const organisation = repository?.owner.login

  let details = ''
  details += '\n'
  details += '<details><summary>Details</summary>'
  details += '\n'
  details += `I am a bot created to help the [${organisation}](${ownerUrl}) developers manage community feedback and contributions.`
  details += ' '
  details += `You can check out my [manifest file](${repoUrl}/blob/master/${configPath}) to understand my behavior and what I can do.`
  details += ' '
  details +=
    'If you want to use this for your project, you can check out the [fuxingloh/oss-governance](https://github.com/fuxingloh/oss-governance) repository.'
  details += '\n'
  details += '</details>'
  return details
}