// import { writeFileSync } from "fs";

// Hook CreateToolhelp32Snapshot để chặn game quét danh sách tiến trình
Interceptor.attach(Module.findExportByName("kernel32.dll", "CreateToolhelp32Snapshot")!, {
  onEnter(args) {
    console.log("[Hook] CreateToolhelp32Snapshot called!");
    if (args[0].toInt32() === 0x00000002) { // TH32CS_SNAPPROCESS
      console.log("[Bypass] Chặn lấy danh sách tiến trình!");
      this.replaceReturn = true;
    }
  },
  onLeave(retval) {
    if (this.replaceReturn) retval.replace(ptr(-1)); // Trả về lỗi (HANDLE rỗng)
  },
});

// Hook EnumProcesses để ẩn Cheat Engine khỏi danh sách tiến trình
Interceptor.attach(Module.findExportByName("psapi.dll", "EnumProcesses")!, {
  onEnter(args) {
    console.log("[Hook] EnumProcesses called!");
  },
  onLeave(retval) {
    console.log("[Bypass] Chặn EnumProcesses!");
    retval.replace(ptr(0)); // Trả về lỗi
  },
});

// Hook GetModuleBaseName để ngăn game phát hiện module đáng ngờ
Interceptor.attach(Module.findExportByName("psapi.dll", "GetModuleBaseNameA")!, {
  onEnter(args) {
    console.log("[Hook] GetModuleBaseNameA called!");
  },
  onLeave(retval) {
    console.log("[Bypass] Trả về tên giả cho module!. TODO: NEED IMPLEMENT");
    // Memory.writeUtf8String(retval, "explorer.exe"); // Trả về tên hợp lệ
  },
});

// Hook NtQuerySystemInformation để ẩn Cheat Engine khỏi danh sách tiến trình
Interceptor.attach(Module.findExportByName("ntdll.dll", "NtQuerySystemInformation")!, {
  onEnter(args) {
    console.log("[Hook] NtQuerySystemInformation called!");
    this.infoClass = args[0].toInt32();
  },
  onLeave(retval) {
    if (this.infoClass === 5) { // SystemProcessInformation
      console.log("[Bypass] Chặn quét danh sách tiến trình!");
      retval.replace(ptr(0)); // Trả về lỗi để game không lấy được danh sách
    }
  },
});

// Hook NtQueryInformationProcess để chặn game kiểm tra debugger
Interceptor.attach(Module.findExportByName("ntdll.dll", "NtQueryInformationProcess")!, {
  onEnter(args) {
    console.log("[Hook] NtQueryInformationProcess called!");
    this.infoClass = args[1].toInt32();
  },
  onLeave(retval) {
    if (this.infoClass === 7) { // ProcessDebugPort
      console.log("[Bypass] Chặn game kiểm tra debugger!");
      retval.replace(ptr(0)); // Luôn trả về "Không có debugger"
    }
  },
});

// Hook MiniDumpWriteDump để chặn game ghi dump file
Interceptor.attach(Module.findExportByName("dbghelp.dll", "MiniDumpWriteDump")!, {
  onEnter(args) {
    console.log("[Hook] MiniDumpWriteDump called! Chặn dump tiến trình.");
    this.replaceReturn = true;
  },
  onLeave(retval) {
    if (this.replaceReturn) retval.replace(ptr(0)); // Trả về lỗi
  },
});

// Hook WinStationQueryInformationW để chặn kiểm tra session
Interceptor.attach(Module.findExportByName("winsta.dll", "WinStationQueryInformationW")!, {
  onEnter(args) {
    console.log("[Hook] WinStationQueryInformationW called!");
  },
  onLeave(retval) {
    console.log("[Bypass] Chặn game kiểm tra session!");
    retval.replace(ptr(0)); // Trả về lỗi
  },
});

// Hook ApphelpCheckShellObject để chặn phát hiện ảo hóa/hook
Interceptor.attach(Module.findExportByName("apphelp.dll", "ApphelpCheckShellObject")!, {
  onEnter(args) {
    console.log("[Hook] ApphelpCheckShellObject called!");
  },
  onLeave(retval) {
    console.log("[Bypass] Chặn kiểm tra compatibility mode!");
    retval.replace(ptr(0)); // Trả về lỗi
  },
});

// Chạy hook
console.log("[Frida] Anti-cheat hooks đã được kích hoạt!");
