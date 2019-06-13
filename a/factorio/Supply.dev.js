let belt = {
    yellow: 13.33,
    red   : 26.67,
    blue  : 40.00
}

let Supply = $('#supply');
Supply.find('[role="clean"]').on('click', function () {
    let form = $(this).parents('form');
    form.find('input, select').val('')
})

Supply.find('[role="run"]').on('click', function () {
    let form = $(this).parents('form');
    let data = {}
    form.serializeArray().forEach(function (item) {
        data[item.name] = item.value;
    });

    if (!data.addition) {
        data.addition = 1;
    }

    if (!data.output) {
        data.output = 1;
    }

    if (!data.bonus) {
        data.bonus = 1;
    }

    if (!data.time) {
        return;
    }

    let process_pre_sec = 1 / (data.time / data.addition) // 生产(进程)/s

    let output = {
        quantity: process_pre_sec * data.output * data.bonus
    }

    output.process_pre_belt_yellow = belt.yellow / output.quantity
    output.process_pre_belt_red = belt.red / output.quantity
    output.process_pre_belt_blue = belt.blue / output.quantity

    let supplies = {}
    for (let i = 1; i <= 6; i++) {
        let s = `source_${i}`
        if (data[s] > 0) {
            supplies[i] = {}
            supplies[i].quantity = data[s] * process_pre_sec
            supplies[i].process_pre_belt_yellow = belt.yellow / supplies[i].quantity
            supplies[i].process_pre_belt_red = belt.red / supplies[i].quantity
            supplies[i].process_pre_belt_blue = belt.blue / supplies[i].quantity
        }
    }

    let result = []
    result.push(`进程: ${round(process_pre_sec, 2)}/s`)
    for (let i in supplies) {
        if (supplies.hasOwnProperty(i)) {
            result.push(`[原料 ${i}]`, `数量: ${round(supplies[i].quantity, 2)}/s 黄: ${round(supplies[i].process_pre_belt_yellow, 2)} 红: ${round(supplies[i].process_pre_belt_red, 2)} 蓝: ${round(supplies[i].process_pre_belt_blue, 2)}`)
        }
    }
    result.push(`[产出]`, `数量: ${round(output.quantity, 2)}/s 黄: ${round(output.process_pre_belt_yellow, 2)} 红: ${round(output.process_pre_belt_red, 2)} 蓝: ${round(output.process_pre_belt_blue, 2)}`)

    Supply.find('[role="result"]').html(result.join('<br>'))
})

function round(num, radio = 0) {
    return Math.round(num * Math.pow(10, radio)) / Math.pow(10, radio)
}