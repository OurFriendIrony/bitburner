import { clrLog, explore, getRAMInfo, formatUnits, formatUnitsV2 } from "functions.js"

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

var HOME = "home";
var SKIP_ERR = true;
var SKIP_EMPTY = true;
var ONLY_HACK = false;

var MIN_SECURITY_MODIFIER = 1.5
var MIN_MONEY_PERC = 90
var DEFAULT_THREADS = 1;

/** @param {NS} ns **/
export async function main(ns) {
    ns.tail()

    var ram_weaken = ns.getScriptRam(SCRIPT_WEAKEN, HOME);
    var ram_grow = ns.getScriptRam(SCRIPT_GROW, HOME);
    var ram_hack = ns.getScriptRam(SCRIPT_HACK, HOME);
    clrLog(ns)

    var skip_err = ns.args[0] == null ? SKIP_ERR : Boolean(ns.args[0])
    var skip_empty = ns.args[1] == null ? SKIP_EMPTY : Boolean(ns.args[1])

    while (true) {
        var hosts = [];
        await ns.sleep(1000)
        clearLog(ns);

        explore(ns, hosts, '', HOME, 0)

        var ct_root = 0
        var ct_root_shown = 0
        var ct_backdoor = 0
        var ct_backdoor_shown = 0
        var ct_ports = 0
        var ct_ports_shown = 0
        var ct_hack = 0
        var ct_hack_shown = 0
        var ct_value_avail = 0
        var ct_value_avail_shown = 0
        var ct_value_max = 0
        var ct_value_max_shown = 0
        var ct_hosts = hosts.length
        var ct_hosts_shown = 0

        header(ns)
        for (var i = 0; i < hosts.length; i++) {
            var obj = hosts[i];
            openPorts(ns, obj)
            obj.color = "ERROR"

            if (obj.hack.met && obj.port.met) {
                if (!obj.access.root) {
                    ns.nuke(obj.host)
                } else {
                    await ns.scp(SCRIPT_HACK, HOME, obj.host)
                    await ns.scp(SCRIPT_WEAKEN, HOME, obj.host)
                    await ns.scp(SCRIPT_GROW, HOME, obj.host)

                    if (obj.security.current < 0) {
                        obj.status = EMPTY
                        obj.color = "INFO"
                    } else if (obj.money.perc == 0) {
                        obj.status = EMPTY
                        obj.color = "INFO"
                    } else if (obj.ram.max < ram_hack) {
                        obj.status = NO_RAM
                        obj.color = "WARN"
                    } else {
                        obj.color = "OK"
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
                }
            } else if (!obj.port.met) {
                obj.status = PORT_LEVEL_LOW
            } else if (!obj.hack.met) {
                obj.status = HACK_LEVEL_LOW
            } else {
                obj.status = NOT_HACKED
            }

            if (skip_err && obj.color == "ERROR") {
                // Skip the error because we said we're skipping those...
            } else if (skip_empty && obj.access.backdoor && obj.money.perc == 0) {
                // Skip if already backdoor'd and has no value
            } else {
                ct_root_shown += obj.access.root ? 1 : 0
                ct_backdoor_shown += obj.access.backdoor ? 1 : 0
                ct_ports_shown += obj.port.met ? 1 : 0
                ct_hack_shown += obj.hack.met ? 1 : 0
                ct_value_avail_shown += obj.money.avail
                ct_value_max_shown += obj.money.max
                ct_hosts_shown += 1
                line(ns, obj)
            }

            ct_root += obj.access.root ? 1 : 0
            ct_backdoor += obj.access.backdoor ? 1 : 0
            ct_ports += obj.port.met ? 1 : 0
            ct_hack += obj.hack.met ? 1 : 0
            ct_value_avail += obj.money.avail
            ct_value_max += obj.money.max
        }

        //footer(ns, ct_root, ct_backdoor, ct_ports, ct_hack, ct_value_avail, ct_value_max, ct_hosts_shown, ct_hosts)
        footer(ns, ct_root_shown, ct_backdoor_shown, ct_ports_shown, ct_hack_shown, ct_value_avail_shown, ct_value_max_shown, ct_hosts_shown, ct_hosts)
    }
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

var w1 = 5; var w2 = 6; var w3 = 5; var w4 = 4; var w5_1 = 4; var w5_2 = 6; var w5_3 = 6; var w5 = (w5_1 + w5_2 + w5_3 + 6); var w6 = 12; var w7 = 10; var w8 = 20

function clearLog(ns) {
    ns.disableLog("ALL");
    ns.clearLog();
}

function header(ns) {
    ns.print(`| ${"level".padEnd(w1)} | ${"access".padEnd(w2)} | ${"ports".padEnd(w3)} | ${"hack".padEnd(w4)} | ${"value".padEnd(w5)} | ${"security".padEnd(w6)} | ${"status".padEnd(w7)} | ${"path".padEnd(w8)} |`);
    ns.print(`|=${"=".repeat(w1)}=|=${"=".repeat(w2)}=|=${"=".repeat(w3)}=|=${"=".repeat(w4)}=|=${"=".repeat(w5)}=|=${"=".repeat(w6)}=|=${"=".repeat(w7)}=|=${"=".repeat(w8)}=|`)
}

function line(ns, h) {
    var f1 = `${h.color}`.padStart(w1);
    var f2 = ((h.access.root ? " r" : "_") + " " + (h.access.backdoor ? "b " : "_ ")).padStart(w2);
    var f3 = `${h.port.left}`.padStart(w3);
    var f4 = `${h.hack.left}`.padStart(w4);
    var f5 = `${h.money.perc}%`.padStart(w5_1) + ` ${(formatUnitsV2(h.money.avail)).padStart(w5_2)} / ${formatUnitsV2(h.money.max).padStart(w5_3)}`;
    var f6 = ((`${('' + h.security.min).padStart(2)}. ${(h.security.diff).padStart(7)}`)).padStart(w6);
    var f7 = `${h.status}`.padStart(w7);
    var f8 = (`${('' + h.level).padStart(2)} > ${h.host}`).padEnd(w8);
    ns.print(`| ${f1} | ${f2} | ${f3} | ${f4} | ${f5} | ${f6} | ${f7} | ${f8} |`)
}

function footer(ns, total_rooted, total_backdoored, total_ported, total_hacked, total_money_avail, total_money_max, total_hosts_shown, total_hosts) {
    var f1 = ``.padStart(w1);
    var f2 = (`${total_rooted}`.padStart(2) + ' ' + `${total_backdoored}`.padStart(2)).padStart(w2);
    var f3 = `${total_ported}`.padStart(w3);
    var f4 = `${total_hacked}`.padStart(w4);
    var f5 = `${"".padStart(w5_1)} ${formatUnitsV2(total_money_avail)} / ${formatUnitsV2(total_money_max)}`.padStart(w5)
    var f6 = ``.padStart(w6)
    var f7 = ``.padStart(w7)
    var f8 = `Total Hosts: ${total_hosts_shown} / ${total_hosts}`.padStart(w8)
    ns.print(`|=${"=".repeat(w1)}=|=${"=".repeat(w2)}=|=${"=".repeat(w3)}=|=${"=".repeat(w4)}=|=${"=".repeat(w5)}=|=${"=".repeat(w6)}=|=${"=".repeat(w7)}=|=${"=".repeat(w8)}=|`)
    ns.print(`| ${f1} | ${f2} | ${f3} | ${f4} | ${f5} | ${f6} ${f7} ${f8} |`);
}

//======================================================================