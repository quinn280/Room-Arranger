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
    if i['category'] == "Bed":
      return i
  return 0

def getSideTables(_furniture):
  vectorReturn = []
  for i in _furniture:
    if i['category'] == 'SideTable':
      vectorReturn.append(i)
  return vectorReturn


    
"""
This function checks if bed is not in line of sight of the door
"""
def doorAndBedCheck(_door, _bed, room, jsonData):

  if not _door: 
    jsonData['complaints'].append('Add a door to your room to score your Feng Shui')
    jsonData['rating'] = 0
    jsonData['DEBUG']['DOOR_PRESENT'] = False
    jsonData['DEBUG']['BED_PRESENT'] = False
    return jsonData
  elif not _bed:
    jsonData['complaints'].append('Consider adding a bed to your bedroom')
    jsonData['rating'] = 0
    jsonData['DEBUG']['DOOR_PRESENT'] = True
    jsonData['DEBUG']['BED_PRESENT'] = False
    return jsonData
  
  jsonData['DEBUG']['DOOR_PRESENT'] = True
  jsonData['DEBUG']['BED_PRESENT'] = True


  doorX = _door['x']
  doorY = _door['y']
  degreeBetween = atan2test(doorX, doorY, _bed['x'], _bed['y'])
  #gives waring if door is not facing the same general direction as the bed 

  if((not same_direction(degreeBetween, _door['rotate'], 65) and not same_direction(degreeBetween, _door['rotate']+180, 65))):
    jsonData['complaints'].append('Move your bed so it is in view of your doorway')
    jsonData['rating'] - 30
    jsonData['DEBUG']['DOOR_IN_VIEW_OF_BED'] = False
    return jsonData
  else:
    jsonData['DEBUG']['DOOR_IN_VIEW_OF_BED'] = True

  if((same_direction(degreeBetween, _bed['rotate'], 10) or same_direction(degreeBetween, _bed['rotate']+180, 10))):
    jsonData['complaints'].append('Your bed may be directly facing the door')
    jsonData['rating'] - 20
    jsonData['DEBUG']['BED_DIRECTLY_DOOR'] = True
  else:
    jsonData['DEBUG']['BED_DIRECTLY_DOOR'] = False
    
  return jsonData


"Checks if there are two side tables and checks if they are symmetrical and near the bed"
def symetrySideTable(_sideTables, _bed, jsonData):
  jsonData['DEBUG']['SIDE_TABLE_COUNT'] = len(_sideTables)

  if(len(_sideTables) >= 3):
    jsonData['complaints'].append('You should have only two side tables')
    jsonData['rating'] -= 20
    return jsonData
  elif(len(_sideTables) == 1):
    jsonData['complaints'].append('You should add another sidetable to your room')
    jsonData['rating'] -= 20
    return jsonData
  else:
    _table1 = _sideTables[0]
    _table2 = _sideTables[1]

    
    # Complains if tables are not close enough to each other
    

    minX = _table2['x'] - 1.5*_bed['width']
    maxX = _table2['x'] + 1.5*_bed['width']

    minY = _table2['y'] - 1.5*_bed['width']
    maxY = _table2['y'] + 1.5*_bed['width']

    if(not (minX < _table1['x'] < maxX) or not (minY < _table1['y'] < maxY)):
      jsonData['complaints'].append('Your side tables are too far apart')
      jsonData['DEBUG']['SIDE_NEAR_EACH_OTHER'] = False
      jsonData['rating'] -= 10
    else:
      jsonData['DEBUG']['SIDE_NEAR_EACH_OTHER'] = True

    if not (same_direction(_table1['rotate'], _table2['rotate'], 15)):
      jsonData['complaints'].append('Tables are not facing the same direction')
      jsonData['DEBUG']['SIDE_SYMETRICAL'] = False
      jsonData['rating'] -= 10
    else:
      jsonData['DEBUG']['SIDE_SYMETRICAL'] = True
        
  return jsonData


def roomRate(roomData):
  returnJSON = {}
  returnJSON['rating'] = 100
  returnJSON['complaints'] = []
  returnJSON['DEBUG'] = {}



  _door = getFirstDoor(roomData['activeObjects'])
  _bed = getBed(roomData['activeObjects'])

  _sideTables = getSideTables(roomData['activeObjects'])
  returnJSON = doorAndBedCheck(_door, _bed, roomData, returnJSON)


  if((returnJSON['DEBUG']['DOOR_PRESENT'] == False) or (returnJSON['DEBUG']['BED_PRESENT'] == False)):
    return returnJSON

  if(_sideTables == []):
    returnJSON['complaints'].append('Consider adding two side tables next to your bed')
    returnJSON['DEBUG']['SIDE_TABLE_COUNT'] = 0
  else:
    returnJSON = symetrySideTable(_sideTables, _bed, returnJSON)
  
  
  
  returnJSON['rating'] = max(returnJSON['rating'], 0)
  #returnJSON['testing'] = atan2test(_door['x'], _door['y'], _bed['x'], _bed['y'])
  #return _doorCollision
  return json.dumps(returnJSON)




def main():
  data = json.load(sys.argv[1])
  roomRate(data)

  
  



if __name__ == "__main__":
  main()
