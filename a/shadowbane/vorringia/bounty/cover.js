var parse = require('csv-parse/lib/sync')
var fs = require('fs')
var path = require('path')

var bountyC = fs.readFileSync(path.join(__dirname, './bounty.csv'))

var bounty = parse(bountyC.toString()).slice(1)

bountyRes = bounty.map(function (item) {
    return {
        name_zh: `[${item[0]}][${item[1]}w][${item[2]}]`,
        name: item[3],
        target: item[4],
        target_av: "",
        icon: "",
        pos: [
            {
                "location": item[6],
                "coordinates": [
                    item[7],
                    item[8]
                ]
            }
        ]
    }
})

fs.writeFileSync(path.join(__dirname, './bounty.json'), Buffer.from(JSON.stringify(bountyRes, null, 2)))