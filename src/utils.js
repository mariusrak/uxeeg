const formatDateTime = date => {
        const d = new Date(date);
        return `${d.getDate()}.${d.getMonth()}.${d.getFullYear()} ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}.${d.getMilliseconds()}`;
};
const readIMotionsDate = date => {
        const t = date.toString();
        const p = [
                t.substr(0, 4),
                t.substr(4, 2) - 1,
                t.substr(6, 2),
                t.substr(8, 2),
                t.substr(10, 2),
                t.substr(12, 2),
                t.substr(14, 3)
        ];
        return new Date(...p);
};
const formatMachineDateTime = date => {
        const d = new Date(date);
        return parseInt(
                "" +
                        d.getFullYear() +
                        ("00" + (d.getMonth() + 1)).substr(-2) +
                        ("00" + d.getDate()).substr(-2) +
                        ("00" + d.getHours()).substr(-2) +
                        ("00" + d.getMinutes()).substr(-2) +
                        ("00" + d.getSeconds()).substr(-2) +
                        ("000" + d.getMilliseconds()).substr(-3),
                10
        );
};
const formatDate = date => {
        const d = new Date(date);
        return `${d.getDate()}.${d.getMonth()}.${d.getFullYear()}`;
};
const formatTime = date => {
        const d = new Date(date);
        return `${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}.${d.getMilliseconds()}`;
};

const perc2color = perc => {
        perc = 100 - perc * 100;
        var r,
                g,
                b = 0;
        if (perc < 50) {
                r = 255;
                g = Math.round(5.1 * perc);
        } else {
                g = 255;
                r = Math.round(510 - 5.1 * perc);
        }
        var h = r * 0x10000 + g * 0x100 + b * 0x1;
        return "#" + ("000000" + h.toString(16)).slice(-6);
};
export { formatDate, formatDateTime, formatTime, formatMachineDateTime, readIMotionsDate, perc2color };
