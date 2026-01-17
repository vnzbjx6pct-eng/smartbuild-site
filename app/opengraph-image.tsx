import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'SmartBuild Eesti'
export const size = {
    width: 1200,
    height: 630,
}

export const contentType = 'image/png'

export default async function Image() {
    return new ImageResponse(
        (
            <div
                style={{
                    background: 'linear-gradient(to bottom right, #0f172a, #1e293b)',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'sans-serif',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '20px'
                    }}
                >
                    {/* Logo Icon Logic */}
                    <div style={{
                        width: '80px',
                        height: '80px',
                        background: '#10b981',
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: '20px',
                        color: 'white',
                        fontSize: '48px',
                        fontWeight: 'bold'
                    }}>
                        SB
                    </div>
                    <div style={{ fontSize: 80, fontWeight: 900, color: 'white', letterSpacing: '-0.05em' }}>
                        SmartBuild
                    </div>
                </div>

                <div style={{ fontSize: 32, color: '#94a3b8', maxWidth: '80%', textAlign: 'center', fontWeight: 500 }}>
                    Ehitusmaterjalide hinnavõrdlus Eestis
                </div>

                <div style={{
                    marginTop: '40px',
                    display: 'flex',
                    gap: '20px'
                }}>
                    <div style={{ padding: '10px 20px', background: 'rgba(255,255,255,0.1)', borderRadius: '30px', color: '#e2e8f0', fontSize: '20px' }}>Espak</div>
                    <div style={{ padding: '10px 20px', background: 'rgba(255,255,255,0.1)', borderRadius: '30px', color: '#e2e8f0', fontSize: '20px' }}>Bauhof</div>
                    <div style={{ padding: '10px 20px', background: 'rgba(255,255,255,0.1)', borderRadius: '30px', color: '#e2e8f0', fontSize: '20px' }}>Decora</div>
                </div>
            </div>
        ),
        {
            ...size,
        }
    )
}
