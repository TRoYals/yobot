var gs_offset = { jp: 4, tw: 5, kr: 4, cn: 5 };
function ts2ds(timestamp) {
    var d = new Date();
    d.setTime(timestamp * 1000);
    return d.getFullYear() + '/' + d.getMonth() + '/' + d.getDate();
}
var vm = new Vue({
    el: '#app',
    data: {
        challengeData: [],
        activeIndex: '5',
    },
    mounted() {
        var thisvue = this;
        var pathname = window.location.pathname.split('/');
        var qqid = parseInt(pathname[pathname.length - 2]);
        axios.post('../api/', {
            action: 'get_user_challenge',
            qqid: qqid,
        }).then(function (res) {
            if (res.data.code != 0) {
                thisvue.$alert(res.data.message, '获取记录失败');
                return;
            }
            thisvue.refresh(res.data.challenges, res.data.game_server);
        }).catch(function (error) {
            thisvue.$alert(error, '获取数据失败');
        });
    },
    methods: {
        csummary: function (cha) {
            if (cha == undefined) {
                return '';
            }
            return '(' + cha.cycle + '-' + cha.boss_num + ') ' + cha.damage.toLocaleString();
        },
        cdetail: function (cha) {
            if (cha == undefined) {
                return '';
            }
            var nd = new Date();
            nd.setTime(cha.challenge_time * 1000);
            var detailstr = nd.toLocaleString('chinese', { hour12: false }) + '<br />';
            detailstr += cha.cycle + '周目' + cha.boss_num + '号boss<br />';
            detailstr += (cha.health_ramain + cha.damage).toLocaleString() + '→' + cha.health_ramain.toLocaleString();
            return detailstr;
        },
        arraySpanMethod: function ({ row, column, rowIndex, columnIndex }) {
            if (columnIndex >= 2) {
                if (columnIndex % 2 == 0) {
                    var detail = row.detail[columnIndex - 2];
                    if (detail != undefined && detail.health_ramain != 0) {
                        return [1, 2];
                    }
                } else {
                    var detail = row.detail[columnIndex - 3];
                    if (detail != undefined && detail.health_ramain != 0) {
                        return [0, 0];
                    }
                }
            }
        },
        refresh: function (challenges, game_server) {
            var thisvue = this;
            var m = { pcrdate: -1 };
            for (c of challenges) {
                var pcrdate = ts2ds(c.challenge_time - (gs_offset[game_server] * 3600));
                if (m.pcrdate != pcrdate) {
                    if (m.pcrdate != -1) {
                        thisvue.challengeData.push(m);
                    }
                    m = {
                        pcrdate: pcrdate,
                        finished: 0,
                        detail: [],
                    }
                }
                m.detail[2 * m.finished] = c;
                if (c.is_continue) {
                    m.finished += 0.5;
                } else {
                    if (c.health_ramain != 0) {
                        m.finished += 1;
                    } else {
                        m.finished += 0.5;
                    }
                }
            }
            if (m.pcrdate != -1) {
                thisvue.challengeData.push(m);
            }
        },
        handleTitleSelect(key, keyPath) {
            switch (key) {
                case '1':
                    window.location = '../';
                    break;
                case '2':
                    window.location = '../subscribers/';
                    break;
                case '3':
                    window.location = '../progress/';
                    break;
                case '4':
                    window.location = '../statistics/';
                    break;
                case '5':
                    window.location = `../my/`;
                    break;
            }
        },
    },
    delimiters: ['[[', ']]'],
})