import { dumpAllModules } from "@packages/common/dist/util/dump-all-modules";
import { hookAtAddress } from "@packages/common/dist/util/hook-manager";

export const subwayTest = () => {
  const il2cppBaseAddress = Module.findBaseAddress("libil2cpp.so");  // Đối với emulator x86 hoặc các thiết bị sử dụng IL2CPP
  if (!il2cppBaseAddress) {
    console.log("libil2cpp.so not found!");
    return;
  }
  dumpAllModules();

  hookAtAddress(il2cppBaseAddress.add(0x1DCE55C), "GetCurrency");
};