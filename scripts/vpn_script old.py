import platform
import requests
import os
import sys
import ctypes
import subprocess
from pathlib import Path

def is_admin():
    """
    Check if the script is running with admin rights (Windows only).
    """
    try:
        return ctypes.windll.shell32.IsUserAnAdmin()
    except:
        return False

def elevate_and_rerun():
    """
    Relaunch the script with administrator privileges (Windows only).
    """
    print("[INFO] Elevating script to run as administrator...")
    params = ' '.join([f'"{arg}"' for arg in sys.argv])
    ctypes.windll.shell32.ShellExecuteW(None, "runas", sys.executable, params, None, 1)

def download_file(url, filename):
    """
    Download the installer to the Downloads folder.
    """
    save_path = os.path.join(str(Path.home() / "Downloads"), filename)
    print(f"[INFO] Downloading {filename} to {save_path}")

    try:
        with requests.get(url, stream=True) as r:
            if r.status_code == 200:
                with open(save_path, 'wb') as f:
                    for chunk in r.iter_content(chunk_size=8192):
                        f.write(chunk)
                print(f"[SUCCESS] Downloaded: {save_path}")
                return save_path
            else:
                print(f"[ERROR] Download failed with status code: {r.status_code}")
                return None
    except Exception as e:
        print(f"[ERROR] Exception during download: {e}")
        return None

def install_silently_windows(file_path):
    """
    Silently install FortiClient on Windows using native installer flags.
    """
    if not os.path.exists(file_path):
        print(f"[ERROR] File not found: {file_path}")
        return

    print("[INFO] Running silent installer on Windows...")
    try:
        subprocess.run([file_path, "/quiet", "/norestart", "/log", "install.log"], check=True)
        print("[SUCCESS] FortiClient installed silently.")
    except Exception as e:
        print(f"[ERROR] Installation failed: {e}")

def open_dmg_mac(file_path):
    """
    Open the .dmg file silently on macOS.
    """
    if not os.path.exists(file_path):
        print(f"[ERROR] File not found: {file_path}")
        return

    print("[INFO] Opening .dmg on macOS...")
    try:
        subprocess.run(["open", file_path], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        print("[SUCCESS] FortiClient installer opened on macOS.")
    except Exception as e:
        print(f"[ERROR] Failed to open .dmg: {e}")

def main():
    os_type = platform.system()

    if os_type == "Windows":
        url = "https://aksdev.s3.ap-south-1.amazonaws.com/Window-FortiClientSetup_7.2.8_x64.exe"
        filename = "FortiClientSetup.exe"
        path = download_file(url, filename)
        if path:
            install_silently_windows(path)

    elif os_type == "Darwin":
        url = "https://aksdev.s3.ap-south-1.amazonaws.com/Macbook-FortiClient_7.2.8.dmg"
        filename = "FortiClient_Mac.dmg"
        path = download_file(url, filename)
        if path:
            open_dmg_mac(path)

    else:
        print("[ERROR] Unsupported OS.")

if __name__ == "__main__":
    if not is_admin() and platform.system() == "Windows":
        print("[INFO] Script requires administrative privileges.")
        elevate_and_rerun()
    else:
        main()
        if platform.system() == "Windows":
            print("[INFO] Running with admin privileges.")
        else:
            print("[INFO] Running script on macOS without admin privileges.")
# This script is designed to download and install FortiClient on Windows and macOS.
# It handles downloading the installer, checking for admin privileges, and running the installer silently.
# on Windows or opening the installer on macOS.
# It does not include any dependencies or external libraries beyond the standard library.
# This script is designed to reset network adapters and renew IP addresses on Windows and macOS systems.