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

const getInstagramContent = async () => {
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
  logcat(chalk.blue(`➡️ Storing data into json file....`));
  let followersData = JSON.stringify(followers);
  let followingData = JSON.stringify(following);
  await Promise.all([
    fs.writeFile("./data/followers.json", followersData),
    fs.writeFile("./data/following.json", followingData),
  ]);
  logcat(chalk.blue(`➡️ Followers count: ${followers.length}`));
  logcat(chalk.blue(`➡️ Following count: ${following.length}`));
  logcat(chalk.green("Done!🎉"));
};

getInstagramContent();
