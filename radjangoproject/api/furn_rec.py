def returnSomeStuff(furniture_data):
    width = furniture_data['width']
    #print(f"The width is {width}")
    
    wayfair_search = "https://www.wayfair.com/keyword.php?keyword="
    ikea_search = "https://www.ikea.com/us/en/search/?q="
    amazon_search = "https://www.amazon.com/s?k="

    search = furniture_data['description'] + " " + str(furniture_data['width']) + " by " + str(furniture_data['height'])

    amazon_search = amazon_search + search.replace(' ', '+')
    ikea_search = ikea_search + search.replace(' ', '%20')
    wayfair_search = wayfair_search + search.replace(' ', '+')

    links = {}
    links['amazon'] = amazon_search
    links['ikea'] = ikea_search
    links['wayfair'] = wayfair_search

    return links
