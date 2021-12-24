import { writeFile } from 'fs/promises'
import { JikeClient } from 'jike-sdk/node'
import { program } from 'commander'
import { version } from './package.json'
import followers from './data.json'

program
  .version(version)
  .requiredOption('-t, --token <token>', 'access token')
  .parse(process.argv)
const options = program.opts<{ token: string }>()

const client = new JikeClient({ accessToken: options.token })
const user = client.getSelf()

;(async () => {
  const followings = await user.queryFollowings()
  const unfollowers = followers.filter((f) => !f.isFollow)

  await writeFile(
    'unfollowers.json',
    JSON.stringify(
      unfollowers.map((u) => u.name),
      undefined,
      2
    )
  )

  const users = unfollowers
    .filter((u) => followings.some((f) => f.screenName === u.name))
    .map((u) => u.name)
  console.log(users)
})()
