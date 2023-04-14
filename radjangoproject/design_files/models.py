from django.db import models

class DesignFile(models.Model):
    name = models.CharField(max_length=70, blank=False, default='')
    fileID = models.CharField(max_length=30,blank=False, default='', unique=True)
    modifiedDate = models.CharField(max_length=150, blank=False, default='')
    createDate = models.CharField(max_length=150, blank=False, default='')
