import { useEffect, useState, useRef } from 'react'
import { api } from '../services/api'
import { useAuth } from '../contexts/AuthContext'

function fmtTime(d) {
  if (!d) return ''
  return new Date(d).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
}

function fmtDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
}

export default function Chat() {
  const { user } = useAuth()
  const [conversations, setConversations] = useState([])
  const [selected, setSelected] = useState(null)
  const [messages, setMessages] = useState([])
  const [msgInput, setMsgInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [msgLoading, setMsgLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [showNewConv, setShowNewConv] = useState(false)
  const [newConvForm, setNewConvForm] = useState({ subject: '', order_id: '' })
  const [newConvLoading, setNewConvLoading] = useState(false)
  const messagesEndRef = useRef(null)

  async function loadConversations() {
    try {
      const d = await api.get('/chat/conversations')
      setConversations(Array.isArray(d) ? d : d.conversations || [])
    } catch {
      setConversations([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadConversations() }, [])

  useEffect(() => {
    if (!selected) return
    setMsgLoading(true)
    api.get(`/chat/conversations/${selected.id}/messages`)
      .then(d => setMessages(Array.isArray(d) ? d : d.messages || []))
      .catch(() => setMessages([]))
      .finally(() => setMsgLoading(false))
  }, [selected])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage(e) {
    e.preventDefault()
    if (!msgInput.trim() || !selected) return
    setSending(true)
    try {
      const msg = await api.post(`/chat/conversations/${selected.id}/messages`, { content: msgInput.trim() })
      setMessages(m => [...m, msg])
      setMsgInput('')
    } catch (err) {
      alert(err.message)
    } finally {
      setSending(false)
    }
  }

  async function createConversation(e) {
    e.preventDefault()
    setNewConvLoading(true)
    try {
      const body = { subject: newConvForm.subject }
      if (newConvForm.order_id) body.order_id = Number(newConvForm.order_id)
      const conv = await api.post('/chat/conversations', body)
      await loadConversations()
      setSelected(conv)
      setShowNewConv(false)
      setNewConvForm({ subject: '', order_id: '' })
    } catch (err) {
      alert(err.message)
    } finally {
      setNewConvLoading(false)
    }
  }

  async function closeConversation() {
    if (!selected) return
    try {
      await api.patch(`/chat/conversations/${selected.id}/close`, {})
      await loadConversations()
      setSelected(c => ({ ...c, status: 'closed' }))
    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <div className="page-sm">
      <div className="container">
        <div style={{ marginBottom: 24 }}>
          <h1 className="page-title">Soporte</h1>
          <p className="text-muted mt-2">Habla con nuestro equipo de gestión</p>
        </div>

        <div className="chat-layout">
          {/* Conversations panel */}
          <div className="conversations-panel">
            <div className="conversations-header">
              <span>Conversaciones</span>
              <button className="btn btn-primary btn-xs" onClick={() => setShowNewConv(true)}>+</button>
            </div>

            {showNewConv && (
              <div style={{ padding: 16, borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}>
                <form onSubmit={createConversation} className="form-stack" style={{ gap: 10 }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Asunto..."
                    value={newConvForm.subject}
                    onChange={e => setNewConvForm(f => ({ ...f, subject: e.target.value }))}
                    required
                    style={{ fontSize: '0.85rem' }}
                  />
                  <input
                    type="number"
                    className="form-input"
                    placeholder="Nº pedido (opcional)"
                    value={newConvForm.order_id}
                    onChange={e => setNewConvForm(f => ({ ...f, order_id: e.target.value }))}
                    style={{ fontSize: '0.85rem' }}
                  />
                  <div className="flex gap-2">
                    <button type="submit" className="btn btn-primary btn-xs" disabled={newConvLoading}>
                      {newConvLoading ? '...' : 'Crear'}
                    </button>
                    <button type="button" className="btn btn-ghost btn-xs" onClick={() => setShowNewConv(false)}>
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div style={{ flex: 1, overflowY: 'auto' }}>
              {loading ? (
                <div className="loading-center" style={{ padding: 40 }}><div className="spinner" /></div>
              ) : conversations.length === 0 ? (
                <div style={{ padding: 24, textAlign: 'center', color: 'var(--muted)', fontSize: '0.875rem' }}>
                  <div style={{ fontSize: '2rem', marginBottom: 8 }}>💬</div>
                  <p>Sin conversaciones</p>
                  <button className="btn btn-primary btn-xs" style={{ marginTop: 12 }} onClick={() => setShowNewConv(true)}>
                    Nueva conversación
                  </button>
                </div>
              ) : (
                conversations.map(conv => (
                  <div
                    key={conv.id}
                    className={`conversation-item${selected?.id === conv.id ? ' selected' : ''}`}
                    onClick={() => setSelected(conv)}
                  >
                    <div className="flex justify-between items-center">
                      <div className="conversation-name">{conv.subject}</div>
                      {conv.unread_count > 0 && <span className="conv-badge">{conv.unread_count}</span>}
                    </div>
                    <div className="conversation-preview">
                      <span style={{ color: conv.status === 'closed' ? 'var(--muted)' : 'var(--green)' }}>
                        {conv.status === 'closed' ? 'Cerrada' : 'Activa'}
                      </span>
                      {conv.order_id && <span> · Pedido #{conv.order_id}</span>}
                      {conv.last_message_at && <span> · {fmtDate(conv.last_message_at)}</span>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Messages panel */}
          <div className="messages-panel">
            {!selected ? (
              <div className="chat-empty">
                <div style={{ fontSize: '3rem', marginBottom: 12 }}>💬</div>
                <p>Selecciona una conversación o crea una nueva</p>
              </div>
            ) : (
              <>
                <div className="messages-header">
                  <div>
                    <div>{selected.subject}</div>
                    {selected.order_id && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Pedido #{selected.order_id}</div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {selected.status !== 'closed' && (
                      <button className="btn btn-ghost btn-xs" onClick={closeConversation}>Cerrar</button>
                    )}
                    {selected.status === 'closed' && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--muted)', padding: '4px 8px' }}>Conversación cerrada</span>
                    )}
                  </div>
                </div>

                <div className="messages-list">
                  {msgLoading ? (
                    <div className="loading-center"><div className="spinner" /></div>
                  ) : messages.length === 0 ? (
                    <div style={{ textAlign: 'center', color: 'var(--muted)', padding: 40, fontSize: '0.875rem' }}>
                      Sin mensajes aún. ¡Escribe el primero!
                    </div>
                  ) : (
                    messages.map(msg => {
                      const isMe = msg.sender_id === user?.id
                      return (
                        <div key={msg.id} className={`message${isMe ? ' message-from-me' : ' message-from-other'}`}>
                          {!isMe && (
                            <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: 4 }}>
                              {msg.sender_name || 'Soporte'}
                            </div>
                          )}
                          <div className="message-bubble">{msg.content}</div>
                          <div className="message-time">{fmtTime(msg.created_at)}</div>
                        </div>
                      )
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {selected.status !== 'closed' && (
                  <form className="messages-input-row" onSubmit={sendMessage}>
                    <textarea
                      placeholder="Escribe un mensaje..."
                      value={msgInput}
                      onChange={e => setMsgInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(e) } }}
                      rows={1}
                    />
                    <button type="submit" className="btn btn-primary btn-icon" disabled={sending || !msgInput.trim()}>
                      {sending ? '...' : '→'}
                    </button>
                  </form>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
