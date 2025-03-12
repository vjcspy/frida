import { bypassAntiCheat, dumpLoadedModules, hookAntiCheatFunctions } from "./hook/check";

export const r1999CheckAntiCE = () => {
  hookAntiCheatFunctions();
  bypassAntiCheat();
  dumpLoadedModules();
};