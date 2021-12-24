import { writeFile } from 'fs/promises'
import { JikeClient } from 'jike-sdk/node'
import config from './config.json'

const client = new JikeClient(
  { refreshToken: config.refreshToken },
  { ...config }
)

;(async () => {
  const followers = await client.getSelf().queryFollowersWithTime({
    onNextPage: (p) => console.info(`正在获取第 ${p} 个关注者`),
  })
  await writeFile(
    'followers-with-time.json',
    JSON.stringify(followers, undefined, 2)
  )
})()
