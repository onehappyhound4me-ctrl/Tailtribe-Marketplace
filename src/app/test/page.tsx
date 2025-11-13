export default function TestPage() {
  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Site werkt!</h1>
      <p>Als je dit ziet, werkt de deployment.</p>
      <p>Tijd: {new Date().toISOString()}</p>
    </div>
  )
}
