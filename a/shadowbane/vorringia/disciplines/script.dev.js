(function (Vue, $) {

    let WORD_SIZE = [131000, 99800]; // 因为 Y有个边，多加了1600

    let ZONE_SIZE = [4500, 4500];

    let ZONE = {
        "Grimscairne"         : {
            map   : "https://morloch.shadowbaneemulator.com/images/thumb/4/43/Zone99.jpg/400px-Zone99.jpg",
            offset: [41000, 43300]
        },
        "Ashfell Plain"       : {
            map   : "https://morloch.shadowbaneemulator.com/images/thumb/1/15/Zone15.jpg/400px-Zone15.jpg",
            offset: [82700, 67200]
        },
        "Derros Plains"       : {
            map   : "https://morloch.shadowbaneemulator.com/images/thumb/c/c3/Zone16.jpg/400px-Zone16.jpg",
            offset: [73800, 48200]
        },
        "Greensward Pyre"     : {
            map   : "https://morloch.shadowbaneemulator.com/images/thumb/d/d9/Zone2.jpg/400px-Zone2.jpg",
            offset: [37230, 55680]
        },
        "Valkos Wilds"        : {
            map   : "https://morloch.shadowbaneemulator.com/images/thumb/9/9b/Zone8.jpg/400px-Zone8.jpg",
            offset: [41160, 38600]
        },
        "Phaedra's Prize"     : {
            map   : "https://morloch.shadowbaneemulator.com/images/thumb/0/0d/Zone98.jpg/400px-Zone98.jpg",
            offset: [53200, 43600]
        },
        "Kharsoom"            : {
            map   : "https://morloch.shadowbaneemulator.com/images/thumb/1/16/Zone12.jpg/400px-Zone12.jpg",
            offset: [25600, 34300]
        },
        "The Blood Sands"     : {
            map   : "https://morloch.shadowbaneemulator.com/images/thumb/c/cb/Zone7.jpg/400px-Zone7.jpg",
            offset: [12350, 33600]
        },
        "Bone Marches"        : {
            map   : "https://morloch.shadowbaneemulator.com/images/thumb/a/a4/Bonemarches.jpg/400px-Bonemarches.jpg",
            offset: [105500, 45000]
        },
        "Hregend Wildlands"   : {
            map   : "https://morloch.shadowbaneemulator.com/images/thumb/7/7e/Zone19.jpg/400px-Zone19.jpg",
            offset: [60200, 68200]
        },
        "Leth'khalivar Desert": {
            map   : "https://morloch.shadowbaneemulator.com/images/thumb/0/0f/LethDesert.png/400px-LethDesert.png",
            offset: [25600, 39300]
        },
        "Aurrochs Skrae"      : {
            map   : "https://morloch.shadowbaneemulator.com/images/thumb/a/a3/Zone13.jpg/400px-Zone13.jpg",
            offset: [55000, 68000]
        },
        "Fellgrim Forest"     : {
            map   : "https://morloch.shadowbaneemulator.com/images/thumb/d/d4/Fellgrim.jpg/400px-Fellgrim.jpg",
            offset: [61900, 50200]
        },
        "Tainted Swamp"       : {
            map   : "https://morloch.shadowbaneemulator.com/images/thumb/9/92/Zone97.jpg/400px-Zone97.jpg",
            offset: [75200, 41200] // ??
        }
    };

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
                loaded: false
            };
        },
        created: function () {
            $.getJSON('./data.json', function (data) {
                this.items = data;
                this.loaded = true;
            }.bind(this));
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
                    left: `${100 * (pos.coordinates[0] - ZONE[pos.location].offset[0]) / ZONE_SIZE[0]}%`,
                    top : `${100 - (100 * (pos.coordinates[1] - ZONE[pos.location].offset[1]) / ZONE_SIZE[1])}%`
                };
            },
            mapZone      : function (pos) {
                if (ZONE.hasOwnProperty(pos.location)) {
                    return ZONE[pos.location].map;
                }
                return '';
            }
        }
    });
})(window.Vue, window.jQuery);