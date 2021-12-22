import { readFile, writeFile } from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import md5 from 'md5'
import { JikeClient, JikePost, limit, ApiOptions } from 'jike-sdk/node'
import { countBy } from 'lodash-es'
import dayjs from 'dayjs'
import sharp from 'sharp'
import schedule from 'node-schedule'
import log from 'fancy-log'
import config from './config.json'
import type { Entity } from 'jike-sdk/node'
import type * as ShellJS from 'shelljs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const YEAR = 2021
const pathPng = path.resolve(__dirname, 'pngOut')
const pathOutput = path.resolve(__dirname, 'OUT_FOLDER')

process.on('unhandledRejection', (reason, promise) => {
  log.error('Unhandled Rejection')
  console.error(reason)
  console.error(promise)
})

const client = new JikeClient(
  { accessToken: 'ERROR', refreshToken: config.refreshToken },
  { deviceId: config.deviceId, idfv: config.idfv }
)

let isRunning = false
const task = async () => {
  if (isRunning) return
  log.info('开始运行...')
  isRunning = true
  await run()
  isRunning = false

  await writeFile(
    './config.json',
    JSON.stringify({
      ...config,
      refreshToken: client.refreshToken,
    })
  )

  log.info('运行完毕...')
}

let shelljs: typeof ShellJS
;(async () => {
  shelljs = await import('shelljs').then((m) => m.default)
  if (!shelljs.which('github_poster')) {
    log.error(
      '请先安装 github_poster，文档：https://github.com/yihong0618/GitHubPoster#pip-%E5%AE%89%E8%A3%85'
    )
    process.exit(1)
  }
  shelljs.mkdir('-p', pathPng)

  schedule.scheduleJob('*/20 * * * *', task)
  task()
})()

async function run() {
  const notifications = (
    await client.queryNotifications({
      limit: limit.limitAfterTime('createdAt', new Date('2021-12-22 22:00:00')),
      onNextPage: (page) => log.info(`正在获取第 ${page} 页通知...`),
    })
  ).filter(
    (n) =>
      n.actionType === 'MENTION' &&
      n.actionItem.status === 'NORMAL' &&
      (n.actionItem as any).sourceType !== 'COMMENT'
  )
  await writeFile(
    './notifications.json',
    JSON.stringify(notifications),
    'utf-8'
  )

  for (const notification of notifications) {
    try {
      await reply(notification)
    } catch (err) {
      console.log(err)
    }
  }
}

async function generate(user: Entity.SimpleUser) {
  const encodedFilename = user.screenName
    .replaceAll('/', '')
    .replaceAll('\\', '')
  const svgFile = path.resolve(pathOutput, `${encodedFilename}.svg`)
  const pngFile = path.resolve(pathPng, `${svgFile}.png`)

  log.info(`正在生成 @${user.screenName}...`)

  log.info(`获取数据中...`)
  const posts = await client.getUser(user.username).queryPersonalUpdate()

  const counts = countBy(posts, (p) =>
    dayjs(p.getDetail().createdAt).format('YYYY-MM-DD')
  )
  await writeFile('./data.json', JSON.stringify(counts, undefined, 2), 'utf-8')
  log.info(`生成中...`)

  const command = `github_poster json --json_file ./data.json --year ${YEAR} --me "${user.screenName}" --track-color "#9ee9ac" --special-color1 "#ffe411" --special-color2 "#fff395"`
  log.info(command)
  shelljs.exec(command)

  shelljs.mv(path.resolve(__dirname, 'OUT_FOLDER/json.svg'), svgFile)

  await sharp(svgFile, { density: 200 })
    .resize(1920, 1080, {
      fit: 'contain',
      background: '#222',
    })
    .png()
    .toFile(pngFile)
  log.info(`生成成功! ${pngFile}`)

  return {
    imagePath: pngFile,
    total: posts.length,
    yearTotal: posts.filter(
      (p) => new Date(p.getDetail().createdAt).getTime() > 1609430400000
    ).length,
  }
}

async function reply(notification: Entity.Notification) {
  const user = notification.actionItem.users[0]
  if (user.screenName === '夏天好热啊') return

  const { sourceType } = notification.actionItem as any
  const post = new JikePost(
    client,
    sourceType === 'ORIGINAL_POST'
      ? ApiOptions.PostType.ORIGINAL
      : ApiOptions.PostType.REPOST,
    notification.actionItem.id
  )
  const comments = await post.queryComments()
  if (comments.some((c) => c.content.includes('机器人来啦～'))) return

  const { imagePath, total, yearTotal } = await generate(user)
  const image = await readFile(imagePath)
  const tokenResult = await client.apiClient.upload.token(md5(image))
  const token = tokenResult.data.uptoken

  const { key } = await client.apiClient.upload.upload(image, token)
  const content = `🤖️ 机器人来啦～ @${user.screenName} 一共发了 ${total} 条动态，其中今年发了 ${yearTotal} 条 😆`

  log.info(notification.actionItem.content)
  log.info(content)

  await post.addComment(content, {
    pictureKeys: [key],
  })
}
