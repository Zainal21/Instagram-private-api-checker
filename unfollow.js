// module import
import "dotenv/config";
import fs from "fs/promises";
import { IgApiClient } from "instagram-private-api";
import chalk from "chalk";

const { IG_USERNAME = "", IG_PASSWORD = "" } = process.env;
const logcat = console.log;

const getAllItemsFromFeed = async (feed) => {
  let items = [];
  do {
    const feedItems = await feed.items();
    items = items.concat(feedItems);
  } while (feed.isMoreAvailable());
  return items;
};

const unfollowUsers = async () => {
  logcat(chalk.blue(`Setup Instagram Client...➡️`));
  const ig = new IgApiClient();
  ig.state.generateDevice(IG_USERNAME);
  await ig.simulate.preLoginFlow();

  if (!IG_USERNAME || !IG_PASSWORD)
    logcat(chalk.red(`➡️ Username or Password must be set in .env file`));

  logcat(chalk.blue(`➡️ Authenticating into ${IG_USERNAME} account...`));
  const credentials = await ig.account.login(IG_USERNAME, IG_PASSWORD);
  const followersFeed = ig.feed.accountFollowers(credentials.pk);
  const followingFeed = ig.feed.accountFollowing(credentials.pk);

  logcat(chalk.blue(`➡️ Getting followers/following....`));
  const [followers, following] = await Promise.all([
    getAllItemsFromFeed(followersFeed),
    getAllItemsFromFeed(followingFeed),
  ]);

  // list user name map that follow me
  const followersUsername = new Set(followers.map(({ username }) => username));

  const notFollowing = following.filter(
    ({ username }) => !followersUsername.has(username)
  );
  logcat(chalk.blue(`➡️ unfollow instagram account....`));
  for (const user of notFollowing) {
    await ig.friendship.destroy(user.pk);
    console.log(`unfollowed ${user.username}`);
    const time = Math.round(Math.random() * 6000) + 1000;
    await new Promise((resolve) => setTimeout(resolve, time));
  }

  logcat(chalk.green("Unfollow user Done!🎉"));
};

unfollowUsers();
