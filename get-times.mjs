#! /usr/bin/env node

import { readdirSync, readFileSync } from "fs";
import { join } from "path";

const folder = "./subs/season-02";
const files = readdirSync(folder);

const searchWords = [
  'second',
  'minute',
  'hour',
  'day',
  'week',
  'month',
  'year',
  'decade',
  'century',
  'centuries',
  'millennia',
  'millennium',
];

const thingsWeDontWant = [
  'second officer',
  'second-in-command',
  'second in command',
  'second-rate',
  'secondary',
  'any second',
  'per second',
  'hourly',
  'today',
  'yesterday',
  'someday',
  'some day',
  'every day',
  'one day',
  'mayday',
  'for days',
  'years old',
  'day to day',
  'those days',
  'day\'s work',
  'daydreaming',
  'for months',
  'light years',
  '-century',
];

for (const file of files) {
  const filePath = join(folder, file);
  const fileContent = readFileSync(filePath);
  const subs = fileContent.toString().split("\r\n\r\n");
  for (const sub of subs) {
    if (searchWords.some(term => (new RegExp(term, "i")).exec(sub))) {
      const [timestamp, ...lines] = sub.split("\r\n").slice(1);
      const c = [
        lines.join(" "),
        filePath,
        ...timestamp.split(" --> "),
      ];
      console.log(`["${c[0]}", "${c[1]}", "${c[2]}", "${c[3]}"],`);
    }
  }
}
