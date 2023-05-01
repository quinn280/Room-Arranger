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

import math
"""
def rectangle_corners(x1, y1, length, width, angle):
    angle_rad = math.radians(angle-90)
    cos_val = math.cos(angle_rad)
    sin_val = math.sin(angle_rad)
    x2 = x1 - sin_val * length
    y2 = y1 + cos_val * length
    x3 = x2 - cos_val * width
    y3 = y2 - sin_val * width
    x4 = x1 - cos_val * width
    y4 = y1 - sin_val * width
    return [(round(x1,2), round(y1,2)), (round(x2,2), round(y2,2)), 
          (round(x3,2), round(y3,2)), (round(x4,2), round(y4,2))]
"""
def rectangle_corners(x1, y1, width, length, angle):
  return [(1,2), (2,3), (4,5), (5,4)]
"""
  LeftCorner = (x1, y1)
  Phi = math.radians(angle)
  x2 = (x1 + width/2 * math.cos(Phi) - length/2 * math.sin(Phi))
  y2 = (y1 + length/2 * math.cos(Phi) + length/2 * math.cos(Phi))

  print(LeftCorner, (x2, y2))
  
  tr_x = cx + width/2 * math.cos(Phi) - length/2 * math.sin(Phi)
  tr_y = cy + width/2 * math.sin(Phi) + length/2 * math.cos(Phi)

  Phi = math.radians(angle+90)
  br_x = cx + width/2 * math.cos(Phi) - length/2 * math.sin(Phi)
  br_y = cy + width/2 * math.sin(Phi) + length/2 * math.cos(Phi)

  Phi = math.radians(angle+90)
  br_x = cx + width/2 * math.cos(Phi) - length/2 * math.sin(Phi)
  br_y = cy + width/2 * math.sin(Phi) + length/2 * math.cos(Phi)





  

  return [LeftCorner]
"""

"""
checks if object1 is facing the same direction (angle) as object 2 with some degree of tolerance
"""

def same_direction(_object1, _object2, tolerance):
  rotMin = (_object2 - tolerance) % 360
  rotMax = (_object2 + tolerance) % 360

  _object1 = (_object1 % 360)

  if rotMin <= rotMax:
    return (rotMin <= _object1 <= rotMax)
  else:
    return (_object1 >= rotMin or _object1<= rotMax)


def atan2test(originX, originY, x2, y2):
  feedY = (originY - y2)
  feedX = (x2 - originX)
  degreeBetweenPoints =  math.degrees(math.atan2(feedY, feedX))
  return degreeBetweenPoints + 90



"""
Returns json with following parameters

  rating - int from 0 - 100
  complaints - a vector filled with potential improvements
  DEBUG - another json / dict which contains data for testing

"""

"""
Helper functions

"""
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

def getSideTables(_furniture):
  vectorReturn = []
  for i in _furniture:
    if i['category'] == 'SideTable':
      vectorReturn.append(i)
  return vectorReturn


    
"""
This function checks if bed is not in line of site of the door
"""
def doorAndBedCheck(_door, _bed, room, jsonData):
  if _door and _bed:
    #roomWidth = int(room['roomDimensions']['width'])
    #roomHeight = int(room['roomDimensions']['height'])
    #_bedCoordinates = rectangle_corners(_bed['x'],_bed['y'], _bed['width'], _bed['height'] / 2, _bed['rotate'])
    #_doorCollision = rectangle_corners(_door['x'],_door['y'],_door['width'], max(roomWidth, roomHeight), _door['rotate'])

    degreeBetween = atan2test(_door['x'], _door['y'], _bed['x'], _bed['y'])
    #gives waring if door is not facing the same general direction as the bed 

    if((not same_direction(degreeBetween, _door['rotate'], 55) 
       and not same_direction(degreeBetween, _door['rotate']+180, 55))):
        jsonData['complaints'].append('Try to make sure that your bed is facing the general direction towards your bed')
        return jsonData
    #elif ((same_direction(door, _door['rotate'], 5) 
     #  or same_direction(degreeBetween, _door['rotate']+180, 5))):


    ##jsonData['DEBUG']['bedCoord'] = _bedCoordinates
    ##jsonData['DEBUG']['doorCoord'] = _doorCollision

    #separateAxis = separating_axis_theorem(_bedCoordinates, _doorCollision)
    
    #if separateAxis:
      #jsonData['complaints'].append('Move your bed out of line of the doorway')
      #jsonData['rating'] -= 50

    #jsonData['DEBUG']['bedOutOfLine'] = separateAxis
  elif _door and not _bed:
    jsonData['complaints'].append('Consider adding a bed to your room')
    jsonData['rating'] -= 90
  else:
    jsonData['complaints'].append('Add a door to your room to score your Feng Shui')
    jsonData['rating'] = 0
  
  return jsonData


  
def symetrySideTable(_sideTables, _bed, jsonData):
  if(len(_sideTables) >= 3):
    jsonData['complaints'].append('You should have only two side tables')
    jsonData['rating'] -= 20
  elif(len(_sideTables) == 1):
    jsonData['complaints'].append('You should add another sidetable to your room')
    jsonData['rating'] -= 20
  else:
    _table1 = _sideTables[0]
    _table2 = _sideTables[1]

    
    # Width explanation
    # - these coordinates will check if one table is within a certain distance to the other side table
    # - that distance is similar to table 1 width + table 2 width + bed width, as it assumes that both tables will be
    #   somewhere in that range if it conforms to feng shui princaples
    # - This will also give the user some leeway on where the side tables are in case it the tables are not aligned exactly


    _tableCoord1 = rectangle_corners(_table1['x'], _table1['y'], (_table1['width'] + _table2['width'] + _bed['width']), _table1['height'], _table1['rotate'])
    _tableCoord2 = rectangle_corners(_table2['x'], _table2['y'], (_table2['width'] + _table1['width'] + _bed['width']), _table2['height'], _table2['rotate'])
    _bedcoords = rectangle_corners(_bed['x'],_bed['y'], _bed['width'], _bed['height'] / 5, _bed['rotate'])

    if separating_axis_theorem(_tableCoord1, _tableCoord2):
      if not (separating_axis_theorem(_tableCoord1, _bedcoords) or separating_axis_theorem(_tableCoord2, _bedcoords)):
        jsonData['complaints'].append('Try arranging the tables closer to the bed')
        jsonData['rating'] -= 10
      
      if not (same_direction(_table1['rotate'], _table2['rotate'], 15)):
        jsonData['complaints'].append('Tables are not facing the same direction')
        jsonData['DEBUG']['SIDE_SYMETRICAL'] = False
        jsonData['rating'] -= 10
      else:
        jsonData['DEBUG']['SIDE_SYMETRICAL'] = True

    else:
      jsonData['complaints'].append('Please place your sidetables next to each other')
      jsonData['DEBUG']['SIDE_SYMETRICAL'] = False
      jsonData['rating'] -= 20

        

  return jsonData


def roomRate(roomData):
  returnJSON = {}
  returnJSON['rating'] = 100
  returnJSON['complaints'] = []
  returnJSON['compliments'] = []
  returnJSON['DEBUG'] = {}



  _door = getFirstDoor(roomData['activeObjects'])
  _bed = getBed(roomData['activeObjects'])
  _sideTables = getSideTables(roomData['activeObjects'])

  returnJSON = doorAndBedCheck(_door, _bed, roomData, returnJSON)

  #if(not returnJSON['rating']):
     #return returnJSON

  if(_sideTables == []):
    returnJSON['complaints'].append('Consider adding two side tables next to your bed')
  else:
    returnJSON = symetrySideTable(_sideTables, _bed, returnJSON)
  
  
  
  returnJSON['rating'] = max(returnJSON['rating'], 0)
  returnJSON['testing'] = atan2test(_door['x'], _door['y'], _bed['x'], _bed['y'])
  #return _doorCollision
  return json.dumps(returnJSON)




def main():
  data = json.load(sys.argv[1])
  roomRate(data)

  
  



if __name__ == "__main__":
  main()
