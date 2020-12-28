var fs = require('fs');
var request = require('request');
const {
    strapiAuth
} = require('./strapiAuth.js')

const path = require('path')
const yaml = require('js-yaml')

const {
    strapiQuery,
    putToStrapi,
    getFromStrapi
} = require("./strapiQueryMod.js")
const entuDataPath = path.join(__dirname, '..', 'data-transfer', 'from_entu')
const strapiDataPath = path.join(__dirname, '..', 'data-transfer', 'from_strapi')

const performances_from_strapi = yaml.safeLoad(fs.readFileSync(path.join(strapiDataPath, 'performances.yaml')))
const articles_from_strapi = yaml.safeLoad(fs.readFileSync(path.join(strapiDataPath, 'articles.yaml')))
const events_from_strapi = yaml.safeLoad(fs.readFileSync(path.join(strapiDataPath, 'events.yaml')))

// const dataJSON = path.join(entuDataPath, 'performance.pics.json')
// let performancePicsJSON = JSON.parse(fs.readFileSync(dataJSON, 'utf-8'))

// const dataJSON = path.join(entuDataPath, 'echo.pics.json')
// let echoPicsJSON = JSON.parse(fs.readFileSync(dataJSON, 'utf-8'))

const dataJSON = path.join(entuDataPath, 'event.pics.json')
let eventPicsJSON = JSON.parse(fs.readFileSync(dataJSON, 'utf-8'))

var TOKEN = ''


async function sendPic(media) {
    // console.log("sendPic Media ", media)

    const entuPicId = media.db_value
    const pic_name = media.value

    if (TOKEN === '') {
        TOKEN = await strapiAuth()
    }

    let options = {
        'method': 'POST',
        'url': 'https://a.saal.ee/upload',
        'headers': {
            'Authorization': `Bearer ${TOKEN}`
        },
        formData: {
            'files': {
                'value': request.get('https://saal.entu.ee/api2/file-' + entuPicId),
                'options': {
                    'filename': pic_name,
                    'contentType': null
                }
            }
        }
    };
     console.log('ENTU PIC ID ', entuPicId);
    function doRequest() {
        return new Promise(function(resolve, reject) {
            request(options, async function(error, response) {
                console.log(response.statusCode);
                if( response.statusCode === 413){
                    console.log('StatusCode:', response.statusCode, 'Request Entity Too Large')
                }
                if (error){
                    reject(error)
                } else {
                    resolve(response.body)
                }
            })
        })
    }

    async function GetId() {
        try {
            let res = await doRequest()
            // console.log('res = ', res);
            media.id = JSON.parse(res)[0].id
        } catch (error) {
            // console.log('Error: ', error);
        }

    }


    await GetId();

}

// PERFORMANCE_MEDIA

// const getStrapiIds = () => {
//     performancePicsJSON.map(performance_media => {
//         performance_media.id = (performances_from_strapi.filter(s_performance => {
//                 return s_performance.remote_id === performance_media.entu_id.toString()
//             })[0] || {}).id || null
//         return performance_media
//     })
// }

// async function send_pic_and_create_relation() {
//     getStrapiIds()
//     for (const performance_medias of performancePicsJSON) {
//         const strapi_id = performance_medias.id
//         performance_medias.performance_media = performance_medias.medias
//         delete performance_medias.medias
//         for (const media of performance_medias.performance_media) {
//             for ( let i = 0; i < Object.keys(media).length; i++){
//                 await sendPic(media[Object.keys(media)[i]]) // lisab meediale strapi id
//                 // console.log(media[Object.keys(media)[i]].id)
//                 if (media[Object.keys(media)[i]].id == undefined){
//                     // console.log(media[Object.keys(media)[i]])
//                     delete media[Object.keys(media)[i]]
//                     i--
//                 }

//             }
//         }

//         // console.log(JSON.stringify(performance_medias, 0, 4));
//     }


//     console.log(JSON.stringify(performancePicsJSON, 0, 4))
//     putToStrapi(performancePicsJSON, 'performances')
// }


// ARTICLE_MEDIA
// const getStrapiIds = () => {
//     echoPicsJSON.map(article_media => {
//         article_media.id = (articles_from_strapi.filter(s_article => {
//                 return s_article.remote_id === article_media.entu_id.toString()
//             })[0] || {}).id || null
//         return article_media
//     })
// }

// async function send_pic_and_create_relation() {
//     getStrapiIds()
//     for (const article_medias of echoPicsJSON) {
//         const strapi_id = article_medias.id
//         article_medias.article_media = article_medias.medias
//         delete article_medias.medias
//         for (const media of article_medias.article_media) {
//             for ( let i = 0; i < Object.keys(media).length; i++){
//                 await sendPic(media[Object.keys(media)[i]]) // lisab meediale strapi id
//                 // console.log(media[Object.keys(media)[i]].id)
//                 if (media[Object.keys(media)[i]].id == undefined){
//                     // console.log(media[Object.keys(media)[i]])
//                     delete media[Object.keys(media)[i]]
//                     i--
//                 }

//             }
//         }

//         // console.log(JSON.stringify(article_medias, 0, 4));
//     }


//     console.log(JSON.stringify(echoPicsJSON, 0, 4))
//     putToStrapi(echoPicsJSON, 'articles')
// }


// send_pic_and_create_relation()



// EVENT
const getStrapiIds = () => {
    eventPicsJSON.map(event_media => {
        event_media.id = (events_from_strapi.filter(s_event => {
                return s_event.remote_id === event_media.entu_id.toString()
            })[0] || {}).id || null
        return event_media
    })
}

async function send_pic_and_create_relation() {
    getStrapiIds()
    for (const event_medias of eventPicsJSON) {
        const strapi_id = event_medias.id
        event_medias.event_media = event_medias.medias
        delete event_medias.medias
        for (const media of event_medias.event_media) {
            for ( let i = 0; i < Object.keys(media).length; i++){
                await sendPic(media[Object.keys(media)[i]]) // lisab meediale strapi id
                // console.log(media[Object.keys(media)[i]].id)
                if (media[Object.keys(media)[i]].id == undefined){
                    // console.log(media[Object.keys(media)[i]])
                    delete media[Object.keys(media)[i]]
                    i--
                }

            }
        }

        // console.log(JSON.stringify(event_medias, 0, 4));
    }


    console.log(JSON.stringify(eventPicsJSON, 0, 4))
    putToStrapi(eventPicsJSON, 'events')
}


send_pic_and_create_relation()


// KIRJUTA STRAPI PERFORMANCE_MEDIA TYHJAKS

// let performance = performancePicsJSON.map( perf => {

//     let strapi_id = performances_from_strapi.filter(s_performance => {
//         return s_performance.remote_id === perf.entu_id.toString()
//     }).map( e => e.id )

//     return {
//         "id": strapi_id,
//         "performance_media": [],
//         "logos": []
//     }

// })

// console.log(performance)
// putToStrapi(performance, 'performances')


// let article = echoPicsJSON.map( perf => {

//     let strapi_id = articles_from_strapi.filter(s_article => {
//         return s_article.remote_id === perf.entu_id.toString()
//     }).map( e => e.id )

//     return {
//         "id": strapi_id,
//         "article_media": []
//     }

// })

// console.log(article)
// putToStrapi(article, 'articles')


// LOGOS TO STRAPI
// async function performance_logos_and_riders_from_entu(){
//     let dataJSON = path.join(entuDataPath, 'performance.json')
//     let performanceJSON = JSON.parse(fs.readFileSync(dataJSON, 'utf-8'))

//     let get_strapi_performances = performanceJSON.map( e_performance => {
//         let performance = performances_from_strapi.filter( s_performance => {
//             // console.log('S', s_performance.remote_id, 'E', e_performance.id);
//             return s_performance.remote_id === e_performance.id.toString()
//         }).map( e => e.id)
//         e_performance.strapi_id = performance
//     })

//     for (const performance of performanceJSON) {
//         // console.log(performance.properties.logo.values)
//         performance.logos = []
//         for (const prop of performance.properties.logo.values) {
//             // console.log(prop);
//             await sendPic(prop)
//         }

//         for (const value of performance.properties.logo.values) {
//             performance.logos.push(value.id)
//         }
//         performance.id = performance.strapi_id

//         delete performance.displaypicture
//         delete performance.displayname
//         delete performance.properties
//         delete performance.strapi_id

//     }

//     let perfJSON = []
//     console.log(JSON.stringify(perfJSON, 0, 2))
//     for (const perf of performanceJSON) {
//         if (perf.logos.length > 0) {
//             perfJSON.push(perf)
//         }
//     }
//     putToStrapi(perfJSON, 'performances')
// }

// performance_logos_and_riders_from_entu()


// EVENT PIC TO STRAPI

// async function event_pic_and_relation_to_strapi() {

//     const dataJSON = path.join(entuDataPath, 'event.json')
//     let eventJSON = JSON.parse(fs.readFileSync(dataJSON, 'utf-8'))

//     let strapi_id = eventJSON.map( e_event => {
//         let event = events_from_strapi.filter( s_event => {
//             return e_event.id.toString() === s_event.remote_id
//         }).map( e => e.id)
//         e_event.strapi_id = event
//     })

//     for (const event of eventJSON) {

//         event.media = {}
//         if(event.properties['photo-gallery'].values.length > 0 || event.properties['photo-original'].values.length > 0 || event.properties['photo'].values.length > 0 || event.properties['photo-big'].values.length > 0){
//             event.media.gallery_image_medium = event.properties['photo-gallery'].values
//             event.media.original_image = event.properties['photo-original'].values
//             event.media.hero_image = event.properties['photo'].values
//             event.media.gallery_image_large = event.properties['photo-big'].values

//         }

//         if( Object.keys(event.media).length < 1){
//             delete event.media
//         }

//         // for( const element of event.properties['photo-gallery']){
//         //     console.log(element )
//         // }

//         if( event.properties.performance.values.length > 0){
//             // event.performance = event.properties.performance.values
//             delete event
//         }
//         delete event.properties

//         if( event.media ){
//             console.log(JSON.stringify(event, 0, 2))

//         }

//     }


// }

// event_pic_and_relation_to_strapi()