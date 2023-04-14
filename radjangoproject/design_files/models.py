from django.db import models

class DesignFile(models.Model):
    name = models.CharField(max_length=70, blank=False, default='')
    fileID = models.CharField(max_length=30,blank=False, default='', unique=True)
    modifiedDate = models.CharField(max_length=150, blank=False, default='')
    createDate = models.CharField(max_length=150, blank=False, default='')
    width = models.IntegerField(blank=False, default=168)
    height = models.IntegerField(blank=False, default=144)
    roomLock = models.BooleanField(blank=False, default=False)
    DESIGN_MODE_CHOICES = [
        ("room", "room"),
        ("furnish", "furnish"),
    ]
    designMode = models.CharField(
        max_length=15,
        choices=DESIGN_MODE_CHOICES,
        default="room",
    )

class RoomObject(models.Model):
    itemKey = models.IntegerField(blank=False)
    url = models.CharField(max_length=500, blank=False)
    defaultWidth = models.FloatField(blank=False)
    defaultHeight = models.FloatField(blank=False)
    description = models.CharField(max_length=500, blank=False)
    category = models.CharField(max_length=100, blank=False)
    type = models.CharField(max_length=100, blank=False)
    fileID = models.CharField(max_length=30, blank=False) ## FK
    uid = models.CharField(max_length=30, blank=False, unique=True)
    z = models.IntegerField(blank=False)
    width = models.FloatField(blank=False)
    height = models.FloatField(blank=False)
    rotate = models.FloatField(blank=False)
    x = models.FloatField(blank=False)
    y = models.FloatField(blank=False)