from django.urls import path
from . import views
 
urlpatterns = [ 
    path('api/file-list/', views.file_list),
    path('api/file-detail/<str:fID>/', views.file_detail),
    path('api/file-create/', views.file_create),
    path('api/file-update/<str:fID>/', views.file_update),
    path('api/file-delete/<str:fID>/', views.file_delete),
]