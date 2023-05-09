from ..rating import roomRate
import json

def test_smoke():
    assert 1 == 1

def test_empty_room():
    testJson = {}
    testJson['activeObjects'] = []
    returnJson = roomRate(testJson)
    actualDebug = returnJson['DEBUG']
    assert actualDebug['DOOR_PRESENT'] == False

def test_no_bed():
    testJsonFile = open('jsonFiles/test_no_bed.json')
    testJson = json.load(testJsonFile)
    returnJson = roomRate(testJson)
    actualDebug = returnJson['DEBUG']
    assert actualDebug['BED_PRESENT'] == False

def test_door_not_facing_bed():
    testJsonFile = open('jsonFiles/test_door_not_facing_bed.json')
    testJson = json.load(testJsonFile)
    returnJsonStr = roomRate(testJson)
    returnJson = json.loads(returnJsonStr)
    actualDebug = returnJson['DEBUG']
    assert actualDebug['DOOR_IN_VIEW_OF_BED'] == False

def test_door_facing_bed_feng_shui():
    testJsonFile = open('jsonFiles/test_door_facing_bed_feng_shui.json')
    testJson = json.load(testJsonFile)
    returnJsonStr = roomRate(testJson)
    returnJson = json.loads(returnJsonStr)
    actualDebug = returnJson['DEBUG']
    assert actualDebug['BED_DIRECTLY_DOOR'] == False

def test_door_in_direct_view_of_bed():
    testJsonFile = open('jsonFiles/test_door_in_direct_view_of_bed.json')
    testJson = json.load(testJsonFile)
    returnJsonStr = roomRate(testJson)
    returnJson = json.loads(returnJsonStr)
    actualDebug = returnJson['DEBUG']
    assert actualDebug['BED_DIRECTLY_DOOR'] == True

def test_no_side_tables():
    testJsonFile = open('jsonFiles/test_no_side_tables.json')
    testJson = json.load(testJsonFile)
    returnJsonStr = roomRate(testJson)
    returnJson = json.loads(returnJsonStr)
    actualDebug = returnJson['DEBUG']
    assert actualDebug['SIDE_TABLE_COUNT'] == 0

def test_two_side_tables():
    testJsonFile = open('jsonFiles/test_two_side_tables.json')
    testJson = json.load(testJsonFile)
    returnJsonStr = roomRate(testJson)
    returnJson = json.loads(returnJsonStr)
    actualDebug = returnJson['DEBUG']
    assert actualDebug['SIDE_TABLE_COUNT'] == 2

