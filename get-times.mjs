import { readdirSync, readFileSync, writeFileSync } from "fs"
import { join } from "path"

const folder = "./subs/season-01"
const files = readdirSync(folder)

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
  'millennium'
]

for (const file of files) {
  const filePath = join(folder, file)
  const fileContent = readFileSync(filePath)
  const subs = fileContent.toString().split("\r\n\r\n")
  for (const sub of subs) {
    if (searchWords.some(term => (new RegExp(term, "i")).exec(sub))) {
      const [timestamp, ...lines] = sub.split("\r\n").slice(1)
      const c = [
        lines.join(" "),
        filePath,
        ...timestamp.split(" --> "),
      ]
      console.log(`["${c[0]}", "${c[1]}", "${c[2]}", "${c[3]}"],`)
    }
  }
}
