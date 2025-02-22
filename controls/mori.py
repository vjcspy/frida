import frida
import sys
import os
import signal

PACKAGE_NAME = "jp.boi.mementomori.android"
SCRIPT_PATH = "./../apps/agent/dist/_agent.js"
DEFAULT_CONNECT_METHOD = "ip"
REMOTE_IP = "192.168.159.1"

def get_device(connect_method):
    if connect_method == "usb":
        return frida.get_usb_device()
    elif connect_method == "ip":
        return frida.get_device_manager().add_remote_device(REMOTE_IP)
    else:
        raise ValueError("Invalid connection method. Use 'usb' or 'ip'.")

# Biến toàn cục để lưu trữ session
session = None

def on_message(message, data):
    print(f"[FRIDA MESSAGE] {message}")

def cleanup():
    """Hàm này sẽ chạy khi script bị dừng, đảm bảo session được detach an toàn."""
    global session
    if session:
        print("\n[*] Detaching from target process...")
        session.detach()
        print("[*] Detached successfully.")
    sys.exit(0)

def signal_handler(sig, frame):
    """Xử lý tín hiệu Ctrl+C"""
    print("\n[!] Received SIGINT (Ctrl+C), cleaning up...")
    cleanup()

# Đăng ký signal handler cho SIGINT (Ctrl+C)
signal.signal(signal.SIGINT, signal_handler)

try:
    # Đọc phương thức kết nối từ tham số dòng lệnh
    connect_method = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_CONNECT_METHOD
    device = get_device(connect_method)
    print(f"[*] Connected to device via {connect_method.upper()}")

    applications = device.enumerate_applications()
    target_process = False

    print(f"{'PID':<6} {'Name':<20} {'Identifier':<40}")
    print("-" * 80)
    print("[*] List of applications on the device:")

    for app in applications:
        pid = app.pid if app.pid else "-"  # Nếu pid = 0, ứng dụng chưa chạy
        print(f"{pid:<6} {app.name:<20} {app.identifier:<40}")
        if app.identifier == PACKAGE_NAME:
            target_process = app.name
            target_pid = pid

    if not target_process or target_pid == 0:
        print(f"[!] Error: Application '{PACKAGE_NAME}' not found or not running!")
        sys.exit(1)

    print(f"[*] Attaching to application {target_process}...")
    session = device.attach(target_process)

    # Kiểm tra xem script có tồn tại không
    if not os.path.exists(SCRIPT_PATH):
        print(f"[!] Error: Script file '{SCRIPT_PATH}' not found. Check the path!")
        sys.exit(1)

    # Đọc nội dung script
    with open(SCRIPT_PATH, "r", encoding="utf-8") as f:
        script_code = f.read().strip()

    if not script_code:
        print(f"[!] Error: Script file '{SCRIPT_PATH}' is empty!")
        sys.exit(1)

    print(f"[*] Script read from '{SCRIPT_PATH}'")
    script = session.create_script(script_code)

    # Lắng nghe thông điệp từ Frida Agent
    print("[*] Listening for messages from Frida Agent...")
    script.on("message", on_message)

    print(f"[*] Loading script into application {target_process}...")
    script.load()

    print(f"[*] Script injected into {target_process}. Press Ctrl+C to stop.")

    # Chờ đợi input để giữ chương trình chạy
    sys.stdin.read()

except frida.ProcessNotFoundError:
    print(f"[!] Error: Process '{PACKAGE_NAME}' not found. Check if the application is running!")
except frida.ServerNotRunningError:
    print("[!] Error: Cannot connect to Frida Server. Check if Frida Server is running!")
except Exception as e:
    print(f"[!] Unknown error: {e}")
finally:
    cleanup()