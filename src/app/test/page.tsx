export default function TestPage() {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>TEST PAGE WERKT!</h1>
      <p>Als je dit ziet, werkt de server wel.</p>
      <a href="/dashboard/caregiver" style={{ 
        display: 'inline-block', 
        background: 'green', 
        color: 'white', 
        padding: '10px 20px', 
        textDecoration: 'none',
        borderRadius: '5px',
        margin: '10px'
      }}>
        → Verzorger Dashboard
      </a>
      <a href="/dashboard/owner" style={{ 
        display: 'inline-block', 
        background: 'blue', 
        color: 'white', 
        padding: '10px 20px', 
        textDecoration: 'none',
        borderRadius: '5px',
        margin: '10px'
      }}>
        → Owner Dashboard
      </a>
    </div>
  )
}
