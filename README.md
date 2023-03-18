# Room-Arranger

## Docker Commands (run in root directory)

```
## Build
docker compose build
```

```
## Run
docker compose up           ## Run Together
docker compose up frontend  ## Run Just Frontend 
docker compose up backend   ## Run Just Backend
```

Website: localhost:3000
Backend: localhost:8000 (can directly test api here)

## API Format

Notes: 
1. X and Y refer to the distance from the top left corner of the room to the top left corner of the object
2. X, Y, Width, Height are the values when the object has 0 rotation. If there is non-zero rotation, the resulting dimensions and position needs to be calculated.
3. Rotation values can exceed [-360, 360], ie 900deg == 180deg

This room layout exports the following JSON data

![Api Example](api-example.png "Api Example")

```
{
    "room": {
        "width": "365px",
        "height": "286px"
    },
    "activeObjects": [
        {
            "itemKey": 1,
            "url": "vectors/furniture/bed.svg",
            "defaultWidth": "200px",
            "defaultHeight": "200px",
            "description": "Full Bed",
            "category": "Bed",
            "type": "furniture",
            "uid": "lfds4xkdv8vx1ts57h",
            "z": 2,
            "width": "175px",
            "height": "190px",
            "rotate": "0deg",
            "x": "-3px",
            "y": "-3px"
        },
        {
            "itemKey": 50,
            "url": "vectors/structural/leftdoor.svg",
            "defaultWidth": "100px",
            "defaultHeight": "100px",
            "description": "Left Door",
            "category": "door",
            "type": "structural",
            "uid": "lfds63mgzbjn33dz71b",
            "z": 5,
            "width": "100px",
            "height": "100px",
            "rotate": "180deg",
            "x": "268px",
            "y": "-23px"
        },
        {
            "itemKey": 2,
            "url": "vectors/furniture/desk.svg",
            "defaultWidth": "210px",
            "defaultHeight": "160px",
            "description": "L Desk",
            "category": "Desk",
            "type": "furniture",
            "uid": "lfds93qkrsfpxoj2m6l",
            "z": 9,
            "width": "181px",
            "height": "136px",
            "rotate": "-90deg",
            "x": "200px",
            "y": "123px"
        }
    ]
}
```

