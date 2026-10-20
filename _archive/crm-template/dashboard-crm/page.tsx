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
  const [selectedTask, setSelectedTask] = useState<string | null>(null)

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F5F5F5',
      color: '#333',
      paddingBottom: 40,
    }}>
      {/* Header */}
      <div style={{
        background: '#FFFFFF',
        borderBottom: '1px solid #E0E0E0',
        padding: '12px 40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <h1 style={{
          margin: 0,
          fontSize: '24px',
          fontWeight: 700,
          color: '#333',
        }}>
          📊 Customer Journeys
        </h1>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search..."
            style={{
              padding: '8px 12px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '14px',
              width: '180px',
            }}
          />
          <div style={{ fontSize: '20px' }}>🔔</div>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: '#b0b0b0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 600,
          }}>
            AB
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ padding: '40px' }}>

        {/* Title Section */}
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{
            margin: '0 0 12px',
            fontSize: '28px',
            fontWeight: 700,
            color: '#333',
          }}>
            Customer Journeys
          </h2>
          <p style={{
            margin: '0 0 20px',
            fontSize: '14px',
            color: '#999',
            fontWeight: 500,
          }}>
            New Case Management
          </p>

          {/* Avatar Row */}
          <div style={{
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
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
                  (e.currentTarget as HTMLElement).style.transform = 'scale(1.1)'
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = 'scale(1)'
                }}
              >
                {avatar.initials}
              </div>
            ))}
          </div>
        </div>

        {/* Flow Diagram */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '20px',
          marginBottom: '40px',
        }}>
          {stages.map((stage, stageIndex) => (
            <div key={stageIndex}>
              {/* Stage Header */}
              <div style={{
                fontSize: '13px',
                fontWeight: 600,
                color: '#666',
                marginBottom: '16px',
                textAlign: 'center',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                {stage.title}
              </div>

              {/* Stage Items */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}>
                {stage.items.map((item, itemIndex) => (
                  <motion.div
                    key={itemIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: itemIndex * 0.05 }}
                    onClick={() => item.popup && setSelectedTask(item.name)}
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
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'
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
                                fontSize: '11px',
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

                    {/* Status Indicator */}
                    <div style={{
                      display: 'flex',
                      gap: '6px',
                      alignItems: 'center',
                    }}>
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: item.status === 'completed' ? '#4CAF50' : item.status === 'active' ? '#2196F3' : '#CCCCCC',
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
                      marginTop: '8px',
                      justifyContent: 'flex-end',
                    }}>
                      <div style={{ fontSize: '12px', cursor: 'pointer' }}>✓</div>
                      <div style={{ fontSize: '12px', cursor: 'pointer' }}>📅</div>
                    </div>

                    {/* Popup Badge */}
                    {item.popup && (
                      <div style={{
                        position: 'absolute',
                        top: '-30px',
                        right: '-20px',
                        background: '#000',
                        color: '#fff',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 600,
                      }}>
                        Request Processing
                      </div>
                    )}
                  </motion.div>
                ))}

                {/* Plus Button */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '40px',
                  border: '2px dashed #E0E0E0',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  color: '#999',
                  fontSize: '18px',
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

        {/* Bottom Sections */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '20px',
        }}>
          {/* Suggested Knowledge Table */}
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
                fontSize: '14px',
                fontWeight: 600,
                color: '#333',
              }}>
                Suggested Knowledge
              </h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button style={{
                  width: '28px',
                  height: '28px',
                  border: '1px solid #E0E0E0',
                  borderRadius: '4px',
                  background: '#fff',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}>
                  +
                </button>
                <button style={{
                  width: '28px',
                  height: '28px',
                  border: '1px solid #E0E0E0',
                  borderRadius: '4px',
                  background: '#fff',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}>
                  ↗
                </button>
                <button style={{
                  width: '28px',
                  height: '28px',
                  border: '1px solid #E0E0E0',
                  borderRadius: '4px',
                  background: '#fff',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}>
                  📋
                </button>
              </div>
            </div>

            <table style={{
              width: '100%',
              fontSize: '13px',
              borderCollapse: 'collapse',
            }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #E0E0E0' }}>
                  <th style={{ textAlign: 'left', padding: '8px 0', fontWeight: 600, color: '#666' }}>Subject</th>
                  <th style={{ textAlign: 'left', padding: '8px 0', fontWeight: 600, color: '#666' }}>Status</th>
                  <th style={{ textAlign: 'left', padding: '8px 0', fontWeight: 600, color: '#666' }}>Start Date</th>
                  <th style={{ textAlign: 'left', padding: '8px 0', fontWeight: 600, color: '#666' }}>End Date</th>
                  <th style={{ textAlign: 'left', padding: '8px 0', fontWeight: 600, color: '#666' }}>Assigned User</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { subject: 'Design Sprint', status: 'Executed', startDate: '2023-09-30 01:12', endDate: '2023-10-01 01:11', user: 'Sam Frank' },
                  { subject: 'Mention Lead', status: 'Scheduled', startDate: '2023-10-01 3:41', endDate: '2023-10-01 2:41', user: 'Nikki Oley' },
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #F0F0F0' }}>
                    <td style={{ padding: '10px 0', color: '#333' }}>{row.subject}</td>
                    <td style={{ padding: '10px 0' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        background: row.status === 'Executed' ? '#E8F5E9' : '#FCE4EC',
                        color: row.status === 'Executed' ? '#4CAF50' : '#E91E63',
                        fontSize: '12px',
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

          {/* Support Ticket Journey Chart */}
          <div style={{
            background: '#FFFFFF',
            border: '1px solid #E0E0E0',
            borderRadius: '8px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px',
            }}>
              <h3 style={{
                margin: 0,
                fontSize: '14px',
                fontWeight: 600,
                color: '#333',
              }}>
                Support Ticket Journey
              </h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button style={{
                  width: '28px',
                  height: '28px',
                  border: '1px solid #E0E0E0',
                  borderRadius: '4px',
                  background: '#fff',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}>
                  +
                </button>
                <button style={{
                  width: '28px',
                  height: '28px',
                  border: '1px solid #E0E0E0',
                  borderRadius: '4px',
                  background: '#fff',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}>
                  ↗
                </button>
                <button style={{
                  width: '28px',
                  height: '28px',
                  border: '1px solid #E0E0E0',
                  borderRadius: '4px',
                  background: '#fff',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}>
                  📋
                </button>
              </div>
            </div>

            {/* Donut Chart */}
            <div style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-around',
              gap: '20px',
            }}>
              {/* Left Donut */}
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  background: 'conic-gradient(#5B9BD5 0deg 216deg, #D3D3D3 216deg 360deg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 8px',
                  boxShadow: 'inset 0 0 0 25px #fff',
                }}>
                  <span style={{ fontSize: '18px', fontWeight: 700, color: '#333' }}>5</span>
                </div>
                <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>Executed</p>
              </div>

              {/* Right Donut */}
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  background: 'conic-gradient(#E74C3C 0deg 252deg, #D3D3D3 252deg 360deg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 8px',
                  boxShadow: 'inset 0 0 0 25px #fff',
                }}>
                  <span style={{ fontSize: '18px', fontWeight: 700, color: '#333' }}>7</span>
                </div>
                <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>Active</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Task detail modal */}
      {selectedTask && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 200,
          }}
          onClick={() => setSelectedTask(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
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
            <h3 style={{ margin: '0 0 12px', fontSize: '16px', fontWeight: 600 }}>{selectedTask}</h3>
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
