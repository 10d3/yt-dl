import sys
import os
import yt_dlp

def main():
    url = sys.argv[1]
    output_filename = sys.argv[2].replace('_', '')  # Remove underscores from filename
    format_type = sys.argv[3]

    # Get absolute path for downloads directory
    downloads_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'downloads')
    
    # Create downloads directory if it doesn't exist
    if not os.path.exists(downloads_dir):
        os.makedirs(downloads_dir)

    ydl_opts = {
        'outtmpl': os.path.join(downloads_dir, output_filename),
        'format': 'bestaudio/best' if format_type == 'audio' else 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]',
        'quiet': True,
        'no_warnings': True,
        'geo-bypass': True,
        'verbose': False,
        'http_headers': {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9'
        }
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([url])
        print(f"Downloaded: {output_filename}")
    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()