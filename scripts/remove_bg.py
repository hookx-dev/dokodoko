from PIL import Image
import sys

def make_transparent(input_path, output_path, tolerance=240):
    try:
        img = Image.open(input_path).convert("RGBA")
        data = img.getdata()
        
        new_data = []
        for item in data:
            # R, G, B values
            r, g, b = item[0], item[1], item[2]
            
            # If the pixel is close to white, make it transparent
            if r > tolerance and g > tolerance and b > tolerance:
                new_data.append((255, 255, 255, 0))
            else:
                new_data.append(item)
                
        img.putdata(new_data)
        img.save(output_path, "PNG")
        print(f"Successfully processed {input_path} -> {output_path}")
    except Exception as e:
        print(f"Error processing {input_path}: {e}")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        tolerance = int(sys.argv[1])
    else:
        tolerance = 235
        
    make_transparent("public/source_logo.jpg", "public/logo_full.png", tolerance)
