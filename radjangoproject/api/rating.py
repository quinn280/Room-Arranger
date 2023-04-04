import json
import sys
import math
# Ripped from https://github.com/JuantAldea/Separating-Axis-Theorem
# Thanks Juan!
from .separation_axis_theorem import *

"""
Gets coordinates of the furnitures 4 corners given one corner,
dimmenstions, and angles

Rounded to a 100th
"""
def rectangle_corners(x1, y1, width, length, angle):
  angle_rad = math.radians(angle)
  x2 = x1 + math.cos(angle_rad) * width
  y2 = y1 + math.sin(angle_rad) * width
  x3 = x2 - math.sin(angle_rad) * length
  y3 = y2 + math.cos(angle_rad) * length
  x4 = x1 - math.sin(angle_rad) * length
  y4 = y1 + math.cos(angle_rad) * length
  return [(round(x1,2), round(y1,2)), (round(x2,2), round(y2,2)), 
          (round(x3,2), round(y3,2)), (round(x4,2), round(y4,2))]


"""
Returns json with following parameters

  rating - int from 0 - 100
  complaints - a vector filled with potential improvements
  DEBUG - another json / dict which contains data for testing

"""

def roomRate(roomData):
  returnJSON = {}
  returnJSON['rating'] = 100
  returnJSON['complaints'] = []
  returnJSON['DEBUG'] = {}

  def getFirstDoor(_doors):
    for i in _doors:
      if i['category'] == "door":
        return i
    return 0
  def getBed(_furniture):
    for i in _furniture:
      if i['category'] == 'Bed':
        return i
    return 0


  _door = getFirstDoor(roomData['activeObjects'])
  _bed = getBed(roomData['activeObjects'])
  
  if _door and _bed:
    roomWidth = int(roomData['roomDimensions']['width'][:-2])
    _bedCoordinates = rectangle_corners(_bed['x'],_bed['y'], _bed['width'], _bed['height'], _bed['rotate'])
    _doorCollision = rectangle_corners(_door['x'],_door['y'],_door['width'], roomWidth, _door['rotate'])

    returnJSON['DEBUG']['bedCoord'] = _bedCoordinates
    returnJSON['DEBUG']['doorCoord'] = _doorCollision

    separateAxis = separating_axis_theorem(_bedCoordinates, _doorCollision)
    
    if separateAxis:
      returnJSON['complaints'].append('Move your bed out of line of the doorway')
      returnJSON['rating'] -= 50

    returnJSON['DEBUG']['bedOutOfLine'] = separateAxis
  elif _door and not _bed:
    returnJSON['complaints'].append('Consider adding a bed to your room')
    returnJSON['rating'] -= 90
  else:
    returnJSON['complaints'].append('Add a door to your room to complete it')
    returnJSON['rating'] = 0
    
  
  #return _doorCollision
  return json.dumps(returnJSON)




def main():
  data = json.load(sys.argv[1])
  roomRate(data)

  
  



if __name__ == "__main__":
  main()
