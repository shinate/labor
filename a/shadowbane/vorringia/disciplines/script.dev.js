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
                        label: ''
                    },
                    {
                        key    : 'detail',
                        label  : '详情',
                        'class': 'detail'
                    },
                    {
                        key    : 'target',
                        label  : '目标',
                        'class': 'target'
                    },
                    {
                        key    : 'target_av',
                        label  : '目标',
                        'class': 'target_av'
                    },
                    {
                        key    : 'locationsign',
                        label  : '位置标记',
                        'class': 'locationsign'
                    },
                    {
                        key    : 'zonesign',
                        label  : '怪区标记',
                        'class': 'zonesign'
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
                    // console.log(disciplines, EliteEquipment, zone)
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

                if (!this.zone.hasOwnProperty(pos.location)) {
                    return {
                        left: 0,
                        top : 0
                    }
                }

                let zone = this.zone[pos.location];
                let zoneSize, zoneOffset;

                if (zone.hasOwnProperty('offset')) {
                    zoneOffset = zone.offset
                } else {
                    zoneOffset = [0, 0]
                }

                if (zone.hasOwnProperty('size')) {
                    zoneSize = zone.size
                } else {
                    zoneSize = ZONE_SIZE
                }

                return {
                    left: `${100 * (pos.coordinates[0] - zoneOffset[0]) / zoneSize[0]}%`,
                    top : `${100 - (100 * (pos.coordinates[1] - zoneOffset[1]) / zoneSize[1])}%`
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