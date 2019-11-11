import { ChatManager, TokenProvider } from '@pusher/chatkit-client'
import moment from 'moment'
import store from './store'

const INSTANCE_LOCATOR = process.env.VUE_APP_INSTANCE_LOCATOR
const TOKEN_URL = process.env.VUE_APP_TOKEN_URL
const MESSAGE_LIMIT = Number(process.env.VUE_APP_MESSAGE_LIMIT) || 10

let currentUser = null
let activeRoom = null

// 连接到 pusher.com/chatkit
async function connectUser(userId){
  const chatManager = new ChatManager({
    instanceLocator: INSTANCE_LOCATOR,
    tokenProvider: new TokenProvider({ url: TOKEN_URL }),
    userId
  })
  currentUser = await chatManager.connect()
  return currentUser
}

function setMembers(){
  const members = activeRoom.users.map(user => ({
    usernaem: user.id,
    name: user.name,
    presence: user.presence.state
  }))
  store.commit('setUsers', members)
}

async function subscribeToRoom(roomId){
  store.commit('clearChatRoom')
  activeRoom = await currentUser.subscribeToRoom({
    roomId,
    messageLimit: MESSAGE_LIMIT,
    hooks: {
      // onMessage 接收消息
      onMessage: message => {
        store.commit('addMessage', {
          name: message.sender.name,
          username: message.senderId,
          text: message.text,
          date: moment(message.createAt).format('h:mm:ss a D-MM-YYYY')
        })
      },
      // onPresenceChanged 用户登录或注销时收到事件
      onPresenceChanged: () => {
        setMembers()
      },
      // onUserStartedTyping 收到用户正在输入的事件
      onUserStartedTyping: user => {
        store.commit('setUserTyping', user.id)
      },
      // onUserStoppedTyping 收到用户停止输入的事件
      onUserStoppedTyping: () => {
        store.commit('setUserTyping', null)
      }
    }
  })
  setMembers()
  return activeRoom
}

async function sendMessage(text){
  const messageId = await currentUser.sendMessage({
    text,
    roomId: activeRoom.id
  })
  return messageId
}

export function isTyping(roomId){
  currentUser.isTypingIn({ roomId })
}

function disconnectUser(){
  currentUser.disconnect()
}

export default {
  connectUser,
  subscribeToRoom,
  sendMessage,
  disconnectUser
}