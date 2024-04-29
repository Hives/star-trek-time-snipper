#! /usr/bin/env node

import { readdirSync, readFileSync, existsSync } from "fs"
import { join, resolve } from "path"
import { execSync } from "child_process"

/**
 * Represents a clip - episode title, episode number, start timestamp, end timestamp
 * @typedef {[string, string, string, string]} Clip
 */

/**
  * Zero-pads a string. If string is longer than requested length, returns the string.
  * @param {string | number} input
  * @param {number} length
  */
function zeroPad(input, length) {
  const inputString = String(input)

  const zerosRequired = length - inputString.length
  if (zerosRequired < 0) return inputString

  const zeroString = "0".repeat(zerosRequired)

  return zeroString + inputString
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
  const [hours, minutes, seconds, millis] = input.map(n => zeroPad(n, 2))
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
  * @param {number} index
  */
function snip(clip, index) {
  const [title, episode, start, end] = clip
  const file = files.find(f => (new RegExp(title, "i")).exec(f))
  if (!file) throw new Error(`Failed to find file for title ${title}`)

  const inputFilePath = resolve(join(folder, file))

  const outputFilePath = `clips/${episode}-${zeroPad(index, 4)}.mp4`
  if (existsSync(outputFilePath)) return

  const command =
    `~/Downloads/ffmpeg-git-20240301-i686-static/ffmpeg -ss ${bump(start, -5)} -to ${bump(end, 10)} -i "${inputFilePath}" -c:v copy -c:a copy ${outputFilePath}`
  // console.log(command)
  execSync(command)
}

const clipsFile = readFileSync("./output.json")

const clips = JSON.parse(clipsFile.toString()).map(clip => {
  const [_, subsFile, start, end] = clip
  const fileName = subsFile.split("/").at(-1)
  const title = fileName.split(" - ").at(-1).split(".")[0].split("  ")[0]
  const episode = fileName.split(" - ")[1]
  return [title, episode, start.replace(",", "."), end.replace(",", ".")]
})

const folder = "../../Downloads/Star\ Trek\ TNG\ S01\ 1080P/"
const files = readdirSync(folder)

for (const [index, clip] of clips.entries()) {
  snip(clip, index)
}
