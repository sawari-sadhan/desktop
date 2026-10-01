import urllib.request
import ssl

images = {
    "corolla.jpg": "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=800",
    "mustang.jpg": "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?q=80&w=800",
    "bmw.jpg": "https://upload.wikimedia.org/wikipedia/commons/c/cd/2018_BMW_M5_%28F90%29_4.4.jpg",
    "audi.jpg": "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?q=80&w=800"
}

req_headers = {'User-Agent': 'Mozilla/5.0'}

for filename, url in images.items():
    req = urllib.request.Request(url, headers=req_headers)
    try:
        with urllib.request.urlopen(req) as response, open(filename, 'wb') as out_file:
            data = response.read()
            out_file.write(data)
        print(f"Downloaded {filename}")
    except Exception as e:
        print(f"Failed {filename}: {e}")
