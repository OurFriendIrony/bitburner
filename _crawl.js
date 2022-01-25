var EMPTY = ".";
var HACKING = "...";
var GROWING = "+£"
var WEAKENING = "-sec"
var HACK_LEVEL_LOW = "LOW HACK";
var PORT_LEVEL_LOW = "LOW PORT";
var NOT_HACKED = " ? ";
var NO_RAM = "no ram"

var SCRIPT_WEAKEN = "r_weaken.js"
var SCRIPT_GROW = "r_grow.js"
var SCRIPT_HACK = "r_hack.js"
var SCRIPT_FIND = "find.js"

var HOME = "home";
var SKIP_ERR = true;
var SKIP_EMPTY = true;
var ONLY_HACK = false;

var PATH_VIEW_SHORT = true;
var UNITS_MONEY = [' ', 'k', 'm', 'b', 't', 'p', 'e', 'z', 'y']
var MIN_SECURITY_MODIFIER = 0.5
var MAX_LEVEL = 20;
var MIN_MONEY_PERC = 90
var DEFAULT_THREADS = 1;

/** @param {NS} ns **/
export async function main(ns) {
    var ram_weaken = ns.getScriptRam(SCRIPT_WEAKEN, HOME);
    var ram_grow = ns.getScriptRam(SCRIPT_GROW, HOME);
    var ram_hack = ns.getScriptRam(SCRIPT_HACK, HOME);
    clearLog(ns);

    var skip_err = ns.args[0] == null ? SKIP_ERR : ns.args[0]

    while (true) {
        var hosts = [];
        await ns.sleep(1000)
        clearLog(ns);

        var ct_root = 0
        var ct_backdoor = 0
        var ct_ports = 0
        var ct_hack = 0
        var ct_value = 0

        explore(ns, hosts, '', HOME, 0)

        header(ns)
        for (var i = 0; i < hosts.length; i++) {
            var obj = hosts[i];
            obj.color = "ERROR"

            if (obj.hack.met && obj.port.met) {
                await ns.nuke(obj.host)
                await ns.scp(SCRIPT_HACK, HOME, obj.host)
                await ns.scp(SCRIPT_WEAKEN, HOME, obj.host)
                await ns.scp(SCRIPT_GROW, HOME, obj.host)
                await ns.scp(SCRIPT_FIND, HOME, obj.host)

                if (obj.money.perc == 0) {
                    obj.status = EMPTY
                    obj.color = "INFO"
                } else if (obj.ram.max < ram_hack) {
                    obj.status = NO_RAM
                    obj.color = "WARN"
                } else {
                    obj.color = "OK"
                    ct_value += obj.money.avail
                    if (!ONLY_HACK && obj.security.current > (obj.security.min + MIN_SECURITY_MODIFIER)) {
                        obj.status = WEAKENING
                        obj.ram = getRAMInfo(ns, obj.host);
                        var num = parseInt(obj.ram.free / ram_weaken);
                        for (var n = 0; n < num; n++) {
                            ns.exec(SCRIPT_WEAKEN, obj.host, DEFAULT_THREADS, n)
                        }
                        obj.ram.free -= (ram_weaken * num)

                    } else if (!ONLY_HACK && obj.money.perc < MIN_MONEY_PERC) {
                        obj.status = GROWING
                        obj.ram = getRAMInfo(ns, obj.host);
                        var num = parseInt(obj.ram.free / ram_grow);
                        for (var n = 0; n < num; n++) {
                            ns.exec(SCRIPT_GROW, obj.host, DEFAULT_THREADS, n)
                        }
                        obj.ram.free -= (ram_grow * num)

                    } else {
                        obj.status = HACKING
                        obj.ram = getRAMInfo(ns, obj.host);
                        var num = parseInt(obj.ram.free / ram_hack);
                        for (var n = 0; n < num; n++) {
                            ns.exec(SCRIPT_HACK, obj.host, DEFAULT_THREADS, n)
                        }
                        obj.ram.free -= (ram_hack * num)
                    }
                }
            } else if (!obj.port.met) {
                obj.status = PORT_LEVEL_LOW
            } else if (!obj.hack.met) {
                obj.status = HACK_LEVEL_LOW
            } else {
                obj.status = NOT_HACKED
            }

            if (obj.owned) {
                // Don't include the hosts I created
            } else if (skip_err && obj.color == "ERROR") {
                // Skip the error because we said we're skipping those...
            } else if (SKIP_EMPTY && obj.access.backdoor && obj.money.perc == 0) {
                // Skip if already backdoor'd and has no value
            } else {
                line(ns, obj)
            }

            ct_root += obj.access.root ? 1 : 0
            ct_backdoor += obj.access.backdoor ? 1 : 0
            ct_ports += obj.port.met ? 1 : 0
            ct_hack += obj.hack.met ? 1 : 0
        }

        footer(ns, ct_root, ct_backdoor, ct_ports, ct_hack, ct_value, hosts.length)
    }
}

function explore(ns, hosts, parent_host, target_host, level) {
    if (level >= MAX_LEVEL) { return }

    ns.scan(target_host).filter(child_host => child_host != parent_host).forEach(child_host => {
        var obj = getHostInfo(ns, child_host, level);
        openPorts(ns, obj)
        hosts.push(obj)
        explore(ns, hosts, target_host, child_host, (level + 1))
    })
}

function fmtMoney(money) {
    var unit_i = 0; var v = money;
    while (v >= 1000) { unit_i += 1; v = parseInt(v / 1000) }
    return '' + (v + UNITS_MONEY[unit_i]);
}

function openPorts(ns, h) {
    if (!h.port.open.ssh && ns.fileExists("BruteSSH.exe", HOME)) { ns.brutessh(h.host) };
    if (!h.port.open.ftp && ns.fileExists("FTPCrack.exe", HOME)) { ns.ftpcrack(h.host) };
    if (!h.port.open.smtp && ns.fileExists("relaySMTP.exe", HOME)) { ns.relaysmtp(h.host) }
    if (!h.port.open.http && ns.fileExists("HTTPWorm.exe", HOME)) { ns.httpworm(h.host) }
    if (!h.port.open.sql && ns.fileExists("SQLInject.exe", HOME)) { ns.sqlinject(h.host) }
}

//======================================================================
// Display
//======================================================================

var w1 = 5; var w2 = 6; var w3 = 5; var w4 = 4; var w5 = 16; var w6 = 16; var w7 = 10; var w8 = 10

function clearLog(ns) {
    ns.disableLog("ALL");
    ns.clearLog();
}

function header(ns) {
    ns.print(` level | access | ports | hack | value | security | status | path`);
    ns.print(`=======|========|=======|======|==================|==============|============|===================`);
}

function footer(ns, total_rooted, total_backdoored, total_ported, total_hacked, total_money, total_hosts) {
    var f1 = ``.padStart(w1);
    var f2 = `${total_rooted}`.padStart(2) + ' ' + `${total_backdoored}`.padStart(2);
    var f3 = `${total_ported}`.padStart(w3);
    var f4 = `${total_hacked}`.padStart(w4);
    var f5 = `${fmtMoney(total_money)}`.padStart(w5)
    var f6 = ``.padStart(w6)
    var f7 = ``.padStart(w7)
    var f8 = `${total_hosts}`.padStart(w8)
    ns.print(`=======|========|=======|======|==================|==============|============|===================`);
    ns.print(` ${f1} | ${f2} | ${f3} | ${f4} | ${f5} | ${f6} ${f7} ${f8}`);
}

function fmtValueAndPerc(money) {
    var perc = `${money.perc}%`;
    return `${perc} ${(fmtMoney(money.avail)).padStart(4)} ${fmtMoney(money.max).padStart(4)}`;
}

function line(ns, h) {
    var f1 = `${h.color}`.padStart(w1);
    var f2 = ((h.access.root ? " r" : "_") + " " + (h.access.backdoor ? "b " : "_ ")).padStart(w2);
    var f3 = `${h.port.left}`.padStart(w3);
    var f4 = `${h.hack.left}`.padStart(w4);
    var f5 = `${h.money.perc}%`.padStart(4) + ' ' + `${(fmtMoney(h.money.avail)).padStart(4)} ${fmtMoney(h.money.max).padStart(4)}`;
    var f6 = (`${('' + h.security.min).padStart(2)}. ${(h.security.diff).padStart(7)}`);
    var f7 = `${h.status}`.padStart(w7);

    var f8 = PATH_VIEW_SHORT
        ? `${('' + h.level).padStart(2)} > ${h.host}`
        : ('').padStart(h.level * 2) + `> ${h.host}`;

    ns.print(` ${f1} | ${f2} | ${f3} | ${f4} | ${f5} | ${f6} | ${f7} | ${f8}`)
}

//======================================================================
// Getting Host Information
//======================================================================

function getRAMInfo(ns, child_host) {
    var max = ns.getServerMaxRam(child_host)
    var used = ns.getServerUsedRam(child_host)
    return { "max": max, "used": used, "free": (max - used) }
}

function getPorts(h) {
    var diff = h.numOpenPortsRequired - h.openPortCount;
    var met = diff <= 0;
    var left = met ? 0 : diff;
    var open = { "ftp": h.ftpPortOpen, "http": h.httpPortOpen, "ssh": h.sshPortOpen, "sql": h.sqlPortOpen, "smtp": h.smtpPortOpen }
    return { "have": h.openPortCount, "need": h.numOpenPortsRequired, "left": left, "met": met, "open": open };
}

function getHackInfo(ns, h) {
    var have = ns.getHackingLevel();
    var need = h.requiredHackingSkill
    var diff = need - have;
    var met = diff <= 0;
    var left = met ? 0 : diff
    return { "have": have, "level": need, "left": left, "met": met }
}

function getHostInfo(ns, child_host, level) {
    var h = ns.getServer(child_host);

    return {
        "host": h.hostname,
        "owned": h.purchasedByPlayer,
        "level": level,
        "access": {
            "root": h.hasAdminRights,
            "backdoor": h.backdoorInstalled
        },
        "cpu": {
            "cores": h.cpuCores
        },
        "ram": getRAMInfo(ns, h.hostname),
        "port": getPorts(h),
        "hack": getHackInfo(ns, h),
        "money": {
            "avail": parseInt(h.moneyAvailable),
            "max": h.moneyMax,
            "perc": (h.moneyAvailable / h.moneyMax * 100) | 0
        },
        "security": {
            "current": (h.hackDifficulty).toFixed(2),
            "min": h.minDifficulty,
            "base": h.baseDifficulty,
            "diff": (h.hackDifficulty - h.minDifficulty).toFixed(2)
        }
    }
}

//======================================================================