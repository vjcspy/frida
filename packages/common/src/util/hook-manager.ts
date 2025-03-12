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

export function hookAtAddress(address: any, functionName?: string) {
  try {
    const targetAddr = ptr(address); // Chuyển đổi địa chỉ thành NativePointer

    console.log(`[Interceptor] Hooking function ${functionName} at address: ${targetAddr}`);

    const hook = Interceptor.attach(targetAddr, {
      onEnter: function(args) {
        console.log(`[Interceptor] Function ${functionName} at ${targetAddr} to be called`);
        // Note: args is pointer so it doesn't have any value to print
        // try {
        //   while (!args[argCount].isNull()) {
        //     console.log(`[${functionName}] Arg[${argCount}]: ${args[argCount]}`);
        //   }
        // } catch (e) {
        //   console.log(`[${functionName}] Detected ${argCount} arguments.`);
        // }
      }, onLeave: function(retval) {
        console.log(`[Interceptor] Function ${functionName} at ${targetAddr} returned: ${retval}(Int: ${retval.toInt32()})`);
      },
    });
    hooks.push(hook);
    return hook; // Trả về hook để có thể gỡ sau này nếu cần
  } catch (e) {
    console.log(`[Interceptor] Failed ${functionName} to hook function at address: ${address}`);
  }
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