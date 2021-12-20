import path from 'path'
import { writeFile } from 'fs/promises'
import { fileURLToPath } from 'url'
import { setAccessToken, api } from 'jike-sdk/node'
import { program } from 'commander'
import { countBy } from 'lodash-es'
import dayjs from 'dayjs'
import { version } from './package.json'

program
  .version(version)
  .requiredOption('-t, --token <token>', 'access token')
  .requiredOption('-u, --username <username>', 'username')
  .parse(process.argv)
const options = program.opts<{ token: string; username: string }>()

const __dirname = path.dirname(fileURLToPath(import.meta.url))

;(async () => {
  const { which, exec, mv } = await import('shelljs').then((m) => m.default)
  if (!which('github_poster')) {
    console.error(
      '请先安装 github_poster，文档：https://github.com/yihong0618/GitHubPoster#pip-%E5%AE%89%E8%A3%85'
    )
    process.exit(1)
  }

  setAccessToken(options.token)

  const profile = await api.users.profile(options.username)
  if (profile.status !== 200) {
    console.error((profile.data as any).error)
    return
  }

  console.info(`Hello, @${profile.data.user.screenName}`)
  console.info(`获取数据中...`)

  const posts = await api.personalUpdate.single(options.username, {
    limit: 50000,
  })
  const counts = countBy(posts.data.data, (p) =>
    dayjs(p.createdAt).format('YYYY-MM-DD')
  )
  await writeFile('./data.json', JSON.stringify(counts, undefined, 2))
  console.info(`生成中...`)
  exec(
    `github_poster json --json_file ./data.json --year 2021 --with-animation --me ${profile.data.user.screenName}`
  )
  const filename = `OUT_FOLDER/${profile.data.user.screenName}.svg`
  const output = path.resolve(__dirname, filename)
  mv(path.resolve(__dirname, 'OUT_FOLDER/json.svg'), output)
  console.info(`生成成功! 请查看 ${output}`)
})()
