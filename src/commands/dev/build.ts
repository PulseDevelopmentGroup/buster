import { Command, CommandoMessage } from "discord.js-commando";
import { env, setupCommand } from "../../config";
import { GH_ACTIONS_OVERVIEW_URL, PACKAGE_URL } from "../../constants";
import got from "got";
import cmp from "semver-compare";

export default class BuildCommand extends Command {
  constructor(client: any) {
    super(
      client,
      setupCommand({
        name: "build",
        group: "dev",
        memberName: "build",
        description: "Trigger a GitHub Actions Build",
        ownerOnly: true,
        args: [
          {
            key: "force",
            prompt: "force the build?",
            type: "string",
            oneOf: ["force", "sendit", "idiot"],
            error: "that does not seem to be a valid option",
            default: "",
          },
        ],
      })
    );
  }

  async run(msg: CommandoMessage, { force }: { force: string }) {
    if (!env.githubApiKey) {
      return msg.reply("no GitHub API key specified. Exiting.");
    }

    if (force) {
      return this.triggerBuild()
        .then(() => {
          return msg.reply(
            `build forced! You can view the build status here: ${GH_ACTIONS_OVERVIEW_URL}`
          );
        })
        .catch(() => {
          return msg.reply(`Problem triggering build, probably a bad API key?`);
        });
    }

    const packageVersion = JSON.parse((await got.get(PACKAGE_URL)).body)[
      "version"
    ];

    switch (cmp(packageVersion, env.version)) {
      // Current version is newer than package version
      case -1:
        return msg.reply(
          `\`package.json\` has version \`${packageVersion}\`, which is older than the current version of the bot. 
            
            This probably means an update was merged to main without updating the version in \`package.json\`. Please update accordingly before building.

            _If this intentional, run with \`${msg.command} force\` to build anyway with version: \`${packageVersion}\`, this may break things._`
        );

      // Current version is the same as package version
      case 0:
        return msg.reply(
          `\`package.json\` has version ${packageVersion}, which matches the current version of the bot. 
            
          _If this intentional, run with \`${msg.command} force\` to build anyway with version: \`${packageVersion}\`, this may break things._`
        );

      // Current version is older than package version
      case 1:
        return this.triggerBuild()
          .then(() => {
            return msg.reply(
              `building... You can view the build status here: ${GH_ACTIONS_OVERVIEW_URL}`
            );
          })
          .catch(() => {
            return msg.reply(
              `problem triggering build, probably a bad API key?`
            );
          });
    }
  }

  triggerBuild(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      got
        .post(
          `https://api.github.com/repos/PulseDevelopmentGroup/buster/dispatches`,
          {
            headers: {
              Authorization: `Bearer ${env.githubApiKey}`,
            },
            json: {
              event_type: "build-container",
            },
          }
        )
        .then(() => resolve())
        .catch(() => reject());
    });
  }
}
