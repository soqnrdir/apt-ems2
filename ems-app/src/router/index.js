import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import Logout from '../views/Logout.vue'

import Powerconsumption from '../views/energyMonitering/Powerconsumption.vue'
import LiveLoadMonitering from '../views/energyMonitering/LiveLoadMonitering.vue'
import ElectricityUsage from '../views/energyMonitering/ElectricityUsage.vue'
import EnergyCostMonth from '../views/energyMonitering/EnergyCostMonth.vue'

import EnergyUseStatistics from '../views/statisticsReport/EnergyUseStatistics.vue'
import PowerUseHistory from '../views/statisticsReport/PowerUseHistory.vue'
import EquipFailureHistory from '../views/statisticsReport/EquipFailureHistory.vue'
import CommunicationRate from '../views/statisticsReport/CommunicationRate.vue'
import CommunicationRateTotal from '../views/statisticsReport/CommunicationRateTotal.vue'

import FacilityManagement from '../views/equipmentManagement/FacilityManagement.vue'
import MeasurementManagement from '../views/equipmentManagement/MeasurementManagement.vue'
import MeterManagement from '../views/equipmentManagement/MeterManagement.vue'
import IoTSensorManagement from '../views/equipmentManagement/IoTSensorManagement.vue'

import DRStatus from '../views/dr/DRStatus.vue'
import DROccurrenceHistory from '../views/dr/DROccurrenceHistory.vue'

import EnvironmentMonitoring from '../views/environmentInfo/EnvironmentMonitoring.vue'
import EnvironmentDataHistory from '../views/environmentInfo/EnvironmentDataHistory.vue'
import WaterQualityMonitoring from '../views/environmentInfo/WaterQualityMonitoring.vue'
import WaterQualityAlarmHistory from '../views/environmentInfo/WaterQualityAlarmHistory.vue'

import UserManagement from '../views/system/UserManagement.vue'
import SystemSetting from '../views/system/SystemSetting.vue'
import store from '../store/';

const routes = [
  // 공통
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/logout',
    name: 'Logout',
    component: Logout
  },
  {
    path: '/',
    name: 'Default',
    component: Home,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/home',
    name: 'Home',
    component: Home,
    meta: {
      requiresAuth: true
    }
  },
  // 에너지모니터링
  {
    path: '/powerconsumption',
    name: 'Powerconsumption',
    component: Powerconsumption,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/liveLoadMonitering',
    name: 'LiveLoadMonitering',
    component: LiveLoadMonitering,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/electricityUsage',
    name: 'ElectricityUsage',
    component: ElectricityUsage,
    meta: {
      requiresAuth: true
    }
},
  {
    path: '/energyCostMonth',
    name: 'EnergyCostMonth',
    component: EnergyCostMonth,
    meta: {
      requiresAuth: true
    }
},
  // 통계리포트
  {
    path: '/energyUseStatistics',
    name: 'EnergyUseStatistics',
    component: EnergyUseStatistics,
    meta: {
      requiresAuth: true
    }
},
  {
    path: '/powerUseHistory',
    name: 'PowerUseHistory',
    component: PowerUseHistory,
    meta: {
      requiresAuth: true
    }
},
  {
    path: '/equipFailureHistory',
    name: 'EquipFailureHistory',
    component: EquipFailureHistory,
    meta: {
      requiresAuth: true
    }
},
{
  path: '/communicationRate',
  name: 'CommunicationRate',
  component: CommunicationRate,
  meta: {
    requiresAuth: true
  }
},
{
  path: '/communicationRateTotal',
  name: 'CommunicationRateTotal',
  component: CommunicationRateTotal,
  meta: {
    requiresAuth: true
  }
},
  // 장비관리
  {
    path: '/facilityManagement',
    name: 'FacilityManagement',
    component: FacilityManagement,
    meta: {
      requiresAuth: true
    }
},
  {
    path: '/measurementManagement',
    name: 'MeasurementManagement',
    component: MeasurementManagement,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/meterManagement',
    name: 'MeterManagement',
    component: MeterManagement,
    meta: {
      requiresAuth: true
    }
  },
  
  {
    path: '/ioTSensorManagement',
    name: 'IoTSensorManagement',
    component: IoTSensorManagement,
    meta: {
      requiresAuth: true
    }
},
  // DR
  {
    path: '/drStatus',
    name: 'DRStatus',
    component: DRStatus,
    meta: {
      requiresAuth: true
    }
},
  {
    path: '/drOccurrenceHistory',
    name: 'DROccurrenceHistory',
    component: DROccurrenceHistory,
    meta: {
      requiresAuth: true
    }
},
  // 환경정보
  {
    path: '/environmentMonitoring',
    name: 'EnvironmentMonitoring',
    component: EnvironmentMonitoring,
    meta: {
      requiresAuth: true
    }
},
  {
    path: '/environmentDataHistory',
    name: 'EnvironmentDataHistory',
    component: EnvironmentDataHistory,
    meta: {
      requiresAuth: true
    }
},
  {
    path: '/waterQualityMonitoring',
    name: 'WaterQualityMonitoring',
    component: WaterQualityMonitoring,
    meta: {
      requiresAuth: true
    }
},
  {
    path: '/waterQualityAlarmHistory',
    name: 'WaterQualityAlarmHistory',
    component: WaterQualityAlarmHistory,
    meta: {
      requiresAuth: true
    }
},
  // 시스템
  {
    path: '/userManagement',
    name: 'UserManagement',
    component: UserManagement,
    meta: {
      requiresAuth: true
    }
},
  {
    path: '/systemSetting',
    name: 'SystemSetting',
    component: SystemSetting,
    meta: {
      requiresAuth: true
    }
}
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

router.beforeEach((to, from, next) => {
  if(to.matched.some(record => record.meta.requiresAuth)) {
      let admin = store.state.admin
      console.log(`router ${from.fullPath} -> '${to.fullPath}' id=${admin.id}`)
      if (!admin.id) {
        next({
            name: 'Login',
            params: { nextUrl: to.fullPath }
          })
      } else {
        if (to.matched.some(record => record.meta.admin)) {
            if(admin.level) {
              next()
            }
            else{
              next({ name: 'Home'})
            }
        } else {
          next()
        }
      }
  } else {
    console.log('router -> navigating a guest page:', to.fullPath)
    next()
  }
})

export default router
