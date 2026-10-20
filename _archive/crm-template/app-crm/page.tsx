'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

const avatars = [
  { id: 1, name: 'John', color: '#4A90E2', initials: 'JD' },
  { id: 2, name: 'Sarah', color: '#50C878', initials: 'SM' },
  { id: 3, name: 'Emma', color: '#FF6B6B', initials: 'ER' },
  { id: 4, name: 'Mike', color: '#b0b0b0', initials: 'MT' },
  { id: 5, name: 'Lisa', color: '#8a8a8a', initials: 'LS' },
  { id: 6, name: 'David', color: '#FF69B4', initials: 'DK' },
  { id: 7, name: 'James', color: '#87CEEB', initials: 'JW' },
  { id: 8, name: 'Anna', color: '#DDA0DD', initials: 'AT' },
]

const stages = [
  {
    title: 'Case Allocation',
    items: [
      { avatar: 'John', name: 'Allocate Case to User!', status: 'completed' },
      { avatar: 'Sarah', name: 'Acknowledge Case receipt to customer!', status: 'completed' },
    ],
  },
  {
    title: 'Issue Identification',
    items: [
      { avatar: 'Emma', name: 'Identify Issue Category', status: 'pending' },
      { avatar: 'Sarah', name: 'Identify Issue Severity', status: 'pending' },
      { avatar: 'Mike', name: 'Identify Issue Impact', status: 'pending' },
      { avatar: 'Emma', name: 'Allocate to Resolution Team', status: 'pending' },
      { avatar: 'Sarah', name: 'Advise Customer of Resolution estimate', status: 'pending' },
    ],
  },
  {
    title: 'Technical Resolution',
    items: [
      { avatar: 'Mike', name: 'Estimate Resolution Time', status: 'pending' },
      { avatar: 'Sarah', name: 'Advise Customer of Resolution Estimate', status: 'pending' },
    ],
  },
  {
    title: 'New Tasks',
    items: [
      { avatar: 'David', name: 'Request Processing', status: 'active', popup: true },
      { avatar: 'Lisa', name: 'Problem Resolution', status: 'pending' },
      { avatar: 'James', name: 'Customer Communication', status: 'pending' },
      { avatar: 'Anna', name: 'Customer Notification', status: 'pending' },
      { avatar: 'John', name: 'Customer Satisfaction', status: 'pending' },
    ],
  },
]

export default function CRMDashboard() {
  const [showPopup, setShowPopup] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: '#F5F5F5',
    }}>
      {/* LEFT SIDEBAR */}
      <aside style={{
        width: collapsed ? 60 : 160,
        background: '#FFFFFF',
        borderRight: '1px solid #E0E0E0',
        padding: '12px 8px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        transition: 'width 0.2s ease',
        position: 'fixed',
        left: 0,
        top: 0,
        height: '100vh',
        overflowY: 'auto',
        zIndex: 50,
      }}>
        {/* Toggle Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            width: '100%',
            background: 'none',
            border: 'none',
            padding: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            textAlign: 'center',
            color: '#999',
            marginBottom: '8px',
          }}
        >
          {collapsed ? '▶' : '◀'}
        </button>

        {/* Menu Items */}
        {[
          { icon: '🏠', label: 'Dashboard' },
          { icon: '📊', label: 'Reports' },
          { icon: '📞', label: 'Contacts' },
          { icon: '💼', label: 'Accounts' },
          { icon: '🎯', label: 'Opportunities' },
          { icon: '✓', label: 'Tasks' },
          { icon: '💬', label: 'Calls' },
          { icon: '⚙️', label: 'Settings' },
        ].map((item, i) => (
          <div
            key={i}
            style={{
              padding: '8px',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '12px',
              color: '#666',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#F0F0F0'
              e.currentTarget.style.color = '#333'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = '#666'
            }}
          >
            <span style={{ fontSize: '14px' }}>{item.icon}</span>
            {!collapsed && <span>{item.label}</span>}
          </div>
        ))}
      </aside>

      {/* MAIN CONTENT */}
      <main style={{
        flex: 1,
        marginLeft: collapsed ? 60 : 160,
        transition: 'margin-left 0.2s ease',
      }}>
        {/* TOP HEADER */}
        <header style={{
          background: '#FFFFFF',
          borderBottom: '1px solid #E0E0E0',
          padding: '12px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 40,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="7" height="7" stroke="#333" strokeWidth="2" />
              <rect x="14" y="3" width="7" height="7" stroke="#333" strokeWidth="2" />
              <rect x="3" y="14" width="7" height="7" stroke="#333" strokeWidth="2" />
              <rect x="14" y="14" width="7" height="7" stroke="#333" strokeWidth="2" />
            </svg>
            <span style={{ fontWeight: 600, color: '#333', fontSize: '14px' }}>SugarCRM</span>
          </div>

          <nav style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
            {['Relationship', 'Opportunities', 'Leads', 'Calendar', 'Cases', 'Reports', 'Quotes'].map((item) => (
              <a
                key={item}
                href="#"
                style={{
                  fontSize: '13px',
                  color: item === 'Cases' ? '#000' : '#666',
                  textDecoration: 'none',
                  fontWeight: item === 'Cases' ? 600 : 400,
                  padding: '8px 0',
                  borderBottom: item === 'Cases' ? '2px solid #000' : 'none',
                  transition: 'all 0.2s',
                }}
              >
                {item}
              </a>
            ))}
          </nav>

          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <input
              type="text"
              placeholder="Search..."
              style={{
                padding: '6px 12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '12px',
                width: '150px',
              }}
            />
            <div style={{ fontSize: '18px', cursor: 'pointer' }}>🔍</div>
            <div style={{ fontSize: '18px', cursor: 'pointer' }}>✉️</div>
            <div style={{ fontSize: '18px', cursor: 'pointer' }}>🔔</div>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: '#b0b0b0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 600,
                fontSize: '12px',
              }}
            >
              AB
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <div style={{ padding: '32px' }}>
          {/* TITLE SECTION */}
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{
              margin: '0 0 8px',
              fontSize: '28px',
              fontWeight: 700,
              color: '#333',
            }}>
              Customer Journeys
            </h1>
            <p style={{
              margin: '0 0 20px',
              fontSize: '13px',
              color: '#999',
              fontWeight: 500,
            }}>
              New Case Management
            </p>

            {/* AVATAR ROW */}
            <div style={{
              display: 'flex',
              gap: '12px',
              alignItems: 'center',
              flexWrap: 'wrap',
            }}>
              {avatars.map((avatar) => (
                <div
                  key={avatar.id}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: avatar.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: '13px',
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.transform = 'scale(1.15) translateY(-4px)'
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.transform = 'scale(1) translateY(0)'
                  }}
                >
                  {avatar.initials}
                </div>
              ))}
            </div>
          </div>

          {/* FLOW DIAGRAM */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '24px',
            marginBottom: '48px',
          }}>
            {stages.map((stage, stageIndex) => (
              <div key={stageIndex}>
                {/* STAGE HEADER */}
                <div style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#666',
                  marginBottom: '16px',
                  textAlign: 'center',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}>
                  {stage.title}
                </div>

                {/* STAGE ITEMS */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  position: 'relative',
                }}>
                  {stage.items.map((item, itemIndex) => (
                    <motion.div
                      key={itemIndex}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: itemIndex * 0.05 }}
                      onClick={() => item.popup && setShowPopup(true)}
                      style={{
                        background: '#FFFFFF',
                        border: '1px solid #E0E0E0',
                        borderRadius: '8px',
                        padding: '12px',
                        cursor: item.popup ? 'pointer' : 'default',
                        transition: 'all 0.2s',
                        position: 'relative',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'
                        e.currentTarget.style.borderColor = '#D0D0D0'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = 'none'
                        e.currentTarget.style.borderColor = '#E0E0E0'
                      }}
                    >
                      {/* Avatar + Name */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '8px',
                      }}>
                        {avatars.map((a) => {
                          if (a.name === item.avatar) {
                            return (
                              <div
                                key={a.id}
                                style={{
                                  width: '24px',
                                  height: '24px',
                                  borderRadius: '50%',
                                  background: a.color,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: '#fff',
                                  fontWeight: 600,
                                  fontSize: '10px',
                                }}
                              >
                                {a.initials.charAt(0)}
                              </div>
                            )
                          }
                        })}
                        <span style={{
                          fontSize: '13px',
                          fontWeight: 500,
                          color: '#333',
                        }}>
                          {item.name}
                        </span>
                      </div>

                      {/* Status */}
                      <div style={{
                        display: 'flex',
                        gap: '6px',
                        alignItems: 'center',
                        marginBottom: '8px',
                      }}>
                        <div style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: item.status === 'completed' ? '#50C878' : item.status === 'active' ? '#2196F3' : '#CCCCCC',
                        }} />
                        <span style={{
                          fontSize: '11px',
                          color: '#999',
                          textTransform: 'capitalize',
                        }}>
                          {item.status}
                        </span>
                      </div>

                      {/* Icons */}
                      <div style={{
                        display: 'flex',
                        gap: '6px',
                        justifyContent: 'flex-end',
                      }}>
                        <div style={{ fontSize: '12px', cursor: 'pointer', color: '#999' }}>✓</div>
                        <div style={{ fontSize: '12px', cursor: 'pointer', color: '#999' }}>📅</div>
                      </div>

                      {/* Popup Badge */}
                      {item.popup && (
                        <div style={{
                          position: 'absolute',
                          top: '-28px',
                          right: '-40px',
                          background: '#000',
                          color: '#fff',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 600,
                          whiteSpace: 'nowrap',
                        }}>
                          Request Processing
                        </div>
                      )}
                    </motion.div>
                  ))}

                  {/* PLUS BUTTON */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '36px',
                    border: '2px dashed #E0E0E0',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    color: '#999',
                    fontSize: '18px',
                    fontWeight: 300,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#999'
                    e.currentTarget.style.color = '#333'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#E0E0E0'
                    e.currentTarget.style.color = '#999'
                  }}
                  >
                    +
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* BOTTOM SECTIONS */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '24px',
          }}>
            {/* SUGGESTED KNOWLEDGE */}
            <div style={{
              background: '#FFFFFF',
              border: '1px solid #E0E0E0',
              borderRadius: '8px',
              padding: '20px',
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
              }}>
                <h3 style={{
                  margin: 0,
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#333',
                }}>
                  Suggested Knowledge
                </h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {['+', '↗', '📋'].map((icon, i) => (
                    <button
                      key={i}
                      style={{
                        width: '28px',
                        height: '28px',
                        border: '1px solid #E0E0E0',
                        borderRadius: '4px',
                        background: '#fff',
                        cursor: 'pointer',
                        fontSize: '12px',
                        color: '#666',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#F5F5F5'
                        e.currentTarget.style.borderColor = '#CCC'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#fff'
                        e.currentTarget.style.borderColor = '#E0E0E0'
                      }}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <table style={{
                width: '100%',
                fontSize: '12px',
                borderCollapse: 'collapse',
              }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #E0E0E0' }}>
                    {['Subject', 'Status', 'Start Date', 'End Date', 'Assigned User'].map((h) => (
                      <th
                        key={h}
                        style={{
                          textAlign: 'left',
                          padding: '8px 0',
                          fontWeight: 600,
                          color: '#666',
                          fontSize: '11px',
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { subject: 'Design Sprint', status: 'Executed', startDate: '2023-09-30 01:12', endDate: '2023-10-01 01:11', user: 'Sam Frank' },
                    { subject: 'Mention Lead', status: 'Scheduled', startDate: '2023-10-01 3:41', endDate: '2023-10-01 2:41', user: 'Nikki Oley' },
                  ].map((row, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #F5F5F5' }}>
                      <td style={{ padding: '10px 0', color: '#333' }}>{row.subject}</td>
                      <td style={{ padding: '10px 0' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '2px 8px',
                          borderRadius: '3px',
                          background: row.status === 'Executed' ? '#E8F5E9' : '#FFF3E0',
                          color: row.status === 'Executed' ? '#50C878' : '#FF9800',
                          fontSize: '11px',
                          fontWeight: 500,
                        }}>
                          {row.status}
                        </span>
                      </td>
                      <td style={{ padding: '10px 0', color: '#666' }}>{row.startDate}</td>
                      <td style={{ padding: '10px 0', color: '#666' }}>{row.endDate}</td>
                      <td style={{ padding: '10px 0', color: '#666' }}>{row.user}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* SUPPORT TICKET JOURNEY */}
            <div style={{
              background: '#FFFFFF',
              border: '1px solid #E0E0E0',
              borderRadius: '8px',
              padding: '20px',
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
              }}>
                <h3 style={{
                  margin: 0,
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#333',
                }}>
                  Support Ticket Journey
                </h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {['+', '↗', '📋'].map((icon, i) => (
                    <button
                      key={i}
                      style={{
                        width: '28px',
                        height: '28px',
                        border: '1px solid #E0E0E0',
                        borderRadius: '4px',
                        background: '#fff',
                        cursor: 'pointer',
                        fontSize: '12px',
                        color: '#666',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#F5F5F5'
                        e.currentTarget.style.borderColor = '#CCC'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#fff'
                        e.currentTarget.style.borderColor = '#E0E0E0'
                      }}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-around',
                alignItems: 'center',
                gap: '40px',
              }}>
                {/* Chart 1 */}
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    background: 'conic-gradient(#5B9BD5 0deg 216deg, #E8E8E8 216deg 360deg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 12px',
                    boxShadow: 'inset 0 0 0 30px #fff',
                  }}>
                    <span style={{ fontSize: '20px', fontWeight: 700, color: '#333' }}>5</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '12px', color: '#666', fontWeight: 500 }}>Executed</p>
                </div>

                {/* Chart 2 */}
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    background: 'conic-gradient(#E74C3C 0deg 252deg, #E8E8E8 252deg 360deg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 12px',
                    boxShadow: 'inset 0 0 0 30px #fff',
                  }}>
                    <span style={{ fontSize: '20px', fontWeight: 700, color: '#333' }}>7</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '12px', color: '#666', fontWeight: 500 }}>Active</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* POPUP MODAL */}
      {showPopup && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
          }}
          onClick={() => setShowPopup(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            style={{
              background: '#000',
              color: '#fff',
              padding: '20px 28px',
              borderRadius: '8px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
              maxWidth: '300px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 12px', fontSize: '16px', fontWeight: 600 }}>Request Processing</h3>
            <div style={{ fontSize: '13px', lineHeight: '1.6', color: 'rgba(255,255,255,0.8)' }}>
              <p style={{ margin: '0 0 8px' }}>• Problem Resolution</p>
              <p style={{ margin: '0 0 8px' }}>• Customer Communication</p>
              <p style={{ margin: '0 0 8px' }}>• Customer Notification</p>
              <p style={{ margin: 0 }}>• Customer Satisfaction</p>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
