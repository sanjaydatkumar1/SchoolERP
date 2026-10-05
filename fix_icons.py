from pathlib import Path
import struct
import zlib

ROOT = Path(__file__).resolve().parent
ICON_DIR = ROOT / 'src-tauri' / 'icons'
ICON_DIR.mkdir(parents=True, exist_ok=True)


def png_rgba(size: int) -> bytes:
    """Create a valid RGBA PNG with CRC-correct chunks."""
    rows = []
    for y in range(size):
        row = bytearray([0])  # filter type 0
        for x in range(size):
            # Rounded-ish blue school ERP icon: blue gradient + white center mark
            r = int(24 + (x / max(1, size - 1)) * 28)
            g = int(92 + (y / max(1, size - 1)) * 60)
            b = 255
            a = 255
            # White simple book/cap-like mark in middle
            cx = abs(x - size / 2)
            cy = abs(y - size / 2)
            if (size * 0.14 < cy < size * 0.22 and cx < size * 0.30) or (cy < size * 0.08 and cx < size * 0.08):
                r, g, b = 255, 255, 255
            row.extend([r, g, b, a])
        rows.append(bytes(row))
    raw = b''.join(rows)

    def chunk(kind: bytes, data: bytes) -> bytes:
        return struct.pack('>I', len(data)) + kind + data + struct.pack('>I', zlib.crc32(kind + data) & 0xffffffff)

    return (
        b'\x89PNG\r\n\x1a\n'
        + chunk(b'IHDR', struct.pack('>IIBBBBB', size, size, 8, 6, 0, 0, 0))
        + chunk(b'IDAT', zlib.compress(raw, 9))
        + chunk(b'IEND', b'')
    )

png32 = png_rgba(32)
png128 = png_rgba(128)
(ICON_DIR / '32x32.png').write_bytes(png32)
(ICON_DIR / '128x128.png').write_bytes(png128)

# ICO container containing PNG images. Width/height byte 0 means 256; 128/32 are direct.
images = [(32, png32), (128, png128)]
header = struct.pack('<HHH', 0, 1, len(images))
offset = 6 + 16 * len(images)
entries = []
for size, data in images:
    entries.append(struct.pack('<BBBBHHII', size if size < 256 else 0, size if size < 256 else 0, 0, 0, 1, 32, len(data), offset))
    offset += len(data)
(ICON_DIR / 'icon.ico').write_bytes(header + b''.join(entries) + b''.join(data for _, data in images))

print('Valid icons generated:')
print(' -', ICON_DIR / '32x32.png')
print(' -', ICON_DIR / '128x128.png')
print(' -', ICON_DIR / 'icon.ico')
