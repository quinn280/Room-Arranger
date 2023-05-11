#import requests
import webbrowser

class furn:
  def __init__(self, name, category, price, description, width, height, length, link, image):
    self.name = name
    self.category = category
    self.price = price
    self.description = description
    self.width = width
    self.height = height
    self.length = length
    self.link = link
    self.image = image

def returnSomeStuff(furniture_data):
    dat = {
furn("MALM","bed",399,"High bed frame/2 storage boxes, black-brown/Luroy, Queen",66.125,39.375,83.125,"https://www.ikea.com/us/en/p/malm-high-bed-frame-2-storage-boxes-black-brown-luroey-s69176285/","https://www.ikea.com/us/en/images/products/malm-high-bed-frame-2-storage-boxes-black-brown-luroey__1154412_pe886059_s5.jpg?f=s"),
furn("TARVA","bed",199,"Bed frame, pine/Luroy, Queen",63,36.25,82.25,"https://www.ikea.com/us/en/p/tarva-bed-frame-pine-luroey-s29007794/","https://www.ikea.com/us/en/images/products/tarva-bed-frame-pine-luroey__0637611_pe698421_s5.jpg?f=xl"),
furn("SAGGSTUA","bed",249,"Bed frame, black/Luroy, Queen",63.375,55.125,82.625,"https://www.ikea.com/us/en/p/sagstua-bed-frame-black-luroey-s29268871/","https://www.ikea.com/us/en/images/products/sagstua-bed-frame-black-luroey__0662135_pe719104_s5.jpg?f=xl"),
furn("OSTANO","chair",35,"Chair, red-brown Remmarn/red-brown",17.75,29.875,17.75,"https://www.ikea.com/us/en/p/oestanoe-chair-red-brown-remmarn-red-brown-90538647/","https://www.ikea.com/us/en/images/products/oestanoe-chair-red-brown-remmarn-red-brown__1120081_pe873713_s5.jpg?f=xl"),
furn("EKENASET","chair",249,"Armchair, Kilanda light beige",25.25,29.875,30.75,"https://www.ikea.com/us/en/p/ekenaeset-armchair-kilanda-light-beige-30533493/","https://www.ikea.com/us/en/images/products/ekenaeset-armchair-kilanda-light-beige__1109687_pe870153_s5.jpg?f=xl"),
furn("LOBERGET/SIBBEN","chair",39.99,"Child's desk chair, white",22,29.5,22,"https://www.ikea.com/us/en/p/loberget-sibben-childs-desk-chair-white-s59337670/","https://www.ikea.com/us/en/images/products/loberget-sibben-childs-desk-chair-white__0826517_pe776395_s5.jpg?f=xl"),
furn("VOXLOV","chair",125,"Chair, light bamboo",16.875,33.5,20.875,"https://www.ikea.com/us/en/p/voxloev-chair-light-bamboo-50450236/","https://www.ikea.com/us/en/images/products/voxloev-chair-light-bamboo__0948161_pe798889_s5.jpg?f=xl"),
furn("LINNMON/ADILS","table",54.99,"Table, white",23.675,28.75,39.375,"https://www.ikea.com/us/en/p/linnmon-adils-table-white-s29932181/","https://www.ikea.com/us/en/images/products/linnmon-adils-table-white__0737165_pe740925_s5.jpg?f=xl"),
furn("LACK","table",44.99,"Coffee table, black-brown",21.625,17.75,35.375,"https://www.ikea.com/us/en/p/lack-coffee-table-black-brown-40104294/","https://www.ikea.com/us/en/images/products/lack-coffee-table-black-brown__57540_pe163122_s5.jpg?f=xl"),
furn("IDANAS","table",199.99,"Drop-leaf table, white,",37.75,29.5,33.875,"https://www.ikea.com/us/en/p/idanaes-drop-leaf-table-white-00487652/","https://www.ikea.com/us/en/images/products/idanaes-drop-leaf-table-white__0926738_pe789490_s5.jpg?f=xl"),
furn("LINANAS","upholstery",499,"Sofa, with chaise/Vissle dark gray",77.5,57.125,29.875,"https://www.ikea.com/us/en/p/linanaes-sofa-with-chaise-vissle-dark-gray-70512243/","https://www.ikea.com/us/en/images/products/linanaes-sofa-with-chaise-vissle-dark-gray__1013908_pe829460_s5.jpg?f=xl"),
furn("GOLSTAD","upholstery",149,"Loveseat, Knisa dark gray",47.625,26.75,30.75,"https://www.ikea.com/us/en/p/glostad-loveseat-knisa-dark-gray-70489011/","https://www.ikea.com/us/en/images/products/glostad-loveseat-knisa-dark-gray__0950864_pe800736_s5.jpg?f=xl"),
furn("SODERHAMN","upholstery",400,"Corner section, Viarp beige/brown",39,32.625,39,"https://www.ikea.com/us/en/p/soederhamn-corner-section-viarp-beige-brown-s99305629/","https://www.ikea.com/us/en/images/products/soederhamn-corner-section-viarp-beige-brown__0802789_pe768594_s5.jpg?f=xl")
}
    
    ret = []

    c = furniture_data['category']

    for e in dat:
        if e.category ==c:
            ret.append(e)#i
            #webbrowser.open(e.link, new = 2)

    err = 100
    
    final = furn(0, 0, 0, 0, 0, 0, 0, 0, 0)

    for x in ret:
        ferr = (abs(furniture_data['width']-x.width)+abs(furniture_data['height']-x.length))/2
        if ferr < err:
            err = ferr
            final = x
    r = { 
            "name":final.name, 
            "category":final.category, 
            "price":final.price, 
            "description":final.description, 
            "width":final.width, 
            "height":final.height, 
            "length":final.length, 
            "link":final.link, 
            "image":final.image }
    webbrowser.open(final.link, new = 2)

    return r
    
