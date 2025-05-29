import subprocess
import sys
from datetime import datetime
import os
import platform
import ctypes
import shutil
import time

# Auto-install dependencies
required_modules = ["psutil"]
for module in required_modules:
    try:
        __import__(module)
    except ImportError:
        print(f"[INFO] Installing required module '{module}'...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", module])

import psutil

log_file = "input_test_log.txt"

def log(message):
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    entry = f"[{timestamp}] {message}"
    print(entry)
    with open(log_file, "a") as f:
        f.write(entry + "\n")

def clean_temp_files():
    total_steps = 4
    completed = 0

    if platform.system() == "Windows":
        paths = {
            "TEMP": os.getenv('TEMP'),
            "TMP": os.getenv('TMP'),
            "Prefetch": os.path.expandvars(r'%WINDIR%\\Prefetch')
        }

        for name, path in paths.items():
            if path and os.path.exists(path):
                deleted_count = 0
                try:
                    for filename in os.listdir(path):
                        file_path = os.path.join(path, filename)
                        try:
                            if os.path.isfile(file_path) or os.path.islink(file_path):
                                os.unlink(file_path)
                                deleted_count += 1
                            elif os.path.isdir(file_path):
                                shutil.rmtree(file_path)
                                deleted_count += 1
                        except Exception:
                            continue
                except Exception:
                    continue
                log(f"[CLEANED] {name}: {deleted_count} items deleted.")
            else:
                log(f"[SKIPPED] {name}: Path not found.")
            completed += 1
            log(f"Progress: {int((completed / total_steps) * 100)}%")

        subprocess.run("cleanmgr /sagerun:1", shell=True)
        completed += 1
        log("[CLEANED] Disk Cleanup executed.")
        log(f"Progress: {int((completed / total_steps) * 100)}%")

    elif platform.system() == "Darwin":
        paths = {
            "Library Caches": os.path.expanduser('~/Library/Caches'),
            "Var Folders": '/private/var/folders'
        }

        for name, path in paths.items():
            deleted_count = 0
            if path and os.path.exists(path):
                try:
                    for root_dir, dirs, files in os.walk(path):
                        for namef in files:
                            try:
                                os.remove(os.path.join(root_dir, namef))
                                deleted_count += 1
                            except Exception:
                                continue
                        for named in dirs:
                            try:
                                shutil.rmtree(os.path.join(root_dir, named), ignore_errors=True)
                                deleted_count += 1
                            except Exception:
                                continue
                except Exception:
                    continue
                log(f"[CLEANED] {name}: {deleted_count} items deleted.")
            else:
                log(f"[SKIPPED] {name}: Path not found.")
            completed += 1
            log(f"Progress: {int((completed / total_steps) * 100)}%")
        completed += 1
        log(f"Progress: {int((completed / total_steps) * 100)}%")

def main():
    log("[INFO] Starting system cleanup...")
    clean_temp_files()
    log("[INFO] Cleanup complete.")

if __name__ == "__main__":
    if platform.system() == "Windows":
        try:
            if not ctypes.windll.shell32.IsUserAnAdmin():
                print("[INFO] Script requires administrative privileges.")
                script = os.path.abspath(sys.argv[0])
                params = " ".join([f'"{arg}"' for arg in sys.argv[1:]])
                ctypes.windll.shell32.ShellExecuteW(None, "runas", sys.executable, f'"{script}" {params}', None, 1)
                sys.exit()
        except:
            pass
        main()
    elif platform.system() == "Darwin":
        main()
    else:
        print("[ERROR] This script is only supported on Windows and macOS.")
    sys.exit(0)
# This script is designed to clean temporary files and caches on Windows and macOS systems.
# It checks for administrative privileges, cleans up system temp files, and logs the process.