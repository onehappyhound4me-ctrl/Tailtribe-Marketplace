export default function VerzorgerPage() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      padding: '2rem',
      color: 'white',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ 
        maxWidth: '800px', 
        margin: '0 auto',
        background: 'rgba(255,255,255,0.1)',
        padding: '2rem',
        borderRadius: '1rem',
        backdropFilter: 'blur(10px)'
      }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem', textAlign: 'center' }}>
          🎯 Verzorger Dashboard
        </h1>
        
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>
            Welkom terug verzorger!
          </h2>
          <p style={{ fontSize: '1.2rem', opacity: 0.9 }}>
            Beheer je diensten en inkomsten
          </p>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <div style={{ 
            background: 'rgba(255,255,255,0.2)', 
            padding: '1rem', 
            borderRadius: '0.5rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>23</div>
            <div>Klanten Bediend</div>
          </div>
          <div style={{ 
            background: 'rgba(255,255,255,0.2)', 
            padding: '1rem', 
            borderRadius: '0.5rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>4.9</div>
            <div>Gemiddelde Rating</div>
          </div>
          <div style={{ 
            background: 'rgba(255,255,255,0.2)', 
            padding: '1rem', 
            borderRadius: '0.5rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>€2,340</div>
            <div>Totale Inkomsten</div>
          </div>
          <div style={{ 
            background: 'rgba(255,255,255,0.2)', 
            padding: '1rem', 
            borderRadius: '0.5rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>8</div>
            <div>Tevredenheidscore</div>
          </div>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '1rem'
        }}>
          <div style={{ 
            background: 'rgba(255,255,255,0.15)', 
            padding: '1.5rem', 
            borderRadius: '0.5rem',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>👤 Profiel beheren</h3>
            <p style={{ opacity: 0.8, marginBottom: '1rem' }}>Bewerk je profiel en diensten</p>
            <button style={{ 
              background: 'rgba(255,255,255,0.3)', 
              border: 'none', 
              padding: '0.5rem 1rem', 
              borderRadius: '0.25rem',
              color: 'white',
              cursor: 'pointer',
              width: '100%'
            }}>
              Profiel bewerken
            </button>
          </div>

          <div style={{ 
            background: 'rgba(255,255,255,0.15)', 
            padding: '1.5rem', 
            borderRadius: '0.5rem',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>📅 Beschikbaarheid</h3>
            <p style={{ opacity: 0.8, marginBottom: '1rem' }}>Plan je beschikbare uren</p>
            <button style={{ 
              background: 'rgba(255,255,255,0.3)', 
              border: 'none', 
              padding: '0.5rem 1rem', 
              borderRadius: '0.25rem',
              color: 'white',
              cursor: 'pointer',
              width: '100%'
            }}>
              Schema beheren
            </button>
          </div>

          <div style={{ 
            background: 'rgba(255,255,255,0.15)', 
            padding: '1.5rem', 
            borderRadius: '0.5rem',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>💰 Inkomsten</h3>
            <p style={{ opacity: 0.8, marginBottom: '1rem' }}>Bekijk je verdiensten</p>
            <button style={{ 
              background: 'rgba(255,255,255,0.3)', 
              border: 'none', 
              padding: '0.5rem 1rem', 
              borderRadius: '0.25rem',
              color: 'white',
              cursor: 'pointer',
              width: '100%'
            }}>
              Inkomsten bekijken
            </button>
          </div>

          <div style={{ 
            background: 'rgba(255,255,255,0.15)', 
            padding: '1.5rem', 
            borderRadius: '0.5rem',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>💬 Berichten</h3>
            <p style={{ opacity: 0.8, marginBottom: '1rem' }}>Communicatie met klanten</p>
            <button style={{ 
              background: 'rgba(255,255,255,0.3)', 
              border: 'none', 
              padding: '0.5rem 1rem', 
              borderRadius: '0.25rem',
              color: 'white',
              cursor: 'pointer',
              width: '100%'
            }}>
              Berichten bekijken
            </button>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <a href="/" style={{ 
            color: 'white', 
            textDecoration: 'none',
            background: 'rgba(255,255,255,0.2)',
            padding: '0.5rem 1rem',
            borderRadius: '0.25rem',
            display: 'inline-block'
          }}>
            ← Terug naar Homepage
          </a>
        </div>
      </div>
    </div>
  )
}
