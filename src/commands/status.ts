import * as Discord from "discord.js";
import { playerService } from "../lib/services/playerService";
import { getTimeStampFormated, getTime } from "../lib/util/time";
import * as proficienceLevel from "../../data/proficienceLevel.json";

/**
 * Inform the situation of the player in his exploration or trainning
 * @param msg Discord last message related to the command
 */
export function status(msg: Discord.Message) {
  playerService.findbyUserID(msg.author.id).then(player => {
    if (player === null) {
      msg.channel.send("Create a player before check his `status`");
      return;
    }

    let timeTrained: number;

    if (player.adventureStartedTime !== null) {
      // time in seconds that the player is training
      timeTrained = getTimeStampFormated() - player.adventureStartedTime;
      const monster = player.adventure.monster;
      const fullMonsterHp = player.adventure.monster.hp;

      let xpEarned = 0;
      let goldEarned = 0;
      let monstersKilled = 0;
      const time = getTimeStampFormated() - player.adventureStartedTime;

      // Each value is a second, each second is a hit.
      // MUST REFATORE (Remove the loop and make the calc based in the timeTrained)
      for (let i = 0; i <= timeTrained; i++) {
        playerService.attackMonster(player, monster);

        if (monster.hp <= 0) {
          xpEarned += monster.givedXp;
          goldEarned += monster.givedGold;
          monstersKilled++;
          monster.hp = fullMonsterHp;
        }

        playerService.defendAttack(player, monster);

        if (player.hpActual <= 0) {
          player.deaths++;
          player.monstersKilled += monstersKilled;
          player.gold += goldEarned;

          playerService
            .updatePlayer(player)
            .then(() => {
              msg.channel.send(
                "You died after kill " +
                  monstersKilled +
                  " monsters. Got " +
                  goldEarned +
                  " of gold and " +
                  xpEarned +
                  " of experience. You explored for " +
                  getTime(time)
              );
            })
            .catch(error => {
              console.log(
                "Error when updating user after die in exploration. " + error
              );
              msg.channel.send(
                "Looks like that we found some problems to save your progress."
              );
            });
          break;
        }
      }
      msg.channel.send(
        "You killed " +
          monstersKilled +
          " monsters. Got " +
          goldEarned +
          " of gold and " +
          xpEarned +
          " of experience. You explored for " +
          getTime(time)
      );
    } else if (player.trainDamageStartedTime !== null) {
      timeTrained = getTimeStampFormated() - player.trainDamageStartedTime;
      const exp = timeTrained / 10;
      let totalExp: number;
      for (let i = 0; i < exp; i++) {
        totalExp += proficienceLevel[0];
      }
    } else {
    }
  });
}
