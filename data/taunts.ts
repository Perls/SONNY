
import { CrewMember, FightRecord } from '../types';
import { ENEMY_TRASH_TALK, TACTIC_QUOTES } from '../constants';

export const getPreBattleDialogue = (
  player: CrewMember,
  enemyName: string,
  lastBattle?: FightRecord
) => {
  const playerClass = player.classType;
  
  // Get random quotes based on class or generic
  const enemyQuotes = ENEMY_TRASH_TALK[playerClass] || [
      "You picked the wrong neighborhood!",
      "I'm gonna wipe the floor with you.",
      "Is this the best you got?",
      "Go back to the nursery, kid."
  ];
  
  const enemyTrashTalk = enemyQuotes[Math.floor(Math.random() * enemyQuotes.length)];
  
  // Contextual Player Talk
  let playerTrashTalk = "Time to pay up.";
  if (lastBattle) {
      if (lastBattle.result === 'lost') playerTrashTalk = "I'm back for what's mine.";
      else playerTrashTalk = "You didn't learn the first time?";
  } else {
      playerTrashTalk = "Out of my way.";
  }

  // Commands
  const aggroQuotes = TACTIC_QUOTES['aggressive'];
  const playerCommand = aggroQuotes[Math.floor(Math.random() * aggroQuotes.length)];
  const enemyCommand = "Crush them!";

  return {
    playerTrashTalk,
    enemyTrashTalk: `Hey ${player.nickname}! ${enemyTrashTalk}`,
    playerCommand,
    enemyCommand
  };
};
