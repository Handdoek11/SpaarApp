import React, { useEffect } from 'react'
import { CheckCircle, AlertCircle, X, Info, AlertTriangle } from 'lucide-react'

export type NotificationType = 'success' | 'error' | 'warning' | 'info'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message?: string
  duration?: number
  persistent?: boolean
}

interface NotificationsProps {
  notifications: Notification[]
  onRemove: (id: string) => void
}

export const Notifications: React.FC<NotificationsProps> = ({
  notifications,
  onRemove
}) => {
  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />
    }
  }

  const getStyles = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200'
      case 'error':
        return 'bg-red-50 border-red-200'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200'
      case 'info':
        return 'bg-blue-50 border-blue-200'
    }
  }

  const getTextStyles = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return 'text-green-800'
      case 'error':
        return 'text-red-800'
      case 'warning':
        return 'text-yellow-800'
      case 'info':
        return 'text-blue-800'
    }
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onRemove={onRemove}
          getIcon={getIcon}
          getStyles={getStyles}
          getTextStyles={getTextStyles}
        />
      ))}
    </div>
  )
}

interface NotificationItemProps {
  notification: Notification
  onRemove: (id: string) => void
  getIcon: (type: NotificationType) => React.ReactNode
  getStyles: (type: NotificationType) => string
  getTextStyles: (type: NotificationType) => string
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onRemove,
  getIcon,
  getStyles,
  getTextStyles
}) => {
  useEffect(() => {
    if (!notification.persistent && notification.duration !== 0) {
      const timeout = setTimeout(() => {
        onRemove(notification.id)
      }, notification.duration || 5000)

      return () => clearTimeout(timeout)
    }
  }, [notification, onRemove])

  return (
    <div
      className={`p-4 rounded-lg border shadow-sm transform transition-all duration-300 animate-in slide-in-from-right ${getStyles(
        notification.type
      )}`}
    >
      <div className="flex items-start gap-3">
        {getIcon(notification.type)}
        <div className="flex-1 min-w-0">
          <h4 className={`font-medium ${getTextStyles(notification.type)}`}>
            {notification.title}
          </h4>
          {notification.message && (
            <p className={`mt-1 text-sm ${getTextStyles(notification.type)} opacity-90`}>
              {notification.message}
            </p>
          )}
        </div>
        <button
          onClick={() => onRemove(notification.id)}
          className={`p-1 rounded-md hover:bg-black hover:bg-opacity-5 transition-colors`}
        >
          <X className="w-4 h-4 opacity-60" />
        </button>
      </div>
    </div>
  )
}