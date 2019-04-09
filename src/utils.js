const formatDateTime = date => {
        const d = new Date(date);
        return `${d.getDate()}.${d.getMonth()}.${d.getFullYear()} ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}.${d.getMilliseconds()}`;
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
export { formatDate, formatDateTime, formatTime, formatMachineDateTime };
