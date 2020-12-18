const fs = require('fs')
const yaml = require('js-yaml')
const path = require('path')
const util = require('util')
const entulib = require('entulib')

const fromEntuPath =  path.join(__dirname, 'from_entu')
fs.mkdirSync(fromEntuPath, { recursive: true })
const entu_kaustad_fn = path.join(__dirname, 'entu_kaustad.yaml')
const entu_kaustad_syndmused_fn = path.join(fromEntuPath, 'entu_kaustad_syndmused.yaml')

const APP_ENTU_OPTIONS = {
  entuUrl: 'https://saal.entu.ee',
  user: process.env.SAAL_ENTU_API_USER,
  key: process.env.SAAL_ENTU_API_KEY
}

const ENTU_KAUSTAD = yaml.safeLoad(fs.readFileSync(entu_kaustad_fn, 'utf8'))

for (const [kausta_nimi, entu_kaust] of Object.entries(ENTU_KAUSTAD)) {
    entu_kaust.syndmused = []
    for (const kaust_eid of entu_kaust.kaustad) {
        console.log({kausta_nimi, kaust_eid})

        entulib.getChilds(kaust_eid, false, APP_ENTU_OPTIONS)
        .then(data => {
            const rawjsonStr = JSON.stringify(data.entities.map(e=>e.get()), null, 5)
            const syndmused = data.entities.map(d => d.get().id)
            entu_kaust.syndmused = [].concat(entu_kaust.syndmused, syndmused)
            console.log({kausta_nimi, syndmused: entu_kaust.syndmused})
            fs.writeFileSync(entu_kaustad_syndmused_fn, yaml.safeDump(ENTU_KAUSTAD, { 'noRefs': true, 'indent': '4' }), 'utf8')
        })
    }

}

