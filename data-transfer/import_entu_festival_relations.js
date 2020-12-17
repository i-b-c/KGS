const fs = require('fs')
const path = require('path')
const util = require('util')
const entulib = require('entulib')
const yaml = require('js-yaml')
const moment = require('moment-timezone')


const dataDirPath =  path.join(__dirname, 'from_entu')
fs.mkdirSync(dataDirPath, { recursive: true })


const APP_ENTU_OPTIONS = {
  entuUrl: 'https://saal.entu.ee',
  user: process.env.SAAL_ENTU_API_USER,
  key: process.env.SAAL_ENTU_API_KEY
}

const festival_folder_eid = 1930
const edef = 'event'

const main = async () => {
    console.log({'I': 'processing', edef})

    const festival_eids = (await entulib.getChilds(festival_folder_eid, edef, APP_ENTU_OPTIONS)).entities
        .filter(e => e.get('properties.nopublish.values.0.db_value', 0) === 0)
        .map(e => e.get('id'))

    console.log({'I': 'done', festival_eids})

    const relationships = {}
     // festival_eids.map(eid => ({festival_eid: eid, event_ids: []}))

    for (const festival_eid of festival_eids) {
        relationships[festival_eid] = (await entulib.getChilds(festival_eid, edef, APP_ENTU_OPTIONS)).entities
        .filter(e => e.get('properties.nopublish.values.0.db_value', 0) === 0)
        .map(e => e.get('id'))
    }

    console.log({'I': 'done', relationships})
    const entu_festivalid_syndmused_fn = path.join(dataDirPath, 'entu_festivalid.yaml')
    fs.writeFileSync(entu_festivalid_syndmused_fn, yaml.safeDump(relationships, { 'noRefs': true, 'indent': '4' }), 'utf8')

}


main()
