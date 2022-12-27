import { loadSnapshotSettingsById } from "../../config/graphql"
import { thirdpartyApi } from "../../config/urls"
import { snapshotDataToForm } from "../../core/dao/settingsFormatParser"

export const syncSnapshotData = async (id) => {
    return fetch(thirdpartyApi.snapshot_api_graphql, {
        method: 'POST',
        body: JSON.stringify(loadSnapshotSettingsById(id)),
        headers: {
            'content-type': "application/json"
        }
    }).then(r => r.json()).then(r => {
        if (!r.data?.spaces.length) {
            throw new Error("Please provide the correct link")
            // window.alert()
            return
        }

        let { basicFormData, consensusForm, votingForm } = snapshotDataToForm(r.data.spaces[0])
        return { basicFormData, consensusForm, votingForm }
    })
}