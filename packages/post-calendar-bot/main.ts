import { readFile, writeFile } from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import inquirer from 'inquirer'
import md5 from 'md5'
import { JikeClient, JikePost, limit, ApiOptions } from 'jike-sdk/node'
import { program } from 'commander'
import { countBy } from 'lodash-es'
import dayjs from 'dayjs'
import sharp from 'sharp'
import { version } from './package.json'
import type { Entity } from 'jike-sdk/node'
import type * as ShellJS from 'shelljs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const YEAR = 2021
const pathPng = path.resolve(__dirname, 'pngOut')
const pathOutput = path.resolve(__dirname, 'OUT_FOLDER')

program
  .version(version)
  .requiredOption('-t, --token <token>', 'access token')
  .parse(process.argv)
const options = program.opts<{ token: string }>()

const client = new JikeClient({
  accessToken: options.token,
})

let shelljs: typeof ShellJS
;(async () => {
  shelljs = await import('shelljs').then((m) => m.default)
  if (!shelljs.which('github_poster')) {
    console.error(
      '请先安装 github_poster，文档：https://github.com/yihong0618/GitHubPoster#pip-%E5%AE%89%E8%A3%85'
    )
    process.exit(1)
  }
  shelljs.mkdir('-p', pathPng)

  const notifications = (
    await client.queryNotifications({
      limit: limit.limitAfterTime('createdAt', new Date('2021-12-22 06:21:00')),
      onNextPage: (page) => console.log(`正在获取第 ${page} 页通知...`),
    })
  ).filter(
    (n) =>
      n.actionType === 'MENTION' &&
      n.actionItem.status === 'NORMAL' &&
      (n.actionItem as any).sourceType !== 'COMMENT'
  )

  for (const notification of notifications) {
    await reply(notification)
  }
})()

async function generate(user: Entity.SimpleUser) {
  const pngFile = path.resolve(pathPng, `${user.screenName}.png`)

  console.info(`正在生成 @${user.screenName}...`)

  console.info(`获取数据中...`)
  const posts = await client.getUser(user.username).queryPersonalUpdate()

  const counts = countBy(posts, (p) =>
    dayjs(p.getDetail().createdAt).format('YYYY-MM-DD')
  )
  await writeFile('./data.json', JSON.stringify(counts, undefined, 2))
  console.info(`生成中...`)

  shelljs.exec(
    `github_poster json --json_file ./data.json --year ${YEAR} --me ${user.screenName} --track-color "#9ee9ac" --special-color1 "#fff" --special-color2 "#ffe411"`
  )
  const svgFile = path.resolve(pathOutput, `${user.screenName}.svg`)
  shelljs.mv(path.resolve(__dirname, 'OUT_FOLDER/json.svg'), svgFile)

  await sharp(svgFile, { density: 200 })
    .resize(1920, 1080, {
      fit: 'contain',
      background: '#222',
    })
    .png()
    .toFile(pngFile)
  console.info(`生成成功! 请查看 ${pngFile}`)

  return {
    imagePath: pngFile,
    total: posts.length,
    yearTotal: posts.filter(
      (p) => new Date(p.getDetail().createdAt).getTime() > 1609430400000
    ).length,
  }
}

async function reply(notification: Entity.Notification) {
  const { sourceType } = notification.actionItem as any
  const post = new JikePost(
    client,
    sourceType === 'ORIGINAL_POST'
      ? ApiOptions.PostType.ORIGINAL
      : ApiOptions.PostType.REPOST,
    notification.actionItem.id
  )
  const comments = await post.queryComments()
  if (comments.some((c) => c.content.includes('机器人来啦～'))) {
    return
  }

  const user = notification.actionItem.users[0]
  const { imagePath, total, yearTotal } = await generate(user)
  const image = await readFile(imagePath)
  const tokenResult = await client.apiClient.upload.token(md5(image))
  const token = tokenResult.data.uptoken

  const { key } = await client.apiClient.upload.upload(image, token)
  const content = `🤖️ 机器人来啦～ @${user.screenName} 一共发了 ${total} 条动态，其中今年发了 ${yearTotal} 条 😆`

  console.info(notification.actionItem)
  console.info(content)
  const answers = await inquirer.prompt({
    type: 'confirm',
    name: 'confirm',
  })
  if (!answers.confirm) return

  await post.addComment(content, {
    pictureKeys: [key],
  })
}
