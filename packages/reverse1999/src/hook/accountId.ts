import { hookAtAddress } from "@packages/common/dist/util/hook-manager";

export const hookAccountId = () => {
  var baseAdd = ptr("0x706a473000");
  var offsets = [0x2972850, 0x6d53fe4030, 0x6d53fe7b84, 0x6d53fe4850, 0x6d53fe2ae4, 0x6d53fe2af4];

  for (let i = 0; i < offsets.length; i++) {
    try {
      hookAtAddress(baseAdd.add(offsets[i]));
    } catch (e) {
      console.log("Error at offset: " + offsets[i]);
    }
  }
};