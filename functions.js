//======================================================================
// Clear Log
//======================================================================

export function clrLog(ns) {
    ns.disableLog("ALL");
    ns.clearLog();
}

//======================================================================
// Getting Faction Information
//======================================================================

export function getFactionInfo() {
    return [
        { "name": "CyberSec", "hack": "CSEC" },
        { "name": "Tian Di Hui", "city": ["Chongqing", "New Tokyo", "Ishima"], "hack-skill": 50, "money": 1000000 },
        { "name": "Netburners", "hack-skill": 80, "hacknet-levels": 100, "hacknet-ram": 8, "hacknet-cores": 4 },
        { "name": "NiteSec", "hack": "avmnite-02h", "home-ram": 32 },
        { "name": "The Black Hand", "hack": "I.I.I.I", "home-ram": 64 },
        { "name": "BitRunners", "hack": "run4theh111z", "home-ram": 128 },
        { "name": "Sector-12", "money": "15000000", "city": ["Sector-12"], "faction-exclusions": [] },
        { "name": "Chongqing", "money": "20000000,", "city": ["Chongqing"], "faction-exclusions": ["Sector-12", "Aevum", "Volhaven"] },
        { "name": "New Tokyo", "money": "20000000,", "city": ["New Tokyo"], "faction-exclusions": ["Sector-12", "Aevum", "Volhaven"] },
        { "name": "Ishima", "money": "30000000,", "city": ["Ishima"], "faction-exclusions": ["Sector-12", "Aevum", "Volhaven"] },
        { "name": "Aevum", "money": "40000000,", "city": ["Aevum"], "faction-exclusions": [] },
        { "name": "Volhaven", "money": "50000000,", "city": ["Volhaven"], "faction-exclusions": ["Sector-12", "Aevum", "New Tokyo", "Ishima", "Chongqing"] },
        { "name": "MegaCorp", "rep-company": "MegaCorp", "rep-value": 200000 },
        { "name": "Blade Industries", "rep-company": "Blade Industries", "rep-value": 200000 },
        { "name": "Four Sigma", "rep-company": "Four Sigma", "rep-value": 200000 },
        { "name": "KuaiGong International", "rep-company": "KuaiGong International", "rep-value": 200000 },
        { "name": "NWO", "rep-company": "NWO", "rep-value": 200000 },
        { "name": "OmniTek Incorporated", "rep-company": "OmniTek Incorporated", "rep-value": 200000 },
        { "name": "ECorp", "rep-company": "ECorp", "rep-value": 200000 },
        { "name": "Bachman & Associates", "rep-company": "Bachman & Associates", "rep-value": 200000 },
        { "name": "Clarke Incorporated", "rep-company": "Clarke Incorporated", "rep-value": 200000 },
        { "name": "Fulcrum Secret Technologies", "rep-company": "Fulcrum Secret Technologies", "rep-value": 200000, "hack": "fulcrumassets" },
        { "name": "Slum Snakes", "combat-stats": 30, "karma": -9, "money": 1000000 },
        { "name": "Tetrads", "city": ["Chongqing", "New Tokyo", "Ishima"], "combat-stats": 75, "karma": -18 },
        { "name": "Silhouette", "job": ["CTO", "CFO", "CEO"], "karma": -22, "money": 15000000 },
        { "name": "Speakers for the Dead", "hack-skill": 100, "combat-stats": 300, "killed": 30, "karma": -45, "money": 15000000 },
        { "name": "The Dark Army", "hack-skill": 300, "combat-stats": 300, "killed": 5, "karma": -45, "company-exclusions": ["CIA", "NSA"] },
        { "name": "The Syndicate", "hack-skill": 200, "combat-stats": 200, "city": ["Aevum", "Sector-12"], "money": 10000000, "karma": -90, "company-exclusions": ["CIA", "NSA"] },
        { "name": "The Covenant", "augmentations": 30, "money": 75000000000, "hack-skill": 850, "combat-stats": 850 },
        { "name": "Daedalus", "augmentations": 30, "money": 100000000000, "hack-skill": 2500, "combat-stats": 1500 },
        { "name": "Illuminati", "augmentations": 30, "money": 150000000000, "hack-skill": 1500, "combat-stats": 1200 }
    ]
}

//======================================================================
// Getting Player Information
//======================================================================

export function getPlayerInfo(ns) {
    var p = ns.getPlayer();

    var player = {
        "general": {
            "money": p.money,
            "location": { "city": p.city, "location": p.location },
            "playtime": { "total": p.totalPlaytime, "since_bitnode": p.playtimeSinceLastBitnode, "since_augment": p.playtimeSinceLastAug },
            "api": { "tix": p.hasTixApiAccess, "tor": p.tor, "wse": p.hasWseAccount, "4S_data": p.has4SData, "4S_data_api": p.has4SDataTixApi },
            "bitnode": p.bitNodeN
        },
        "stats": {
            "hp": { "curr": p.hp, "max": p.max_hp },
            "hacking": { "level": p.hacking, "exp": p.hacking_exp, "mult": p.hacking_mult, "exp_mult": p.hacking_exp_mult },
            "strength": { "level": p.strength, "exp": p.strength_exp, "mult": p.strength_mult, "exp_mult": p.strength_exp_mult },
            "defense": { "level": p.defense, "exp": p.defense_exp, "mult": p.defense_mult, "exp_mult": p.defense_exp_mult },
            "dexterity": { "level": p.dexterity, "exp": p.dexterity_exp, "mult": p.dexterity_mult, "exp_mult": p.dexterity_exp_mult },
            "agility": { "level": p.agility, "exp": p.agility_exp, "mult": p.agility_mult, "exp_mult": p.agility_exp_mult },
            "charisma": { "level": p.charisma, "exp": p.charisma_exp, "mult": p.charisma_mult, "exp_mult": p.charisma_exp_mult },
            "intelligence": { "level": p.intelligence }
        },
        "chance": {
            "hacking": { "chance_mult": p.hacking_chance_mult, "speed_mult": p.hacking_speed_mult, "money_mult": p.hacking_money_mult, "grow_mult": p.hacking_grow_mult }
        },
        "work": {
            "working": p.isWorking,
            "detail": { "company": p.companyName, "type": p.workType, "name": p.currentWorkFactionName, "desc": p.currentWorkFactionDescription }
        },
        "crime": {
            "type": p.crimeType,
            "money": { "mult": p.crime_money_mult },
            "chance": { "mult": p.crime_success_mult }
        },
        "factions": p.factions,
        "hacknet": {
            "money": { "mult": p.hacknet_node_money_mult },
            "purchase_cost": { "mult": p.hacknet_node_purchase_cost_mult },
            "ram_cost": { "mult": p.hacknet_node_ram_cost_mult },
            "core_cost": { "mult": p.hacknet_node_core_cost_mult },
            "level_cost": { "mult": p.hacknet_node_level_cost_mult }
        },
        "jobs": p.jobs,
        "raw": p
    }

    var remove_these = [
        "money", "city", "location", "numPeopleKilled",
        "bitNodeN", "totalPlaytime", "playtimeSinceLastBitnode", "playtimeSinceLastAug",
        "hasTixApiAccess", "tor", "hasWseAccount", "has4SData", "has4SDataTixApi",
        "hp", "max_hp",
        "hacking", "hacking_exp", "hacking_mult", "hacking_exp_mult",
        "strength", "strength_exp", "strength_mult", "strength_exp_mult",
        "defense", "defense_exp", "defense_mult", "defense_exp_mult",
        "dexterity", "dexterity_exp", "dexterity_mult", "dexterity_exp_mult",
        "agility", "agility_exp", "agility_mult", "agility_exp_mult",
        "charisma", "charisma_exp", "charisma_mult", "charisma_exp_mult",
        "intelligence",
        "hacking_chance_mult", "hacking_speed_mult", "hacking_money_mult", "hacking_grow_mult",
        "factions", "jobs",
        "isWorking", "workType", "currentWorkFactionName", "currentWorkFactionDescription",
        "crimeType", "crime_money_mult", "crime_success_mult",
        "hacknet_node_money_mult", "hacknet_node_purchase_cost_mult", "hacknet_node_ram_cost_mult", "hacknet_node_core_cost_mult", "hacknet_node_level_cost_mult"
    ]
    for (var i = 0; i < remove_these.length; i++) {
        var field = remove_these[i]
        delete p[field]
    }

    return player;
}

//======================================================================
// Getting Host Information
//======================================================================

export function getRAMInfo(ns, child_host) {
    var max = ns.getServerMaxRam(child_host)
    var used = ns.getServerUsedRam(child_host)
    return { "max": max, "used": used, "free": (max - used) }
}

export function getPorts(h) {
    var diff = h.numOpenPortsRequired - h.openPortCount;
    var met = diff <= 0;
    var left = met ? 0 : diff;
    var open = { "ftp": h.ftpPortOpen, "http": h.httpPortOpen, "ssh": h.sshPortOpen, "sql": h.sqlPortOpen, "smtp": h.smtpPortOpen }
    return { "have": h.openPortCount, "need": h.numOpenPortsRequired, "left": left, "met": met, "open": open };
}

export function getHackInfo(ns, h) {
    var have = ns.getHackingLevel();
    var need = h.requiredHackingSkill
    var diff = need - have;
    var met = diff <= 0;
    var left = met ? 0 : diff
    return { "have": have, "level": need, "left": left, "met": met }
}

export function getHostInfo(ns, child_host, level = 0) {
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
// Getting all host info
//======================================================================

export function explore(ns, hosts, parent_host, target_host, level) {
    ns.scan(target_host)
        .filter(child_host => child_host != parent_host)
        .forEach(child_host => {
            var obj = getHostInfo(ns, child_host, level);
            if (!obj.owned) {
                hosts.push(obj)
                explore(ns, hosts, target_host, child_host, (level + 1))
            }
        })
}

//======================================================================
// Formatting
//======================================================================
const UNITS_MONEY = [' ', 'k', 'm', 'b', 't', 'p', 'e', 'z', 'y']

export function formatUnits(initialValue) {
    var unit_i = 0
    var v = initialValue;
    while (v >= 1000) {
        unit_i += 1
        v = parseInt(v / 1000)
    }
    return `${v}${UNITS_MONEY[unit_i]}`;
}

export function formatUnitsV2(initialValue) {
    var unit_i = 0
    var v = initialValue.toFixed(3);

    while (v >= 1000.0) {
        unit_i += 1
        v = (v / 1000.0).toFixed(3)
    }

    v = parseFloat(v).toFixed(1)
    return `${v}${UNITS_MONEY[unit_i]}`;
}

    //======================================================================