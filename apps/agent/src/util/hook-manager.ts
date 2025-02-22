const hooks: Array<InvocationListener> = [];

// Ví dụ sử dụng:
// registerHook("libtarget.so", "target_function",
//   (args) => console.log("[*] target_function called"),
//   (retval) => console.log("[*] target_function returned", retval)
// );

function registerHook(moduleName: string, funcName: string, onEnterCallback?: (args: NativePointer[]) => void, onLeaveCallback?: (retval: NativePointer) => void) {
  const addr = Module.findExportByName(moduleName, funcName);
  if (!addr) {
    console.log(`[!] Function ${funcName} not found in ${moduleName}`);
    return;
  }

  const hook = Interceptor.attach(addr, {
    onEnter: function(args) {
      if (onEnterCallback) onEnterCallback(args);
    },
    onLeave: function(retval) {
      if (onLeaveCallback) onLeaveCallback(retval);
    },
  });

  hooks.push(hook);
  console.log(`[*] Hook registered: ${funcName} in ${moduleName}`);
}

function unhookAll() {
  console.log("[*] Unhooking all functions...");
  hooks.forEach(hook => hook.detach());
  hooks.length = 0;
  console.log("[*] Cleanup complete.");
}

// Lắng nghe thông điệp từ Python
recv(function(message) {
  if (message.type === "cleanup") {
    console.log("[*] Received cleanup message, removing hooks...");
    unhookAll();
  }
});