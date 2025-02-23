// import { writeFileSync } from "fs";

export function hookAntiCheatFunctions() {
  const apiList = [
    "OpenProcess",
    "ReadProcessMemory",
    "WriteProcessMemory",
    "NtQuerySystemInformation",
    "CreateToolhelp32Snapshot",
    "EnumProcesses",
    "IsDebuggerPresent",
    "CheckRemoteDebuggerPresent",
    "NtSetInformationThread",
    "FindWindowA",
    "FindWindowW",
    "EnumWindows",
    "EnumChildWindows",
    "EnumThreadWindows",
    "NtQueryObject",
    "NtQueryInformationProcess",
    "NtQuerySystemTime",
    "NtYieldExecution",
    "TerminateProcess",
  ];

  for (const apiName of apiList) {
    try {
      const addr = Module.findExportByName("kernel32.dll", apiName) || Module.findExportByName("ntdll.dll", apiName);
      if (addr) {
        Interceptor.attach(addr, {
          onEnter(args) {
            console.log(`[Hook] ${apiName} called by ${Process.getCurrentThreadId()}`);
          },
        });
      }
    } catch (e) {
      console.log(`[Error] Failed to hook ${apiName}: ${e}`);
    }
  }
}

export function bypassAntiCheat() {
  // Bypass IsDebuggerPresent
  const isDebuggerPresentAddr = Module.findExportByName("kernel32.dll", "IsDebuggerPresent");
  if (isDebuggerPresentAddr) {
    Interceptor.replace(isDebuggerPresentAddr, new NativeCallback(() => 0, "uint32", []));
    console.log("[Bypass] IsDebuggerPresent patched!");
  }

  // Bypass CheckRemoteDebuggerPresent
  // const checkRemoteDebuggerAddr = Module.findExportByName("kernel32.dll", "CheckRemoteDebuggerPresent");
  // if (checkRemoteDebuggerAddr) {
  //   Interceptor.replace(checkRemoteDebuggerAddr, new NativeCallback((hProcess, pbDebuggerPresent) => {
  //     Memory.writeU8(pbDebuggerPresent, 0);
  //     return 0;
  //   }, "uint32", ["pointer", "pointer"]));
  //   console.log("[Bypass] CheckRemoteDebuggerPresent patched!");
  // }

  // Patch NtQuerySystemInformation để ẩn tiến trình CE
  const ntQuerySystemInfoAddr = Module.findExportByName("ntdll.dll", "NtQuerySystemInformation");
  if (ntQuerySystemInfoAddr) {
    Interceptor.attach(ntQuerySystemInfoAddr, {
      onEnter(args) {
        console.log("[Hook] NtQuerySystemInformation called!");
      },
    });
  }
}

export function dumpLoadedModules() {
  const modules = Process.enumerateModules();
  let moduleInfo = "Loaded Modules:\n";
  for (const mod of modules) {
    moduleInfo += `${mod.name} - Base: ${mod.base}, Size: ${mod.size}\n`;
  }
  console.log(moduleInfo);
  // writeFileSync("C:\\Users\\Public\\frida_loaded_modules.txt", moduleInfo);
}
