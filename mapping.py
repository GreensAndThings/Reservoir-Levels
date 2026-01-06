import json

with open("data/map_coords.geojson") as f:
    geojson = json.load(f)

for feature in geojson["features"]:
    geom_type = feature["geometry"]["type"]

    if geom_type == "MultiPolygon":
        for polygon in feature["geometry"]["coordinates"]:
            for ring in polygon:
                ring.reverse()
    elif geom_type == "Polygon":
        for ring in feature["geometry"]["coordinates"]:
            ring.reverse()

with open("data/reversed.geojson", "w") as f:
    json.dump(geojson, f)
