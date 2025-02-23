import { info } from "../logger";

export const dumpAllModules = () => {
  // Java.perform(() => {
    // Working with modules
    info("Enumerating modules...");
    const modules = Process.enumerateModules();
    for (let i = 0; i < modules.length; i++) {
      const module = modules[i];
      console.log(
        "Module name: " +
        module.name +
        " - " +
        "Base Address: " +
        module.base.toString(),
      );
    }
  // });
};