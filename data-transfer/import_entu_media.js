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
        { name: 'photo-medium', suffix: ' 350x350', strapi_name: 'gallery_image_medium'}
    ],
    performance: [
        { name: 'photo-original', suffix: '', strapi_name: 'original_image' },
        { name: 'photo-gallery', suffix: '', strapi_name: 'gallery_image_large' },
        { name: 'photo-big', suffix: '', strapi_name: 'hero_image' },
        { name: 'photo-medium', suffix: ' 350x350', strapi_name: 'gallery_image_medium' }
    ],
    // event: [
    //     { name: 'photo-original', suffix: '', strapi_name: 'original_image' },
    //     { name: 'photo-gallery', suffix: '', strapi_name: 'gallery_image_large' },
    //     { name: 'photo-big', suffix: '', strapi_name: 'hero_image' },
    //     { name: 'photo-medium', suffix: ' 350x350', strapi_name: 'gallery_image_medium' }
    // ]
}
const definitionmap = {
    echo: 'articles',
    performance: 'performances',
    // event: 'event'
}

const entu_file_url_template = 'https://saal.entu.ee/api2/file-${entu_file_id}'


const main = async () => {
    for (const edef in mediamap) {
        console.log({'I': 'fetching', edef})

        const data = await entulib.getEntities(edef, 16000, 1, APP_ENTU_OPTIONS)
        console.log({'I': 'mapping', edef})
        const entities = map_pictures(edef, data)
        console.log({'I': 'remapping', edef})
        remap_pictures(edef, entities)

        const entities_out = entities.filter(entity => {
            return entity.medias.length > 0
        })
        console.log({'I': 'done', edef})
        const picsdataFilePath =  path.join(dataDirPath, edef + '.pics.json')
        fs.writeFileSync(picsdataFilePath, JSON.stringify(entities_out, null, 5), 'utf8')

        // transport_pics(entities)
    }
}


const map_pictures = (edef, data) => {
    const entities = data.entities.map(e => {
        const return_obj = { definition: edef, entu_id: e.get('id')}
        for (const property of mediamap[edef]) {
            return_obj[property.strapi_name] = e.get(['properties', property.name, 'values'], [])
                                            .map(val => ({value: val.value, db_value: val.db_value}))
        }
        return return_obj
    })
    return entities
}

const remap_pictures = (edef, entities) => {
    for (const entity of entities) {
        entity.medias = []
        for (const original of entity['original_image']) {
            const original_pic_name = path.basename(original.value, path.extname(original.value))
            const one_media = {'original_image': original}

            // Komplekteerin originaalfotoga samanimelised meediafailid entity.medias sisse
            for (const property of mediamap[edef]) {
                if (property.strapi_name === 'original_image') {
                    continue
                }
                //
                for (var i = 0; i < entity[property.strapi_name].length; i++) {
                    const one_pic = entity[property.strapi_name][i]
                    if (path.basename(one_pic.value, path.extname(one_pic.value)) === original_pic_name + property.suffix) {
                        one_media[property.strapi_name] = one_pic
                        entity[property.strapi_name].splice(i, 1)
                        break
                    }
                }
            }
            entity.medias.push(one_media)
        }

        // Tõstan ülejäänud meediafailid ükshaaval entity.medias sisse
        for (const property of mediamap[edef]) {
            if (property.strapi_name === 'original_image') {
                continue
            }
            for (const one_pic of entity[property.strapi_name]) {
                const single_pic = {}
                single_pic[property.strapi_name] = one_pic
                entity.medias.push(single_pic)
            }
            delete(entity[property.strapi_name])
        }

        // Eemaldan viimase liigse
        delete(entity['original_image'])
    }

}


main()
