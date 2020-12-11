const fs = require('fs')
const yaml = require('js-yaml')
const path = require('path')

const rootDir =  path.join(__dirname, '..')
const sourceDir = path.join(rootDir, 'source')
const fetchDir = path.join(sourceDir, '_fetchdir')
const performancesDir = path.join(fetchDir, 'performances')
const strapiDataPath = path.join(fetchDir, 'strapiData.yaml')
const STRAPIDATA = yaml.safeLoad(fs.readFileSync(strapiDataPath, 'utf8'))
const STRAPIDATA_PERFORMANCES = STRAPIDATA['Performance']
const LANGUAGES = ['et', 'en']

let performance_index_template = `/_templates/performance_index_template.pug`

for (const lang of LANGUAGES) {
    const performancesYAMLPath = path.join(fetchDir, `performances.${lang}.yaml`)
    let allData = []

    for (const performance of STRAPIDATA_PERFORMANCES) {

        // if ( performance.remote_id !== '6865'){
        //     continue
        // }

        if (performance.remote_id) {

            if (lang !== 'et') {
                performance.path = `performance/${performance.remote_id}`
            } else {
                performance.path = `${lang}/performance/${performance.remote_id}`
            }


            if (performance.events){

                for (const event of performance.events){
                    let eventDate = new Date(event.start_time)
                    event.start_date_string = `${('0' + eventDate.getDate()).slice(-2)}.${('0' + (eventDate.getMonth()+1)).slice(-2)}.${eventDate.getFullYear()}`
                }


                let minToMaxSortedEvents = performance.events.sort((a, b) => new Date(a.start_time) - new Date(b.start_time))
                performance.minToMaxEvents = minToMaxSortedEvents
                let eventsCopy = JSON.parse(JSON.stringify(performance.events))

                let maxToMinSortedEvents = eventsCopy.sort((a, b) => new Date(b.start_time) - new Date(a.start_time))
                performance.maxToMinEvents = maxToMinSortedEvents

                delete performance.events
            }
            const performanceYAML = yaml.safeDump(performance, {'noRefs': true, 'indent': '4' });
            const performanceDir = path.join(performancesDir, performance.remote_id)
            const performanceYAMLPath = path.join(performanceDir, `data.${lang}.yaml`)

            fs.mkdirSync(performanceDir, { recursive: true });
            fs.writeFileSync(performanceYAMLPath, performanceYAML, 'utf8');

            if (fs.existsSync(`${sourceDir}${performance_index_template}`)) {
                fs.writeFileSync(`${performanceDir}/index.pug`, `include ${performance_index_template}`)
                allData.push(performance)
            } else {
                console.log(`ERROR: Performance index template missing`);
            }
            if (performance[`X_headline_${lang}`]){
                // console.log(`${performance.id}, ${performance.remote_id}`);
            }
        }
    }

    console.log(`${allData.length} performances from YAML (${lang}) ready for building`);
    const performancesYAML = yaml.safeDump(allData, {'noRefs': true, 'indent': '4' });
    fs.writeFileSync(performancesYAMLPath, performancesYAML, 'utf8');
}