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
    print("STATUS Elevating script to run as administrator...", flush=True)
    params = ' '.join([f'"{arg}"' for arg in sys.argv])
    ctypes.windll.shell32.ShellExecuteW(None, "runas", sys.executable, params, None, 1)

def download_file(url, filename):
    """
    Download the installer to the Downloads folder, outputting progress.
    """
    save_path = os.path.join(str(Path.home() / "Downloads"), filename)
    print(f"STATUS Downloading {filename} to {save_path}", flush=True)

    try:
        with requests.get(url, stream=True) as r:
            r.raise_for_status()
            total_size = int(r.headers.get('content-length', 0))
            downloaded = 0
            chunk_size = 8192
            last_percent = -1
            with open(save_path, 'wb') as f:
                for chunk in r.iter_content(chunk_size=chunk_size):
                    if chunk:
                        f.write(chunk)
                        downloaded += len(chunk)
                        if total_size > 0:
                            percent = int((downloaded / total_size) * 100)
                            if percent != last_percent:
                                print(f"PROGRESS {percent}", flush=True)
                                last_percent = percent
            print(f"STATUS Download Complete: {save_path}", flush=True)
            return save_path
    except Exception as e:
        print(f"ERROR Download failed: {e}", flush=True)
        return None

def install_silently_windows(file_path):
    """
    Silently install FortiClient on Windows using native installer flags.
    """
    if not os.path.exists(file_path):
        print(f"ERROR File not found: {file_path}", flush=True)
        return

    print("STATUS Starting silent installation on Windows...", flush=True)
    try:
        subprocess.run([file_path, "/quiet", "/norestart", "/log", "install.log"], check=True)
        print("STATUS Installation Complete", flush=True)
    except Exception as e:
        print(f"ERROR Installation failed: {e}", flush=True)

def open_dmg_mac(file_path):
    """
    Mount the DMG and open it on macOS.
    """
    if not os.path.exists(file_path):
        print(f"ERROR File not found: {file_path}", flush=True)
        return
    print("STATUS Mounting DMG and opening installer on macOS...", flush=True)
    try:
        # Mount the DMG
        mount_proc = subprocess.run(['hdiutil', 'attach', file_path], check=True, capture_output=True, text=True)
        print("STATUS DMG mounted. Please follow on-screen installation instructions.", flush=True)
        # Optionally, you could try to open the volume in Finder:
        # Find the mount point from stdout
        for line in mount_proc.stdout.splitlines():
            if '/Volumes/' in line:
                vol_path = line.split('\t')[-1].strip()
                print(f"STATUS Opening {vol_path} in Finder...", flush=True)
                subprocess.run(['open', vol_path])
                break
    except Exception as e:
        print(f"ERROR DMG mounting failed: {e}", flush=True)

def main():
    WINDOWS_URL = "https://aksdev.s3.ap-south-1.amazonaws.com/Window-FortiClientSetup_7.2.8_x64.exe"
    MAC_URL = "https://aksdev.s3.ap-south-1.amazonaws.com/Macbook-FortiClient_7.2.8.dmg"

    system = platform.system()
    print(f"STATUS Detected OS: {system}", flush=True)

    if system == "Windows":
        if not is_admin():
            elevate_and_rerun()
            sys.exit(0)
        filename = "FortiClientSetup_7.2.8_x64.exe"
        url = WINDOWS_URL
        file_path = download_file(url, filename)
        if file_path:
            install_silently_windows(file_path)
    elif system == "Darwin":
        filename = "FortiClient_7.2.8.dmg"
        url = MAC_URL
        file_path = download_file(url, filename)
        if file_path:
            open_dmg_mac(file_path)
    else:
        print("ERROR Unsupported operating system.", flush=True)

if __name__ == "__main__":
    main()
