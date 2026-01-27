
import { CharacterClass, ClassType, Talent } from '../../../types';
import { THUG_DEF, THUG_TALENTS } from './Thug';
import { SMUGGLER_DEF, SMUGGLER_TALENTS } from './Smuggler';
import { DEALER_DEF, DEALER_TALENTS } from './Dealer';
import { ENTERTAINER_DEF, ENTERTAINER_TALENTS } from './Entertainer';
import { HUSTLER_DEF, HUSTLER_TALENTS } from './Hustler';

export const CLASSES: Record<ClassType, CharacterClass> = {
  [ClassType.Thug]: THUG_DEF,
  [ClassType.Smuggler]: SMUGGLER_DEF,
  [ClassType.Dealer]: DEALER_DEF,
  [ClassType.Entertainer]: ENTERTAINER_DEF,
  [ClassType.Hustler]: HUSTLER_DEF,
};

export const TALENT_TREES: Record<ClassType, Talent[]> = {
    [ClassType.Thug]: THUG_TALENTS,
    [ClassType.Smuggler]: SMUGGLER_TALENTS,
    [ClassType.Dealer]: DEALER_TALENTS,
    [ClassType.Entertainer]: ENTERTAINER_TALENTS,
    [ClassType.Hustler]: HUSTLER_TALENTS,
};
