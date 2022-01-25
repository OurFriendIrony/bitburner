/** @param {NS} ns **/
export async function main(ns) {
    var player = ns.getPlayer();
    var playerFormatted = fmt(player)
    prnt(ns, playerFormatted, 0)
}

function prnt(ns, obj, level) {
    var ind = (''.padStart(level * 2))
    for (const field in obj) {
        var value = obj[field]
        if (typeof value === 'object') {
            ns.tprint(`${ind}${field}:`)
            prnt(ns, value, (level + 1))
        } else {
            ns.tprint(`${ind}${field}: ${value}`)
        }
    }
}

function fmt(o) {
    var newO = {
        "player": {
            "general": {
                "money": o.money,
                "location": { "city": o.city, "location": o.location },
                "playtime": { "total": o.totalPlaytime, "since_bitnode": o.playtimeSinceLastBitnode, "since_augment": o.playtimeSinceLastAug },
                "api": { "tix": o.hasTixApiAccess, "tor": o.tor, "wse": o.hasWseAccount, "4S_data": o.has4SData, "4S_data_api": o.has4SDataTixApi },
                "bitnode": o.bitNodeN
            },
            "stats": {
                "hp": { "curr": o.hp, "max": o.max_hp },
                "hacking": { "level": o.hacking, "exp": o.hacking_exp, "mult": o.hacking_mult, "exp_mult": o.hacking_exp_mult },
                "strength": { "level": o.strength, "exp": o.strength_exp, "mult": o.strength_mult, "exp_mult": o.strength_exp_mult },
                "defense": { "level": o.defense, "exp": o.defense_exp, "mult": o.defense_mult, "exp_mult": o.defense_exp_mult },
                "dexterity": { "level": o.dexterity, "exp": o.dexterity_exp, "mult": o.dexterity_mult, "exp_mult": o.dexterity_exp_mult },
                "agility": { "level": o.agility, "exp": o.agility_exp, "mult": o.agility_mult, "exp_mult": o.agility_exp_mult },
                "charisma": { "level": o.charisma, "exp": o.charisma_exp, "mult": o.charisma_mult, "exp_mult": o.charisma_exp_mult },
                "intelligence": { "level": o.intelligence }
            },
            "chance": {
                "hacking": { "chance_mult": o.hacking_chance_mult, "speed_mult": o.hacking_speed_mult, "money_mult": o.hacking_money_mult, "grow_mult": o.hacking_grow_mult }
            },
            "work": {
                "working": o.isWorking,
                "detail": { "company": o.companyName, "type": o.workType, "name": o.currentWorkFactionName, "desc": o.currentWorkFactionDescription }
            },
            "crime": {
                "type": o.crimeType,
                "money": { "mult": o.crime_money_mult },
                "chance": { "mult": o.crime_success_mult }
            },
            "factions": o.factions,
            "hacknet": {
                "money": { "mult": o.hacknet_node_money_mult },
                "purchase_cost": { "mult": o.hacknet_node_purchase_cost_mult },
                "ram_cost": { "mult": o.hacknet_node_ram_cost_mult },
                "core_cost": { "mult": o.hacknet_node_core_cost_mult },
                "level_cost": { "mult": o.hacknet_node_level_cost_mult }
            },
            "raw": o
        }
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
        "factions",
        "isWorking", "workType", "currentWorkFactionName", "currentWorkFactionDescription",
        "crimeType", "crime_money_mult", "crime_success_mult",
        "hacknet_node_money_mult", "hacknet_node_purchase_cost_mult", "hacknet_node_ram_cost_mult", "hacknet_node_core_cost_mult", "hacknet_node_level_cost_mult"
    ]
    for (var i = 0; i < remove_these.length; i++) {
        var field = remove_these[i]
        delete o[field]
    }

    return newO;
}