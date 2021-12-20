import { writeFile } from 'fs/promises'
import http from 'http'
import { setAccessToken, api } from 'jike-sdk/node'
import dayjs from 'dayjs'
import { program } from 'commander'
import handler from 'serve-handler'
import open from 'open'
import { version } from './package.json'
import type { PaginationOption } from 'jike-sdk/node'

program
  .version(version)
  .requiredOption('-t, --token <token>', 'access token')
  .parse(process.argv)
const options = program.opts<{ token: string }>()

const getNotifications = async () => {
  let lastNotificationId = ''
  const data = []
  do {
    const option: PaginationOption | undefined = lastNotificationId
      ? { loadMoreKey: { lastNotificationId } }
      : undefined
    const result = (await api.notifications.list(option)).data
    lastNotificationId = result.loadMoreKey?.lastNotificationId
    data.push(...result.data)
    console.log('获取下一页...')
  } while (lastNotificationId)
  return data
}

const getAllFollowers = async (username: string) => {
  let createdAt = ''
  const data = []
  do {
    const result = (
      await api.userRelation.getFollowerList(username, {
        limit: 20,
        loadMoreKey: createdAt ? { createdAt } : undefined,
      })
    ).data
    createdAt = result.loadMoreKey?.createdAt
    data.push(...result.data)
  } while (createdAt)
  return data
}

;(async () => {
  setAccessToken(options.token)

  const profile = await api.users.profile()
  if (profile.status !== 200) {
    console.error((profile.data as any).error)
    return
  }
  const follower = await getAllFollowers(profile.data.user.username)

  const notifications = (await getNotifications())
    .filter((item) => item.actionItem.type === 'FOLLOW')
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    )
  const results = []
  let count = 0
  for (const n of notifications) {
    const user = n.actionItem.users[0]
    const isFollow = follower.some((follower) => follower.id === user.id)
    // if (!isFollow) continue
    count += n.actionItem.usersCount
    const time = dayjs(n.createdAt).format('YYYY-MM-DD HH:mm:ss')
    results.push({
      time,
      name: user.screenName,
      isFollow,
      count,
    })
  }
  writeFile('data.json', JSON.stringify(results))
  console.info('写入成功')

  const server = http.createServer((request, response) => {
    return handler(request, response)
  })

  server.listen(3800, () => console.log('请打开 http://localhost:3800'))
  await open('http://localhost:3800')
})()
