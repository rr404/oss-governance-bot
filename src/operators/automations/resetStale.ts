import {removeLabels} from '../../github'
import {Governance} from '../../config'
import {eventIs} from '../../utils'
import {LABEL_STALE} from '../../constants'

export default async function (governance: Governance): Promise<void> {
  // Unstale
  if (governance.automations?.autoStale?.resetOn) {
    for (const resetEventsActions of governance.automations.autoStale.resetOn) {
      const [event = '', action = undefined, _ = []] = resetEventsActions.split('/')
      if (eventIs(event, action ? [action] : undefined)) {
        removeLabels([LABEL_STALE])
        // ? other action ? notification ?
        break
      }
    }
  }
}
