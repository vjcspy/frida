const hooks: Array<InvocationListener> = [];

// Ví dụ sử dụng:
// registerHook("libtarget.so", "target_function",
//   (args) => console.log("[*] target_function called"),
//   (retval) => console.log("[*] target_function returned", retval)
// );

export function registerHook(moduleName: string, funcName: string, onEnterCallback?: (args: NativePointer[]) => void, onLeaveCallback?: (retval: NativePointer) => void) {
  const addr = Module.findExportByName(moduleName, funcName);
  if (!addr) {
    console.log(`[!] Function ${funcName} not found in ${moduleName}`);
    return;
  }

  const hook = Interceptor.attach(addr, {
    onEnter: function(args) {
      if (onEnterCallback) onEnterCallback(args);
    }, onLeave: function(retval) {
      if (onLeaveCallback) onLeaveCallback(retval);
    },
  });

  hooks.push(hook);
  console.log(`[*] Hook registered: ${funcName} in ${moduleName}`);
}

export function hookAtAddress(address: any) {
  const targetAddr = ptr(address); // Chuyển đổi địa chỉ thành NativePointer

  console.log(`[*] Hooking function at address: ${targetAddr}`);

  const hook = Interceptor.attach(targetAddr, {
    onEnter: function(args) {
      let argCount = 0;
      try {
        while (!args[argCount].isNull() || argCount < 10) { // Giới hạn tối đa 10 args
          console.log(`    Arg[${argCount}]: ${args[argCount]}`);
          argCount++;
        }
      } catch (e) {
        console.log(`[*] Detected ${argCount} arguments.`);
      }
      console.log(`    Arg[0]: ${args[0]}`);
      console.log(`    Arg[1]: ${args[1]}`);
    }, onLeave: function(retval) {
      console.log(`[*] Function at ${targetAddr} returned: ${retval}`);
    },
  });
  hooks.push(hook);
  return hook; // Trả về hook để có thể gỡ sau này nếu cần
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
    console.log("[*] Received cleanup message, removing hook...");
    unhookAll();
  }
});