import path from 'path'
import { writeFile } from 'fs/promises'
import { fileURLToPath } from 'url'
import { JikeClient } from 'jike-sdk/node'
import { program } from 'commander'
import { countBy } from 'lodash-es'
import dayjs from 'dayjs'
import sharp from 'sharp'
import { version } from './package.json'

program
  .version(version)
  .requiredOption('-t, --token <token>', 'access token')
  .requiredOption('-u, --username <username>', 'username')
  .parse(process.argv)
const options = program.opts<{ token: string; username: string }>()

const YEAR = 2021
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const client = new JikeClient({
  accessToken: options.token,
})

;(async () => {
  const { which, exec, mv } = await import('shelljs').then((m) => m.default)
  if (!which('github_poster')) {
    console.error(
      '请先安装 github_poster，文档：https://github.com/yihong0618/GitHubPoster#pip-%E5%AE%89%E8%A3%85'
    )
    process.exit(1)
  }
  const user = client.getUser(options.username)

  const profile = await user.queryProfile()
  const screenName = profile.user.screenName

  console.info(`获取 @${screenName} 的动态中...`)

  const posts = await client.getUser(options.username).queryPersonalUpdate()
  const counts = countBy(posts, (p) =>
    dayjs(p.getDetail().createdAt).format('YYYY-MM-DD')
  )
  await writeFile('./data.json', JSON.stringify(counts, undefined, 2))

  console.info(`生成图片中...`)
  exec(
    `github_poster json --json_file ./data.json --year ${YEAR} --me ${screenName} --track-color "#9ee9ac" --special-color1 "#fff" --special-color2 "#ffe411"`
  )

  const pathOut = path.resolve(__dirname, 'OUT_FOLDER')
  const svgFile = path.resolve(pathOut, `${screenName}.svg`)
  const pngFile = path.resolve(pathOut, `${screenName}.png`)
  mv(path.resolve(pathOut, 'json.svg'), svgFile)

  await sharp(svgFile, { density: 200 })
    .resize(1920, 1080, {
      fit: 'contain',
      background: '#222',
    })
    .png()
    .toFile(pngFile)

  console.info(`生成成功! 请查看 ${pngFile}`)
})()
