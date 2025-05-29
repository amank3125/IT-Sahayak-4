#!/usr/bin/env python3
import tkinter as tk
from tkinter import ttk
import speedtest
import threading
import json

class SpeedTestApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Network Speed Test")
        self.root.geometry("400x300")
        self.root.configure(bg='#f0f2f5')

        # Create main frame
        main_frame = ttk.Frame(root, padding="20")
        main_frame.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))

        # Style configuration
        style = ttk.Style()
        style.configure("Title.TLabel", font=('Helvetica', 16, 'bold'))
        style.configure("Speed.TLabel", font=('Helvetica', 24))
        style.configure("Unit.TLabel", font=('Helvetica', 12))

        # Title
        self.title_label = ttk.Label(main_frame, text="Network Speed Test", style="Title.TLabel")
        self.title_label.grid(row=0, column=0, columnspan=2, pady=(0, 20))

        # Download Speed
        ttk.Label(main_frame, text="Download Speed:").grid(row=1, column=0, sticky=tk.W, pady=5)
        self.download_label = ttk.Label(main_frame, text="-- ", style="Speed.TLabel")
        self.download_label.grid(row=1, column=1, sticky=tk.W, pady=5)
        ttk.Label(main_frame, text="Mbps", style="Unit.TLabel").grid(row=1, column=2, sticky=tk.W, pady=5)

        # Upload Speed
        ttk.Label(main_frame, text="Upload Speed:").grid(row=2, column=0, sticky=tk.W, pady=5)
        self.upload_label = ttk.Label(main_frame, text="-- ", style="Speed.TLabel")
        self.upload_label.grid(row=2, column=1, sticky=tk.W, pady=5)
        ttk.Label(main_frame, text="Mbps", style="Unit.TLabel").grid(row=2, column=2, sticky=tk.W, pady=5)

        # Ping
        ttk.Label(main_frame, text="Ping:").grid(row=3, column=0, sticky=tk.W, pady=5)
        self.ping_label = ttk.Label(main_frame, text="-- ", style="Speed.TLabel")
        self.ping_label.grid(row=3, column=1, sticky=tk.W, pady=5)
        ttk.Label(main_frame, text="ms", style="Unit.TLabel").grid(row=3, column=2, sticky=tk.W, pady=5)

        # Progress Bar
        self.progress = ttk.Progressbar(main_frame, length=300, mode='indeterminate')
        self.progress.grid(row=4, column=0, columnspan=3, pady=20)

        # Start Button
        self.start_button = ttk.Button(main_frame, text="Start Test", command=self.start_test)
        self.start_button.grid(row=5, column=0, columnspan=3)

        # Status Label
        self.status_label = ttk.Label(main_frame, text="")
        self.status_label.grid(row=6, column=0, columnspan=3, pady=10)

    def start_test(self):
        self.start_button.state(['disabled'])
        self.progress.start(10)
        self.status_label.config(text="Testing in progress...")
        
        # Start speed test in a separate thread
        thread = threading.Thread(target=self.run_speed_test)
        thread.daemon = True
        thread.start()

    def run_speed_test(self):
        try:
            st = speedtest.Speedtest()
            self.status_label.config(text="Finding best server...")
            st.get_best_server()
            
            self.status_label.config(text="Testing download speed...")
            download_speed = st.download() / 1_000_000  # Convert to Mbps
            self.download_label.config(text=f"{download_speed:.1f}")
            
            self.status_label.config(text="Testing upload speed...")
            upload_speed = st.upload() / 1_000_000  # Convert to Mbps
            self.upload_label.config(text=f"{upload_speed:.1f}")
            
            self.status_label.config(text="Testing ping...")
            ping = st.results.ping
            self.ping_label.config(text=f"{ping:.1f}")
            
            self.status_label.config(text="Test completed!")
            
            # Save results to file
            results = {
                "download": download_speed,
                "upload": upload_speed,
                "ping": ping,
                "timestamp": st.results.timestamp
            }
            with open('speed_test_results.json', 'w') as f:
                json.dump(results, f)
                
        except Exception as e:
            self.status_label.config(text=f"Error: {str(e)}")
        finally:
            self.progress.stop()
            self.start_button.state(['!disabled'])

def main():
    root = tk.Tk()
    app = SpeedTestApp(root)
    root.mainloop()

if __name__ == "__main__":
    main() 