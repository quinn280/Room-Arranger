from django.urls import path
from . import views
 
urlpatterns = [ 
    path('api/file-list/', views.file_list),
    path('api/file-detail/<str:fID>/', views.file_detail),
    path('api/file-create/', views.file_create),
    path('api/file-update/<str:fID>/', views.file_update),
    path('api/file-delete/<str:fID>/', views.file_delete),

    path('api/ro-list/', views.ro_list),
    path('api/ro-detail/<str:oID>/', views.ro_detail),
    path('api/ro-create/', views.ro_create),
    path('api/ro-update/<str:oID>/', views.ro_update),
    path('api/ro-delete/<str:oID>/', views.ro_delete),
]