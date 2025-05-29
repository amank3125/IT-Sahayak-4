import os
import platform
import subprocess
import sys
import time

if platform.system() == "Darwin":
    os.environ["TK_SILENCE_DEPRECATION"] = "1"

# Read password from stdin if provided
password = None
if not sys.stdin.isatty():
    try:
        password = sys.stdin.readline().strip()
    except Exception:
        password = None

def is_admin_windows():
    import ctypes
    try:
        return ctypes.windll.shell32.IsUserAnAdmin()
    except:
        return False

# ------------------- MAIN FUNCTION -------------------

def main():
    os_type = platform.system()
    log = []

    def safe_run(cmd, use_sudo=False):
        if use_sudo and password and os_type == "Darwin":
            result = subprocess.run(['sudo', '-S'] + cmd, capture_output=True, text=True, input=password + '\n')
        else:
            result = subprocess.run(cmd, capture_output=True, text=True)
        return result.stdout.strip() or result.stderr.strip() or f"[WARNING] No output for: {' '.join(cmd)}"

    if os_type == "Windows":
        if not is_admin_windows():
            print("[INFO] Elevating to admin...")
            import ctypes
            script = os.path.abspath(sys.argv[0])
            params = " ".join([f'"{arg}"' for arg in sys.argv[1:]])
            ctypes.windll.shell32.ShellExecuteW(
                None, "runas", sys.executable, f'"{script}" {params}', None, 1)
            sys.exit()

        log.append("[INFO] Scanning network adapters...\n")
        adapters = safe_run(["netsh", "interface", "show", "interface"])
        log.append(adapters)

        log.append("\n[INFO] Running network diagnostics...\n")
        log.append(safe_run(["ipconfig", "/all"]))
        log.append(safe_run(["ping", "8.8.8.8", "-n", "4"]))
        log.append(safe_run(["tracert", "google.com"]))
        log.append(safe_run(["netsh", "wlan", "show", "drivers"]))
        log.append(safe_run(["netsh", "wlan", "show", "networks"]))
        log.append(safe_run(["netsh", "interface", "ip", "show", "config"]))

        log.append("\n[INFO] Resetting all adapters...\n")
        adapter_lines = adapters.splitlines()
        for line in adapter_lines:
            if "Connected" in line or "Disconnected" in line:
                parts = line.split()
                if len(parts) >= 4:
                    name = " ".join(parts[3:])
                    subprocess.run(["netsh", "interface", "set", "interface", name, "admin=disabled"], check=True)
                    time.sleep(1)
                    subprocess.run(["netsh", "interface", "set", "interface", name, "admin=enabled"], check=True)
                    log.append(f"[SUCCESS] Adapter '{name}' reset successfully.\n")

        log.append("\n[INFO] Releasing and renewing IP address...\n")
        subprocess.run(["ipconfig", "/release"], check=True)
        time.sleep(2)
        subprocess.run(["ipconfig", "/renew"], check=True)
        log.append("[SUCCESS] IP address refreshed.\n")

    elif os_type == "Darwin":
        log.append("[INFO] Scanning network interfaces...\n")
        adapters = safe_run(["networksetup", "-listallhardwareports"])
        log.append(adapters)

        log.append("\n[INFO] Running network diagnostics...\n")
        log.append(safe_run(["ifconfig"]))
        log.append(safe_run(["ping", "-c", "4", "8.8.8.8"]))
        log.append(safe_run(["traceroute", "google.com"]))
        log.append(safe_run(["networksetup", "-listallhardwareports"]))
        log.append(safe_run(["networksetup", "-getinfo", "Wi-Fi"]))
        log.append(safe_run(["networksetup", "-listpreferredwirelessnetworks", "en0"]))

        log.append("\n[INFO] Resetting all interfaces...\n")
        lines = adapters.splitlines()
        current_port = None
        for line in lines:
            if "Hardware Port" in line:
                current_port = line.split(":")[1].strip()
            elif "Device" in line and current_port:
                device = line.split(":")[1].strip()
                safe_run(["ifconfig", device, "down"], use_sudo=True)
                time.sleep(1)
                safe_run(["ifconfig", device, "up"], use_sudo=True)
                log.append(f"[SUCCESS] Interface '{device}' reset successfully.\n")

    else:
        log.append("[ERROR] Unsupported operating system.\n")

    print("\n".join(log))

if __name__ == "__main__":
    main()