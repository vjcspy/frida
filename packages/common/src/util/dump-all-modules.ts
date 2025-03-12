import { info } from "../logger";

export const dumpAllModules = () => {
  // var dlopen = Module.findExportByName(null, "dlopen");
  // if (dlopen !== null) {
  //   Interceptor.attach(dlopen, {
  //     onEnter: function(args) {
  //       this.libname = args[0].readUtf8String(); // Đọc tên thư viện được load
  //       console.log("[+] dlopen called: " + this.libname);
  //     },
  //     // onLeave: function(retval) {
  //     //   console.log("[+] dlopen returned: " + retval);
  //     // }
  //   });
  // } else {
  //   console.log("[-] dlopen not found!");
  // }

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