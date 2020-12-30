const fs = require('fs')
const path = require('path')
const util = require('util')
const entulib = require('entulib')
const { spin } = require("../helpers/spinner")

const moment = require('moment-timezone')
console.log(moment('2020-11-21T19:30').tz('Europe/Tallinn').format());
console.log(moment('2020-10-21T19:30').tz('Europe/Tallinn').format());


const dataDirPath =  path.join(__dirname, 'from_entu')
fs.mkdirSync(dataDirPath, { recursive: true })


const APP_ENTU_OPTIONS = {
  entuUrl: 'https://saal.entu.ee',
  user: process.env.SAAL_ENTU_API_USER,
  key: process.env.SAAL_ENTU_API_KEY
}

// const edefs = ['folder', 'person']
const edefs = ['person', 'coverage', 'performance', 'event', 'folder']

const main = async () => {
    for (const edef of edefs) {
        console.log({edef, APP_ENTU_OPTIONS})
        spin.start()
        await entulib.getEntities(edef, 10000, 1, APP_ENTU_OPTIONS)
        .then(async data => {
            process.stdout.write(' childs\n')

            const entities = data.entities.map(d => parseEntuEntity(d.get()))
            for (const entity of entities) {
                await getEntuChilds(entity)
                process.stdout.write('.')
            }

            const jsonStr = JSON.stringify(entities, null, 5)
            const dataFilePath =  path.join(dataDirPath, edef + '.json')
            fs.writeFileSync(dataFilePath, jsonStr, 'utf8')
            spin.stop()
        })
    }
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
        const datatype = properties[property_name].datatype
        const values = (properties[property_name].values || [])
            .map(v => {
                if (datatype === 'datetime') {
                    return {
                        value: moment(v.value).tz('Europe/Tallinn').format(),
                        db_value: moment(v.db_value).tz('Europe/Tallinn').format()
                    }
                }
                return {
                    value: v.value,
                    db_value: v.db_value
                }
            })
        properties[property_name] = { datatype, values }
    }
})

const getEntuChilds = async (entity) => {
    const entu_childs = await entulib.getChilds(entity.id, false, APP_ENTU_OPTIONS)
    entity.childs = entu_childs.entities
        .map(d => d.get())
        .map(e => {
            return {
                id: e.id,
                definition_keyname: e.definition_keyname
            }
        })
}

main()