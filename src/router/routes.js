const Login = () => import('@/views/Login')
const ChatDashboard = () => import('@/views/ChatDashboard')

const routes = [
  {
    path: '/',
    name: 'login',
    component: Login
  },
  {
    path: '/chat',
    name: 'chat',
    component: ChatDashboard
  }
]

export default routes