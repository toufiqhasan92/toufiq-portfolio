import os
from PIL import Image

images_dir = r"C:\Users\User\.gemini\antigravity\scratch\amazon_portfolio\images"

for root, dirs, files in os.walk(images_dir):
    for file in files:
        filepath = os.path.join(root, file)
        ext = os.path.splitext(filepath)[1].lower()
        if ext in ['.jpg', '.jpeg', '.png']:
            try:
                size_mb = os.path.getsize(filepath) / (1024 * 1024)
                if size_mb > 1.0: # Only compress files larger than 1MB
                    print(f"Compressing {filepath} ({size_mb:.2f} MB)...")
                    img = Image.open(filepath)
                    
                    # Convert RGBA to RGB if saving as JPEG
                    if img.mode in ('RGBA', 'LA') and ext in ['.jpg', '.jpeg']:
                        img = img.convert('RGB')
                    
                    # Resize if extremely large
                    max_size = 2000
                    if img.width > max_size or img.height > max_size:
                        img.thumbnail((max_size, max_size), Image.Resampling.LANCZOS)
                    
                    # Save back
                    if ext in ['.jpg', '.jpeg']:
                        img.save(filepath, 'JPEG', quality=75, optimize=True)
                    elif ext == '.png':
                        # Convert to RGB and save as JPEG to save HUGE space if it's a preview or lifestyle image
                        # But wait, let's keep PNG extension to avoid breaking links, but save as PNG with optimize
                        # Let's save as PNG with optimization
                        img.save(filepath, 'PNG', optimize=True)
                    
                    new_size_mb = os.path.getsize(filepath) / (1024 * 1024)
                    print(f"-> Saved: {new_size_mb:.2f} MB")
            except Exception as e:
                print(f"Failed to compress {filepath}: {e}")
