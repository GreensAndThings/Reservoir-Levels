import json

with open("data/water_company_boundaries.geojson", "r") as f:
    geojson_data = json.load(f)

print(geojson_data['features'][0]['properties']['COMPANY'])



