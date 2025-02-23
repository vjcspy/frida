import os
import signal
import sys

import frida

PACKAGE_NAME = "com.bluepoch.m.en.reverse1999"
SCRIPT_PATH = "./../apps/agent/dist/_agent.js"
DEFAULT_CONNECT_METHOD = "usb"
REMOTE_IP = "192.168.159.1"

def get_device(connect_method):
    if connect_method == "usb":
        return frida.get_usb_device()
    elif connect_method == "ip":
        return frida.get_device_manager().add_remote_device(REMOTE_IP)
    else:
        raise ValueError("Invalid connection method. Use 'usb' or 'ip'.")

session = None
script = None
stop = False

def on_message(message, data):
    print(f"[FRIDA MESSAGE] {message}")

def cleanup():
    stop = True
    """Gửi tín hiệu cleanup đến JS và detach session."""
    global session, script
    if script:
        try:
            print("[*] Unloading script...")
            script.post({"type": "cleanup"})
            script.unload()
        except:
            print("[!] Error: Cannot unload script.")
    if session:
        try:
            print("[*] Detaching from target process...")
            session.detach()
        except:
            print("[!] Error: Cannot detach from target process.")
    sys.exit(0)

def signal_handler(sig, frame):
    """Xử lý tín hiệu Ctrl+C"""
    print("\n[!] Received SIGINT (Ctrl+C), cleaning up...")
    cleanup()

# Đăng ký signal handler cho SIGINT (Ctrl+C)
signal.signal(signal.SIGINT, signal_handler)


def load_script():
    """Tải lại script mới từ file"""
    global script
    if script:
        script.unload()  # Unload script cũ

    with open(SCRIPT_PATH, "r", encoding="utf-8") as f:
        script_code = f.read().strip()

    if not script_code:
        print(f"[!] Error: Script file '{SCRIPT_PATH}' is empty!")
        return

    script = session.create_script(script_code)
    script.on("message", on_message)
    script.load()
    print("[*] Script reloaded successfully!")

try:
    connect_method = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_CONNECT_METHOD
    device = get_device(connect_method)
    print(f"[*] Connected to device via {connect_method.upper()}")

    applications = device.enumerate_applications()
    target_process = None
    target_pid = 0

    print(f"{'PID':<6} {'Name':<20} {'Identifier':<40}")
    print("-" * 80)
    print("[*] List of applications on the device:")

    for app in applications:
        pid = app.pid if app.pid else "-"  # Nếu pid = 0, ứng dụng chưa chạy
        print(f"{pid:<6} {app.name:<20} {app.identifier:<40}")
        if app.identifier == PACKAGE_NAME:
            target_process = app.name
            target_pid = pid

    print(f"target_process: {target_process} run on pid: {target_pid}")
    if not target_process or target_pid == 0:
        print(f"[!] Error: Application '{PACKAGE_NAME}' not found or not running!")
        sys.exit(1)

    print(f"[*] Attaching to application {target_process}...")
    session = device.attach(target_process)

    if not os.path.exists(SCRIPT_PATH):
        print(f"[!] Error: Script file '{SCRIPT_PATH}' not found. Check the path!")
        sys.exit(1)

    print(f"[*] Loading script from '{SCRIPT_PATH}'...")
    load_script()

    print("[*] Type 'r' + Enter to reload script, or Ctrl+C to exit.")

    # Vòng lặp chờ input
    while not stop:
        user_input = input()
        if user_input.strip().lower() == "r":
            print("[*] Reloading script...")
            load_script()

except frida.ProcessNotFoundError:
    print(f"[!] Error: Process '{PACKAGE_NAME}' not found. Check if the application is running!")
except frida.ServerNotRunningError:
    print("[!] Error: Cannot connect to Frida Server. Check if Frida Server is running!")
except Exception as e:
    print(f"[!] Unknown error: {e}")
finally:
    cleanup()
