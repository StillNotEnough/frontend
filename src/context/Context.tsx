// src/context/Context.tsx - ОБНОВЛЕННАЯ ВЕРСИЯ

import { createContext, useState, useEffect } from 'react'
import { sendChatMessageStream } from '../services/aiService'
import authService from '../services/authService'
import chatService, { type Chat, type ChatMessage as ApiChatMessage } from '../services/chatService'

export interface Message {
  role: 'user' | 'assistant'
  content: string
}

export interface ContextType {
  input: string
  setInput: (input: string) => void
  messages: Message[]
  setMessages: (messages: Message[] | ((prev: Message[]) => Message[])) => void
  loading: boolean
  setLoading: (loading: boolean) => void
  subject: string
  setSubject: (subject: string) => void
  theme: 'light' | 'dark'
  toggleTheme: () => void
  sidebarExtended: boolean
  setSidebarExtended: (extended: boolean) => void
  sendMessage: (prompt: string) => Promise<void>
  isAuthenticated: boolean
  username: string | null
  logout: () => void
  // НОВОЕ: для чатов
  chats: Chat[]
  currentChatId: number | null
  loadChats: () => Promise<void>
  createNewChat: () => Promise<void>
  selectChat: (chatId: number) => Promise<void>
  deleteChat: (chatId: number) => Promise<void>
}

export const Context = createContext<ContextType | undefined>(undefined)

interface ContextProviderProps {
  children: React.ReactNode
}

export const ContextProvider = ({ children }: ContextProviderProps) => {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [subject, setSubject] = useState('general')
  
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const savedTheme = localStorage.getItem('theme')
    return (savedTheme as 'light' | 'dark') || 'light'
  })

  useEffect(() => {
    if (theme === 'dark') {
      document.body.classList.add('dark-theme')
    } else {
      document.body.classList.remove('dark-theme')
    }
    
    localStorage.setItem('theme', theme)
  }, [theme])
  
  const [sidebarExtended, setSidebarExtended] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated())
  const [username, setUsername] = useState(authService.getUsername())

  // НОВОЕ: состояние для чатов
  const [chats, setChats] = useState<Chat[]>([])
  const [currentChatId, setCurrentChatId] = useState<number | null>(null)

  // Проверяем аутентификацию при загрузке
  useEffect(() => {
    const checkAuth = async () => {
      const refreshToken = authService.getRefreshToken()
      
      if (!refreshToken) {
        setIsAuthenticated(false)
        setUsername(null)
        return
      }

      if (authService.isRefreshTokenExpired()) {
        console.log('🔴 Refresh token expired on load')
        logout()
        return
      }

      if (authService.isAccessTokenExpired() || authService.willAccessTokenExpireSoon()) {
        console.log('🔄 Access token expired/expiring on page load, refreshing...')
        
        try {
          await authService.refreshTokens()
          console.log('✅ Tokens refreshed on page load')
          
          setIsAuthenticated(true)
          setUsername(authService.getUsername())
        } catch (error) {
          console.error('❌ Failed to refresh on load:', error)
          logout()
        }
      } else {
        setIsAuthenticated(true)
        setUsername(authService.getUsername())
      }
    }

    checkAuth()
  }, [])

  // НОВОЕ: загружаем чаты при логине
  useEffect(() => {
    if (isAuthenticated) {
      loadChats()
    } else {
      setChats([])
      setCurrentChatId(null)
      setMessages([])
    }
  }, [isAuthenticated])

  // Автоматическое обновление access token
  useEffect(() => {
    if (!isAuthenticated) return

    const interval = setInterval(async () => {
      if (authService.willAccessTokenExpireSoon()) {
        console.log('🔄 Access token expiring soon, refreshing...')
        
        try {
          await authService.refreshTokens()
          console.log('✅ Tokens refreshed in background')
        } catch (error) {
          console.error('❌ Failed to refresh tokens:', error)
          logout()
        }
      }
    }, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [isAuthenticated])

  // Проверяем истечение refresh token каждый час
  useEffect(() => {
    if (!isAuthenticated) return

    const interval = setInterval(() => {
      if (authService.isRefreshTokenExpired()) {
        console.log('🔴 Refresh token expired, logging out...')
        alert('Your session has expired. Please log in again.')
        logout()
      }
    }, 60 * 60 * 1000)

    return () => clearInterval(interval)
  }, [isAuthenticated])

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }

  const logout = async () => {
    await authService.logoutOnBackend()
    authService.logout()
    setIsAuthenticated(false)
    setUsername(null)
    setMessages([])
    setChats([])
    setCurrentChatId(null)
  }

  // НОВОЕ: загрузить чаты
  const loadChats = async () => {
    try {
      const fetchedChats = await chatService.getRecentChats(20)
      setChats(fetchedChats)
    } catch (error) {
      console.error('Failed to load chats:', error)
    }
  }

  // НОВОЕ: создать новый чат
  const createNewChat = async () => {
    try {
      const newChat = await chatService.createChat('New Chat', subject)
      setChats(prev => [newChat, ...prev])
      setCurrentChatId(newChat.id)
      setMessages([])
    } catch (error) {
      console.error('Failed to create chat:', error)
    }
  }

  // НОВОЕ: выбрать чат
  const selectChat = async (chatId: number) => {
    try {
      setLoading(true)
      const chatMessages = await chatService.getChatMessages(chatId)
      
      // Конвертируем API сообщения в формат для UI
      const convertedMessages: Message[] = chatMessages.map((msg: ApiChatMessage) => ({
        role: msg.role,
        content: msg.content
      }))
      
      setMessages(convertedMessages)
      setCurrentChatId(chatId)
    } catch (error) {
      console.error('Failed to load chat messages:', error)
    } finally {
      setLoading(false)
    }
  }

  // НОВОЕ: удалить чат
  const deleteChat = async (chatId: number) => {
    try {
      await chatService.deleteChat(chatId)
      setChats(prev => prev.filter(chat => chat.id !== chatId))
      
      // Если удаляем текущий чат - очищаем
      if (currentChatId === chatId) {
        setCurrentChatId(null)
        setMessages([])
      }
    } catch (error) {
      console.error('Failed to delete chat:', error)
    }
  }

  // ✨ ОБНОВЛЕННОЕ: sendMessage с автоматическим формированием title
  const sendMessage = async (prompt: string) => {
    try {
      setLoading(true)
      
      // Если нет текущего чата и пользователь залогинен - создаем новый
      let chatId = currentChatId
      if (!chatId && isAuthenticated) {
        // Создаем чат с дефолтным title "New Chat"
        // Бэкенд автоматически обновит title при первом сообщении пользователя
        const newChat = await chatService.createChat('New Chat', subject)
        chatId = newChat.id
        setCurrentChatId(chatId)
        setChats(prev => [newChat, ...prev])
      }

      const userMessage: Message = { role: 'user', content: prompt }
      setMessages((prev: Message[]) => [...prev, userMessage])
      setInput('')

      // Сохраняем user сообщение в БД (если залогинен)
      if (isAuthenticated && chatId) {
        await chatService.addMessage(chatId, prompt, 'user', subject)
        // ✨ НОВОЕ: После сохранения первого сообщения обновляем список чатов
        // чтобы получить обновленный title
        await loadChats()
      }

      const assistantMessage: Message = { role: 'assistant', content: '' }
      setMessages((prev: Message[]) => [...prev, assistantMessage])

      let assistantContent = ''

      await sendChatMessageStream(
        {
          message: prompt,
          subject: subject,
          conversationHistory: messages,
          stream: true
        },
        (chunk: string) => {
          assistantContent += chunk
          setMessages((prev: Message[]) => {
            const newMessages = [...prev]
            const lastIndex = newMessages.length - 1
            
            if (lastIndex >= 0 && newMessages[lastIndex].role === 'assistant') {
              newMessages[lastIndex] = {
                ...newMessages[lastIndex],
                content: assistantContent
              }
            }
            
            return newMessages
          })
        },
        async () => {
          // Сохраняем assistant сообщение в БД после завершения стриминга
          if (isAuthenticated && chatId) {
            try {
              await chatService.addMessage(chatId, assistantContent, 'assistant', subject)
              // Обновляем список чатов чтобы updated_at обновился
              await loadChats()
            } catch (error) {
              console.error('Failed to save assistant message:', error)
            }
          }
          setLoading(false)
        },
        (error: Error) => {
          console.error('Streaming error:', error)
          setMessages((prev: Message[]) => {
            const newMessages = [...prev]
            const lastMessage = newMessages[newMessages.length - 1]
            if (lastMessage.role === 'assistant' && !lastMessage.content) {
              lastMessage.content = 'Sorry, there was an error processing your request.'
            }
            return newMessages
          })
          setLoading(false)
        }
      )
    } catch (error) {
      console.error('Error sending message:', error)
      setLoading(false)
    }
  }

  return (
    <Context.Provider
      value={{
        input,
        setInput,
        messages,
        setMessages,
        loading,
        setLoading,
        subject,
        setSubject,
        theme,
        toggleTheme,
        sidebarExtended,
        setSidebarExtended,
        sendMessage,
        isAuthenticated,
        username,
        logout,
        // НОВОЕ
        chats,
        currentChatId,
        loadChats,
        createNewChat,
        selectChat,
        deleteChat
      }}
    >
      {children}
    </Context.Provider>
  )
}

export default ContextProvider