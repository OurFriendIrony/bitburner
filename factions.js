var w1 = 5, w2 = 30, w3 = 60;

import { clrLog, getHostInfo, getFactionInfo, getPlayerInfo, formatUnits } from "functions.js";

/** @param {NS} ns **/
export async function main(ns) {
    ns.tail()
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
            else if ("company-exclusions" in faction && faction['company-exclusions'].some(item => { return player['jobs'].hasOwnProperty(item) })) { level = "ERROR"; msg = `Can't be in: ${faction['company-exclusions'].join(', ')}` }
            else if ("rep-company" in faction && player['work']['detail']['company'] != faction['rep-company']) { level = "WARN"; msg = `Company: ${faction['rep-company']}` }
            else if ("rep-value" in faction) { level = "WARN"; msg = `${faction['rep-company']} Rep: ${formatUnits(faction['rep-value'])}` }
            else if ("job" in faction && !faction['job'].some((item) => { return Object.values(player['jobs']).includes(item) })) { level = "WARN"; msg = `Job: ${faction['job'].join(', ')}` }
            else if ("money" in faction && player['general']['money'] < faction['money']) { level = "WARN"; msg = `Money: ${formatUnits(faction['money'])}` }
            else if ("hack-skill" in faction && player['stats']['hacking']['level'] < faction['hack-skill']) { level = "WARN"; msg = `Hack Skill: ${faction['hack-skill']}` }
            else if ("combat-skill" in faction && (
                player['stats']['strength']['level'] < faction['combat-skill']
                || player['stats']['defence']['level'] < faction['combat-skill']
                || player['stats']['dexterity']['level'] < faction['combat-skill']
                || player['stats']['agility']['level'] < faction['combat-skill']
            )) {
                level = "WARN"
                msg = `Combat Skills: ${faction['combat-skill']}`
            } else if ("home-ram" in faction && home['ram']['max'] < faction['home-ram']) { level = "WARN"; msg = `Home RAM: ${faction['home-ram']}` }
            else if ("hacknet-levels" in faction && hacknet_level < faction['hacknet-level']) { level = "WARN"; msg = `Hacknet Level: ${faction['hacknet-level']}` }
            else if ("hacknet-ram" in faction && hacknet_ram < faction['hacknet-ram']) { level = "WARN"; msg = `Hacknet RAM: ${faction['hacknet-ram']}` }
            else if ("hacknet-cores" in faction && hacknet_cores < faction['hacknet-cores']) { level = "WARN"; msg = `Hacknet cores: ${faction['hacknet-cores']}` }
            else if ("city" in faction && !faction['city'].includes(player['general']['location']['city'])) { level = "WARN"; msg = `Relocate to: ${faction['city'].join(', ')}` }
            else if ("karma" in faction) { level = "WARN"; msg = `Karma: ${faction['karma']}` }
            else if ("killed" in faction) { level = "WARN"; msg = `Killed: ${faction['killed']}` }
            else if ("augmentations" in faction) { level = "WARN"; msg = `Augmentations: ${faction['augmentations']}` }
            else {
                level = "OK"
                if ("hack" in faction) { msg = `Available (Hack ${faction['hack']})` }
                else { msg = "Available" }
            }
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