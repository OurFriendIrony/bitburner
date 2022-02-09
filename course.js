import { clrLog, getHostInfo } from "functions.js";

/** @param {NS} ns **/
export async function main(ns) {
    clrLog(ns)
    ns.universityCourse("rothman university", "algorithms", false)
}