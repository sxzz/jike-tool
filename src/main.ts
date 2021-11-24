/* eslint-disable no-console */

import got from 'got'
import pLimit from 'p-limit'
import { program } from 'commander'
import pkg from '../package.json'
import type {
  LikedUsersRequest,
  LikedUsersResponse,
  Post,
  PostRequest,
  PostResponse,
  User,
} from './types'

program
  .version(pkg.version)
  .requiredOption('-u, --username <username>', 'username')
  .requiredOption('-t, --token <token>', 'access token')
  .parse(process.argv)
const options = program.opts<{ token: string; username: string }>()

const limit = pLimit(5)
const request = got.extend({
  prefixUrl: 'https://api.ruguoapp.com/1.0/',
  headers: {
    'x-jike-access-token': options.token,
  },
  responseType: 'json',
  http2: true,
})

const getPostsByUid = async (username: string) => {
  const posts: Post[] = []
  let lastId: string | undefined = undefined
  do {
    const data: PostRequest = {
      username,
      limit: 10000,
    }
    if (lastId) data.loadMoreKey = { lastId }
    const { body: resp } = await request.post<PostResponse>(
      'personalUpdate/single',
      { json: data }
    )
    lastId = resp.loadMoreKey?.lastId
    posts.push(...resp.data)
  } while (lastId)

  return posts
}

const getLikedUsers = async (postId: string) => {
  const users: User[] = []
  let loadMoreKey: string | undefined = undefined
  do {
    const data: LikedUsersRequest = {
      id: postId,
      limit: 10000,
    }
    if (loadMoreKey) data.loadMoreKey = loadMoreKey
    const { body: resp } = await request.post<LikedUsersResponse>(
      'originalPosts/listLikedUsers',
      { json: data }
    )
    loadMoreKey = resp.loadMoreKey
    users.push(...resp.data)
  } while (loadMoreKey)
  return users
}

;(async () => {
  const likes: Record<string, number> = {}

  const posts = await getPostsByUid(options.username)
  console.log(`获取到 ${posts.length} 个动态`)

  await Promise.all(
    posts.map((post) =>
      limit(async () => {
        const users = await getLikedUsers(post.id)
        for (const user of users) {
          if (likes[user.screenName] === undefined) {
            likes[user.screenName] = 1
          } else {
            likes[user.screenName]++
          }
        }
      })
    )
  )

  console.table(
    Object.entries(likes)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
  )
})()
