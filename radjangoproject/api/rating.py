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


def roomRate(roomData):
    
  def getFirstDoor(_doors):
    for i in _doors:
      if i['category'] == "door":
        return i
  def getBed(_furniture):
    for i in _furniture:
      if i['category'] == 'Bed':
        return i

  exitDoor = getFirstDoor(roomData['activeObjects'])
  
  complaints = []
  rating = 100
  _bed = getBed(roomData['activeObjects'])
  
  if _bed['rotate'] % 90 != 0:
    complaints.append('Move your bed against your wall')
    rating -= 20
      
  _bedCoordinates = rectangle_corners(_bed['x'],_bed['y'], _bed['width'], _bed['height'], _bed['rotate'])
  return _bedCoordinates




def main():
  data = json.load(sys.argv[1])
  roomRate(data)

  
  



if __name__ == "__main__":
  main()
