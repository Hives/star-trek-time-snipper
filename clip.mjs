#! /usr/bin/env node

import { readdirSync, readFileSync } from "fs"
import { join, resolve } from "path"
import { execSync } from "child_process"

/**
 * Represents a clip - episode title, start timestamp and end timestamp
 * @typedef {[string, string, string]} Clip
 */

/**
  * Zero-pads a number to two digits
  * @param {string | number} input 
  */
function twoDigits(input) {
  const inputString = String(input)
  if (inputString.length < 1) return '00'
  if (inputString.length < 2) return '0' + inputString
  return inputString
}

/**
  * Parses a timestamp string into an array of hours, minutes, seconds and milliseconds
  * @param {string} input 
  */
function parseTimestamp(input) {
  const [start, millis] = input.split(".")
  const [hours, minutes, seconds] = start.split(":")
  return [hours, minutes, seconds, millis].map(Number)
}

/**
  * Unparses an array of hours, minutes, seconds and milliseconds into a timestamp string
  * @param {[number, number, number, number]} input 
  */
function unparseTimestamp(input) {
  const [hours, minutes, seconds, millis] = input.map(twoDigits)
  return `${hours}:${minutes}:${seconds}.${millis}`
}

/**
  * Bumps a timestamp up or down by a number of seconds
  * @param {string} input 
  * @param {number} amount 
  */
function bump(input, amount) {
  let [hours, minutes, seconds, millis] = parseTimestamp(input)
  seconds += amount

  // -ve
  if (seconds < 0) {
    minutes = minutes - 1
    seconds = 60 + seconds
  }
  if (minutes < 0) {
    hours = hours - 1
    minutes = 60 + minutes
  }

  // +ve
  if (seconds > 59) {
    minutes = minutes + 1
    seconds = seconds - 60
  }
  if (minutes > 59) {
    hours = hours + 1
    minutes = minutes - 60
  }

  return unparseTimestamp([hours, minutes, seconds, millis])
}

/**
  * Runs an ffmpeg command to clip a segment from an episode
  * @param {Clip} clip 
  * @param {string} outputName 
  */
function snip(clip, outputName) {
  const [title, start, end] = clip
  const file = files.find(f => (new RegExp(title)).exec(f))
  if (!file) throw new Error(`Failed to find file for title ${title}`)
  const filePath = resolve(join(folder, file))
  const command =
    `ffmpeg -i "${filePath}" -ss ${bump(start, -10)} -to ${bump(end, 10)} -c:v copy -c:a copy -fflags +genpts clips/${outputName}.mp4`
  // console.log(command)
  execSync(command)
}

const clipsFile = readFileSync("./output.json")

const clips = JSON.parse(clipsFile.toString()).map(clip => {
  const [_, subsFile, start, end] = clip
  const title = subsFile.split("/").at(-1).split(" - ").at(-1).split(".")[0].split("  ")[0]
  return [title, start.replace(",", "."), end.replace(",", ".")]
})

const folder = "../../Downloads/Star\ Trek\ TNG\ S01\ 1080P/"
const files = readdirSync(folder)

const farpointClips = clips.filter(([title]) => title.includes("Farpoint"))

let c = 0;
for (const clip of farpointClips) {
  snip(clip, `farpoint-${c}`)
  c++
}
