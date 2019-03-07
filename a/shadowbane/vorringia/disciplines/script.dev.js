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
                        key  : 'disciplineAnimator',
                        label: '图标'
                    },
                    {
                        key     : 'disciplineName',
                        label   : '副职（中文）',
                        sortable: true
                    },
                    {
                        key     : 'discipline',
                        label   : '副职',
                        sortable: true
                    },
                    {
                        key     : 'dropper',
                        label   : '掉落者',
                        sortable: true
                    },
                    {
                        key  : 'zone',
                        label: '怪区'
                    },
                    {
                        key  : 'zonesign',
                        label: '怪区标记'
                    },
                    {
                        key  : 'locationsign',
                        label: '位置标记'
                    },
                    {
                        key  : 'discdropper',
                        label: '掉落者（外观）'
                    }
                ],
                items : null,
                zone  : null,
                loaded: false
            };
        },
        created: function () {
            Promise.all(['./disciplines.json', './zone.json'].map(getJSON))
                .then(params => {
                    let [items, zone] = params;
                    this.items = items;
                    this.zone = zone;
                    this.loaded = true;
                })
                .catch(function (reason) {

                });
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