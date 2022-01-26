var w1 = 5, w2 = 30, w3 = 60;

import { clrLog, getHostInfo, getFactionInfo, getPlayerInfo } from "functions.js";

/** @param {NS} ns **/
export async function main(ns) {
    var factions = getFactionInfo()

    while (true) {
        clrLog(ns)
        var player = getPlayerInfo(ns)

        header(ns)
        for (var i = 0; i < factions.length; i++) {
            var home = getHostInfo(ns, "home")
            var hacknet_level = ns.hacknet.getNodeStats(0).level
            var hacknet_ram = ns.hacknet.getNodeStats(0).ram
            var hacknet_cores = ns.hacknet.getNodeStats(0).cores

            var faction = factions[i]
            var level = "?"
            var msg = "?"

            if (player['factions'].includes(faction['name'])) { level = "INFO"; msg = "---" }
            else if ("faction-exclusions" in faction && faction['faction-exclusions'].some(item => player['factions'].includes(item))) { level = "ERROR"; msg = `Can't be in: ${faction['faction-exclusions'].join(', ')}` }
            else if ("money" in faction && player['general']['money'] < faction['money']) { level = "WARN"; msg = `Money: ${faction['money']}` }
            else if ("hack-skill" in faction && player['stats']['hacking']['level'] < faction['hack-skill']) { level = "WARN"; msg = `Hack Skill: ${faction['hack-skill']}` }
            else if ("city" in faction && !faction['city'].includes(player['general']['location']['city'])) { level = "WARN"; msg = `Relocate to: ${faction['city'].join(', ')}` }
            else if ("home-ram" in faction && home['ram']['max'] < faction['home-ram']) { level = "WARN"; msg = `Home RAM: ${faction['home-ram']}` }
            else if ("hacknet-levels" in faction && hacknet_level < faction['hacknet-level']) { level = "WARN"; msg = `Hacknet Level: ${faction['hacknet-level']}` }
            else if ("hacknet-ram" in faction && hacknet_ram < faction['hacknet-ram']) { level = "WARN"; msg = `Hacknet RAM: ${faction['hacknet-ram']}` }
            else if ("hacknet-cores" in faction && hacknet_cores < faction['hacknet-cores']) { level = "WARN"; msg = `Hacknet cores: ${faction['hacknet-cores']}` }
            else if ("rep-company" in faction && player['work']['detail']['company'] != faction['rep-company']) { level = "WARN"; msg = `Company: ${faction['rep-company']}` }
            else if ("rep-value" in faction) { level = "WARN"; msg = `${faction['rep-company']} Rep: ${faction['rep-value']}` }
            else {
                level = "OK"
                if ("hack" in faction) { msg = `Available (Hack ${faction['hack']})` }
                else { msg = "Available" }
            }
            // "combat-stats": 30,
            // "karma": -9,
            // "job": [
            // "CTO",
            // "CFO",
            // "CEO"
            // ],
            // "killed": 30,
            // "company-exclusions": [
            // "CIA",
            // "NSA"
            // ]
            // "augmentations": 30,
            // "money": 75000000000,

            prnt(ns, level, faction.name, msg)
        }
        await ns.sleep(5000)
    }
}

function header(ns) {
    ns.print(`| ${"".padStart(w1)} | ${"NAME".padStart(w2)} | ${"REASON".padStart(w3)} |`)
    ns.print(`|=${"=".repeat(w1)}=|=${"=".repeat(w2)}=|=${"=".repeat(w3)}=|`)
}

function prnt(ns, level, faction, msg) {
    ns.print(`| ${level.padStart(w1)} | ${faction.padStart(w2)} | ${msg.padEnd(w3)} |`)
}