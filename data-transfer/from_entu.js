const fs = require('fs')
const path = require('path')
const util = require('util')
const entulib = require('entulib')


const dataDirPath =  path.join(__dirname, 'from_entu')
fs.mkdirSync(dataDirPath, { recursive: true })


const APP_ENTU_OPTIONS = {
  entuUrl: 'https://saal.entu.ee',
  user: process.env.SAAL_ENTU_API_USER,
  key: process.env.SAAL_ENTU_API_KEY
}

const edefs = ['event' ]
const fromEntu = {}

for (const edef of edefs) {
    entulib.getEntities(edef, 10000, 1, APP_ENTU_OPTIONS)
    .then(data => {
        const rawjsonStr = JSON.stringify(data.entities.map(e=>e.get()), null, 5)
        const rawdataFilePath =  path.join(dataDirPath, edef + '.raw.json')
        fs.writeFileSync(rawdataFilePath, rawjsonStr, 'utf8')

        const entities = data.entities.map(d => parseEntuEntity(d.get()))

        const jsonStr = JSON.stringify(entities, null, 5)
        const dataFilePath =  path.join(dataDirPath, edef + '.json')
        fs.writeFileSync(dataFilePath, jsonStr, 'utf8')
    })
}

const parseEntuEntity = (entity_in => {
    parseEntuProperties(entity_in.properties)
    return {
        id: entity_in.id,
        displaypicture: entity_in.displaypicture,
        displayname: entity_in.displayname,
        properties: entity_in.properties
    }
})

const parseEntuProperties = (properties => {
    for (property_name in properties) {
        properties[property_name] = {
            datatype: properties[property_name].datatype,
            // keyname: properties[property_name].keyname,
            values: (properties[property_name].values || [])
                .map(v => ({value: v.value, db_value: v.db_value}))
        }
    }
})