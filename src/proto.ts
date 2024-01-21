import * as github from '@actions/github'

async function listOpenIssues() {
  try {
    const octokit = github.getOctokit(
      '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'
    )
    const context = github.context

    const owner = 'rr404'
    const repo = 'governanceTest'

    const response = await octokit.issues.listForRepo({
      owner,
      repo,
      state: 'open',
      labels: 'provide more details'
    })

    const issues = response.data
    const ms = require('ms')
    const now = new Date()

    console.log('Open Issues:')
    issues.forEach(issue => {
      const updatedAt = new Date(issue.updated_at)
      const timeDifference = now.getTime() - updatedAt.getTime() // Difference in seconds
      const thresholdBeforeStale = ms('3m30s') / 1000 // threshold for stale in seconds

      console.log(`- ${issue.title}`)
      console.log(`- ${timeDifference} >? ${thresholdBeforeStale}`)
    })
  } catch (error) {
    console.error('Error listing open issues:', error.message)
  }
}

listOpenIssues()
