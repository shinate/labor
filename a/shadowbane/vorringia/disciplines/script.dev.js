(function (Vue, $) {


    function getJSON(url) {
        return new Promise(function (resolve, reject) {
            const handler = function () {
                if (this.readyState !== 4) {
                    return;
                }
                if (this.status === 200) {
                    resolve(this.response);
                } else {
                    reject(new Error(this.statusText));
                }
            };
            const client = new XMLHttpRequest();
            client.open("GET", url);
            client.onreadystatechange = handler;
            client.responseType = "json";
            client.setRequestHeader("Accept", "application/json");
            client.send();

        });
    }

    let WORD_SIZE = [131000, 99800]; // 因为 Y有个边，多加了1600

    let ZONE_SIZE = [4500, 4500];

    new Vue({
        el     : '#main',
        data   : function () {
            return {
                fields: [
                    {
                        key  : 'icon',
                        label: '图标'
                    },
                    {
                        key     : 'name_zh',
                        label   : '名称',
                        sortable: true
                    },
                    {
                        key     : 'name',
                        label   : '名称(en)',
                        sortable: true
                    },
                    {
                        key     : 'target',
                        label   : '目标',
                        sortable: true
                    },
                    {
                        key  : 'zone',
                        label: '怪区'
                    },
                    {
                        key  : 'target_av',
                        label: '目标(图)'
                    },
                    {
                        key  : 'locationsign',
                        label: '位置标记'
                    },
                    {
                        key  : 'zonesign',
                        label: '怪区标记'
                    }
                ],
                items : null,
                zone  : null,
                loaded: false
            };
        },
        created: function () {
            Promise.all(['./disciplines.json', './EliteEquipment.json', './zone.json'].map(getJSON))
                .then(params => {
                    let [disciplines, EliteEquipment, zone] = params;
                    console.log(disciplines, EliteEquipment, zone)
                    this.items = [...disciplines, ...EliteEquipment];
                    this.zone = zone;
                    this.loaded = true;
                })
                .catch(function (reason) {

                });
        },
        mounted: function () {
        },
        methods: {
            crossZone    : function (pos) {
                return {
                    left: `${100 * pos.coordinates[0] / WORD_SIZE[0]}%`,
                    top : `${100 - (100 * pos.coordinates[1] / WORD_SIZE[1])}%`
                };
            },
            crossLocation: function (pos) {
                return {
                    left: `${100 * (pos.coordinates[0] - this.zone[pos.location].offset[0]) / ZONE_SIZE[0]}%`,
                    top : `${100 - (100 * (pos.coordinates[1] - this.zone[pos.location].offset[1]) / ZONE_SIZE[1])}%`
                };
            },
            mapZone      : function (pos) {
                if (this.zone.hasOwnProperty(pos.location)) {
                    return this.zone[pos.location].map;
                }
                return '';
            }
        }
    });
})(window.Vue, window.jQuery);