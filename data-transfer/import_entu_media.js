const fs = require('fs')
const path = require('path')
const util = require('util')
const entulib = require('entulib')
const moment = require('moment-timezone')


const dataDirPath =  path.join(__dirname, 'from_entu')
fs.mkdirSync(dataDirPath, { recursive: true })


const APP_ENTU_OPTIONS = {
  entuUrl: 'https://saal.entu.ee',
  user: process.env.SAAL_ENTU_API_USER,
  key: process.env.SAAL_ENTU_API_KEY
}

const mediamap = {
    echo: [
        { name: 'photo-original', suffix: '', strapi_name: 'original_image' },
        { name: 'photo-big', suffix: ' 1400x', strapi_name: 'hero_image' },
        { name: 'photo-medium', suffix: ' 350x350', strapi_name: 'gallery_image '}
    ],
    performance: [
        { name: 'photo-original', suffix: '', strapi_name: 'original_image' },
        { name: 'photo-gallery', suffix: '', strapi_name: 'gallery_image' },
        { name: 'photo-big', suffix: '', strapi_name: 'hero_image' },
        { name: 'photo-medium', suffix: ' 350x350', strapi_name: 'gallery_large_image' }
    ]
}
const definitionmap = {
    echo: 'articles',
    performance: 'performances'
}

const entu_file_url_template = 'https://saal.entu.ee/api2/file-${entu_file_id}'


const main = async () => {
    for (const edef in mediamap) {
        console.log({'I': 'processing', edef})

        const data = await entulib.getEntities(edef, 15, 1, APP_ENTU_OPTIONS)
        const entities = map_pictures(edef, data)
        remap_pictures(edef, entities)

        console.log({'I': 'done', edef})
        const picsdataFilePath =  path.join(dataDirPath, edef + '.pics.json')
        fs.writeFileSync(picsdataFilePath, JSON.stringify(entities, null, 5), 'utf8')

        transport_pics(entities)
    }
}


const map_pictures = (edef, data) => {
    const entities = data.entities.map(e => {
        const return_obj = { definition: edef, entu_id: e.get('id')}
        for (const property of mediamap[edef]) {
            return_obj[property.name] = e.get(['properties', property.name, 'values'], [])
                                            .map(val => ({value: val.value, db_value: val.db_value}))
        }
        return return_obj
    })
    return entities
}

const remap_pictures = (edef, entities) => {
    for (const entity of entities) {
        entity.medias = []
        for (const original of entity['photo-original']) {
            const original_pic_name = path.basename(original.value, path.extname(original.value))
            const one_media = {'photo-original': original}

            // Komplekteerin originaalfotoga samanimelised meediafailid entity.medias sisse
            for (const property of mediamap[edef]) {
                if (property.name === 'photo-original') {
                    continue
                }
                //
                for (var i = 0; i < entity[property.name].length; i++) {
                    const one_pic = entity[property.name][i]
                    if (path.basename(one_pic.value, path.extname(one_pic.value)) === original_pic_name + property.suffix) {
                        one_media[property.name] = one_pic
                        entity[property.name].splice(i, 1)
                        break
                    }
                }
            }
            entity.medias.push(one_media)
        }

        // Tõstan ülejäänud meediafailid ükshaaval entity.medias sisse
        for (const property of mediamap[edef]) {
            if (property.name === 'photo-original') {
                continue
            }
            for (const one_pic of entity[property.name]) {
                const single_pic = {}
                single_pic[property.name] = one_pic
                entity.medias.push(single_pic)
            }
            delete(entity[property.name])
        }

        // Eemaldan viimase liigse
        delete(entity['photo-original'])
    }

}


main()
