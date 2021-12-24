import { writeFile } from 'fs/promises'
import http from 'http'
import { JikeClient } from 'jike-sdk/node'
import dayjs from 'dayjs'
import { program } from 'commander'
import handler from 'serve-handler'
import open from 'open'
import { version } from './package.json'

program
  .version(version)
  .requiredOption('-t, --token <token>', 'access token')
  .parse(process.argv)
const options = program.opts<{ token: string }>()

const client = new JikeClient({ accessToken: options.token })
const user = client.getSelf()
;(async () => {
  const follower = await user.queryFollowers({
    onNextPage: (page) => console.info(`获取第 ${page} 页被关注中...`),
  })

  let notifications = await client.queryNotifications({
    onNextPage: (page) => console.log(`获取第 ${page} 页通知中...`),
  })

  await writeFile(
    'notifications.json',
    JSON.stringify(notifications, undefined, 2)
  )

  notifications = notifications
    .filter((item) => item.actionItem.type === 'FOLLOW')
    .reverse()

  const results = []
  let count = 0
  for (const n of notifications) {
    const user = n.actionItem.users[0]

    const isFollow = follower.some((follower) => follower.id === user.id)
    if (isFollow) count += n.actionItem.usersCount

    const time = dayjs(n.createdAt).format('YYYY-MM-DD HH:mm:ss')
    results.push({
      time,
      name: user.screenName,
      isFollow,
      count,
    })
  }
  writeFile('data.json', JSON.stringify(results, undefined, 2))
  console.info('写入成功')

  const server = http.createServer((request, response) => {
    return handler(request, response)
  })

  server.listen(3800, () => console.log('请打开 http://localhost:3800'))
  await open('http://localhost:3800')
})()
