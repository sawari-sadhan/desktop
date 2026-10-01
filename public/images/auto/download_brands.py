import urllib.request
import urllib.parse
import json
import ssl
import os

ssl._create_default_https_context = ssl._create_unverified_context

brands = [
    "Aston_Martin", "Audi", "Bentley", "BMW", "Bugatti", "Ferrari", "Ford", 
    "Honda", "Hyundai", "Jaguar", "Jeep", "Kia", "Lamborghini", "Land_Rover", 
    "Lexus", "Maserati", "McLaren", "Mercedes-Benz", "Nissan", "Porsche", 
    "Rolls-Royce", "Tesla", "Toyota", "Volkswagen", "Volvo"
]

req_headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

output_dir = "/home/cb/lab/sawarisadhan/desktop/public/images/brands"
os.makedirs(output_dir, exist_ok=True)

for brand in brands:
    # Query Wikipedia API for the page image
    api_url = f"https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&format=json&piprop=original&titles={urllib.parse.quote(brand)}"
    
    try:
        req = urllib.request.Request(api_url, headers=req_headers)
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode())
            
            pages = data.get("query", {}).get("pages", {})
            page = list(pages.values())[0]
            
            if "original" in page:
                image_url = page["original"]["source"]
                # Convert thumbnail/url if needed, but 'original' is usually full size
                
                filename = os.path.join(output_dir, f"{brand.lower().replace('_', '-')}.jpg")
                
                img_req = urllib.request.Request(image_url, headers=req_headers)
                with urllib.request.urlopen(img_req) as img_resp, open(filename, 'wb') as out_file:
                    out_file.write(img_resp.read())
                    
                print(f"✅ Downloaded {brand} image")
            else:
                print(f"❌ No image found on Wikipedia for {brand}")
                
    except Exception as e:
        print(f"⚠️ Failed for {brand}: {e}")
