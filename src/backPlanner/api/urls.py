"""
URL configuration for myproject project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.urls import path
from .views import *  # смотрим по разным классам в
# смотрим переходы по разным url


urlpatterns = [
    path('', getAgreements, name='getAgreements'),
    path('getAgreement', getAgreement, name='getAgreement'),
    path('employee/', employees, name='employees'),
    path('corParticipants', corParticipants, name='corParticipants'),
    path('addPhoto', addPhoto, name='addPhoto'),
    path('getTypesWork', getTypesWork, name='getTypesWork'),
    path('getTasksContracts', getTasksContracts, name='getTasksContracts'),
    path('addTask', addTask, name='addTask'),
    path('editTask', editTask, name='editTask'),
    path('deleteTask', deleteTask, name='deleteTask'),
    path('auth', auth, name='auth'),
    path('getAllDepartmentsStaffAndTasks', getAllDepartmentsStaffAndTasks, name='getAllDepartmentsStaffAndTasks'),
    path('getTasksEmployee', getTasksEmployee, name='getTasksEmployee'),
    path('getContractsEmployee', getContractsEmployee, name='getContractsEmployee'),
    path('getDataUser', getDataUser, name='getDataUser'),
    path('getVacations', getVacations, name='getVacations'),
    path('getTask', getTask, name='getTask'),
    path('getContracts', getContracts, name='getContracts'),
    path('getTimeCosts', getTimeCosts, name='getTimeCosts'),
]