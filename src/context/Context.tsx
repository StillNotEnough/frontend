import { createContext, useState, useEffect } from 'react'
import { sendChatMessageStream } from '../services/aiService'
import authService from '../services/authService'

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

  // Проверяем аутентификацию при загрузке
  useEffect(() => {
    const checkAuth = async () => {
      const refreshToken = authService.getRefreshToken()
      
      // Если нет refresh token - точно не залогинен
      if (!refreshToken) {
        setIsAuthenticated(false)
        setUsername(null)
        return
      }

      // Проверяем не истек ли refresh token
      if (authService.isRefreshTokenExpired()) {
        console.log('🔴 Refresh token expired on load')
        logout()
        return
      }

      // Если access token истек или скоро истечет - обновляем
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
        // Токены валидны
        setIsAuthenticated(true)
        setUsername(authService.getUsername())
      }
    }

    checkAuth()
  }, [])

  // Автоматическое обновление access token
  useEffect(() => {
    if (!isAuthenticated) return

    // Проверяем каждые 5 минут нужно ли обновить токен
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
    }, 5 * 60 * 1000) // Каждые 5 минут

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
    }, 60 * 60 * 1000) // Каждый час

    return () => clearInterval(interval)
  }, [isAuthenticated])

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }

  const logout = async () => {
    // Отправляем logout на бекенд
    await authService.logoutOnBackend()
    
    // Очищаем локально
    authService.logout()
    setIsAuthenticated(false)
    setUsername(null)
    setMessages([])
  }

  const sendMessage = async (prompt: string) => {
    try {
      setLoading(true)
      
      const userMessage: Message = { role: 'user', content: prompt }
      setMessages((prev: Message[]) => [...prev, userMessage])
      setInput('')

      const assistantMessage: Message = { role: 'assistant', content: '' }
      setMessages((prev: Message[]) => [...prev, assistantMessage])

      await sendChatMessageStream(
        {
          message: prompt,
          subject: subject,
          conversationHistory: messages,
          stream: true
        },
        (chunk: string) => {
          setMessages((prev: Message[]) => {
            const newMessages = [...prev]
            const lastIndex = newMessages.length - 1
            
            if (lastIndex >= 0 && newMessages[lastIndex].role === 'assistant') {
              newMessages[lastIndex] = {
                ...newMessages[lastIndex],
                content: newMessages[lastIndex].content + chunk
              }
            }
            
            return newMessages
          })
        },
        () => {
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
        logout
      }}
    >
      {children}
    </Context.Provider>
  )
}

export default ContextProvider