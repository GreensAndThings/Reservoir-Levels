

def import_map():
    import geopandas as gpd
    # Path to the shapefile (just the .shp file, geopandas will read .shx and .dbf automatically)
    shapefile_path = input("Copy shp file path here: ")

    # Load the shapefile
    gdf = gpd.read_file(shapefile_path)

    # Check the CRS (coordinate reference system)
    print("Original CRS:", gdf.crs)

    # Reproject to WGS84 (D3 uses lon/lat in WGS84)
    if gdf.crs != "EPSG:4326":
        gdf = gdf.to_crs("EPSG:4326")
        print("Reprojected to WGS84")

    # Save as GeoJSON
    geojson_path = "data/water_companies.geojson"
    gdf.to_file(geojson_path, driver="GeoJSON")

    print(f"GeoJSON saved to {geojson_path}")



def delete_companies():
    import json

    companies_to_delete = {
        'Veolia Water Projects Ltd',
        'Leep Networks (Water) Ltd (formerly Peel Water Networks Ltd)',
        'ESP Water Ltd',
        'Leep Networks (Water) Ltd (formerly SSE Water Ltd)',
        'Albion Eco Ltd',
        'Independent Water Networks Ltd',
        'Albion Water Ltd',
        'Icosa Water Services Ltd',
        'Leep Networks (Water) Ltd',
    }


    with open('data/water_companies.geojson', 'r', encoding='utf-8') as f:
        geojson_data = json.load(f)

    features = geojson_data['features']

    geojson_data['features'] = [
        feature
        for feature in features
        if feature['properties'].get('COMPANY') not in companies_to_delete
    ]

    with open('data/water_companies_cleaned.geojson', 'w', encoding='utf-8') as f:
        json.dump(geojson_data, f, indent=2)

    print(f"Remaining features: {len(geojson_data['features'])}")


def remove_tiny_holes():
    import geopandas as gpd

    # Load your GeoJSON
    gdf = gpd.read_file("data/water_companies.geojson")

    from shapely.geometry import Polygon, MultiPolygon

    def remove_holes(geom):
        if isinstance(geom, Polygon):
            # Keep only the exterior
            return Polygon(geom.exterior)
        elif isinstance(geom, MultiPolygon):
            # Loop through each polygon in the multipolygon
            return MultiPolygon([Polygon(p.exterior) for p in geom.geoms])
        return geom

    gdf.to_file("data/water_companies_cleaned.geojson", driver="GeoJSON")


def delete_insets():
    # Insets are an area type (tiny areas of supply)
    import json

    # Load the GeoJSON
    with open('data/water_companies.geojson', 'r', encoding='utf-8') as f:
        geojson_data = json.load(f)

    features = geojson_data['features']
    print(len(features))

    # Keep only features that are NOT insets
    filtered_features = [
        feature for feature in geojson_data['features']
        if feature['properties'].get('AreaType') != 'inset'
    ]

    # Replace the original features with the filtered list
    geojson_data['features'] = filtered_features

    # Save to a new GeoJSON file
    with open('data/water_companies_no_insets.geojson', 'w', encoding='utf-8') as f:
        json.dump(geojson_data, f, indent=2)

    print(f"Filtered dataset has {len(filtered_features)} features")




def list_area_properties():
    # Find areas with very few coordinates
    import json

    # Load the GeoJSON
    with open('data/water_companies_no_insets.geojson', 'r', encoding='utf-8') as f:
        geojson_data = json.load(f)

    def count_coords(coords, geom_type):
        """Return a list of coordinate counts for each geometry part."""
        counts = []
        if geom_type == "Point":
            counts.append(1)
        elif geom_type == "Polygon":
            counts.append(sum(len(ring) for ring in coords))
        elif geom_type == "MultiPolygon":
            for polygon in coords:
                counts.append(sum(len(ring) for ring in polygon))
        return counts

    # Threshold for "large" polygon
    THRESHOLD = 1400

    for feature in geojson_data['features']:
        area_served = feature['properties'].get('AreaServed')
        company = feature['properties'].get('COMPANY')
        area_type = feature['properties'].get('AreaType')
        geom_type = feature['geometry']['type']
        coords = feature['geometry']['coordinates']

        coord_counts = count_coords(coords, geom_type)

        # Count polygons exceeding the threshold
        large_polygons = sum(1 for c in coord_counts if c > THRESHOLD)

        print(f"Area Served: {area_served}")
        print(f"Company: {company}")
        print(f"Area Type: {area_type}")
        print(f"Geometry Type: {geom_type}")
        print(f"Number of polygons with >{THRESHOLD} coordinates: {large_polygons}")
        print("-" * 60)




def delete_specific_id():
    import json

    # IDs to remove
    ids_to_remove = {1117, 888}  # using a set for faster lookup

    # Load GeoJSON
    with open('data/water_companies_no_insets.geojson', 'r', encoding='utf-8') as f:
        geojson_data = json.load(f)

    # Filter out features with these IDs
    filtered_features = [
        feature for feature in geojson_data['features']
        if feature['properties'].get('ID') not in ids_to_remove
    ]

    # Replace features with filtered list
    geojson_data['features'] = filtered_features

    # Save new GeoJSON
    with open('data/water_companies_large_areas.geojson', 'w', encoding='utf-8') as f:
        json.dump(geojson_data, f, indent=2)

    print(f"Removed features with IDs {ids_to_remove}. Remaining features: {len(filtered_features)}")