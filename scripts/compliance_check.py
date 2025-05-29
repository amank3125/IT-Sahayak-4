#!/usr/bin/env python3

import platform
import subprocess
import tempfile
import os

def run(cmd):
    """Run shell command and print output or error."""
    try:
        out = subprocess.check_output(cmd, stderr=subprocess.STDOUT, text=True, shell=True)
        print(out.strip())
    except subprocess.CalledProcessError as e:
        print(f"Error:\n{e.output.strip()}")

def run_windows_powershell_script(script):
    """Run PowerShell script from a temporary file (for Windows)."""
    with tempfile.NamedTemporaryFile(delete=False, suffix=".ps1", mode="w", encoding="utf-8") as tmpfile:
        tmpfile.write(script)
        tmpfile_path = tmpfile.name

    try:
        run(f'powershell -NoProfile -ExecutionPolicy Bypass -File "{tmpfile_path}"')
    finally:
        os.remove(tmpfile_path)

def check_macos_compliance():
    print("🔍 macOS Compliance Check")

    print("\n📦 macOS Version:")
    run("sw_vers -productVersion")

    print("\n🔐 FileVault Status:")
    run("fdesetup status")

    print("\n🔥 Firewall Status:")
    try:
        run("/usr/libexec/ApplicationFirewall/socketfilterfw --getglobalstate")
    except Exception:
        print("Firewall status could not be determined.")

def check_windows_compliance():
    print("Windows Compliance Check")

    powershell_script = '''
Write-Output "OS Version:"
Get-CimInstance Win32_OperatingSystem | Select-Object Caption, Version

Write-Output "`nBitLocker Status:" 
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-Not $isAdmin) {
    Write-Output "WARNING: Run this script as Administrator to check BitLocker status."
} else {
    try {
        $bitlocker = Get-BitLockerVolume -MountPoint C: | Select-Object MountPoint, VolumeStatus, ProtectionStatus
        if ($null -eq $bitlocker) {
            Write-Output "BitLocker is not enabled or no information available for C:."
        } else {
            $bitlocker | Format-Table | Out-String | Write-Output
        }
    } catch {
        Write-Output "BitLocker not enabled or inaccessible."
    }
}

Write-Output "`nFirewall Status:"
$fw = Get-NetFirewallProfile | Select-Object Name, Enabled
if ($null -eq $fw) {
    Write-Output "No firewall profiles found."
} else {
    $fw | Format-Table | Out-String | Write-Output
}
'''
    run_windows_powershell_script(powershell_script)



def check_linux_compliance():
    print("🐧 Linux Compliance Check (Not yet implemented)")
    print("You can add checks for disk encryption (LUKS), firewall (ufw/firewalld), etc.")

# --- Main Execution ---

os_type = platform.system()

if os_type == "Darwin":
    check_macos_compliance()
elif os_type == "Windows":
    check_windows_compliance()
elif os_type == "Linux":
    check_linux_compliance()
else:
    print(f"❌ Unsupported OS: {os_type}")


