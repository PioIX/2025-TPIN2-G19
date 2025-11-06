import { NextResponse } from 'next/server'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')
    
    console.log("🔵 [Next.js] User ID recibido:", userId)
    
    if (!userId) {
      return NextResponse.json({ error: 'No se proporcionó user_id' }, { status: 400 })
    }

    const backendUrl = `http://localhost:4000/user/${userId}`
    console.log("🔵 [Next.js] Llamando a:", backendUrl)
    
    const res = await fetch(backendUrl)
    
    if (!res.ok) {
      console.error("🔴 [Next.js] Error del backend:", res.status)
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }
    
    const userData = await res.json()
    console.log("🔵 [Next.js] Datos recibidos del backend:", userData)
    console.log("🔵 [Next.js] Admin value:", userData.admin, "Type:", typeof userData.admin)
    
    return NextResponse.json(userData)
  } catch (error) {
    console.error('🔴 [Next.js] Error:', error)
    return NextResponse.json({ error: 'Error al obtener usuario' }, { status: 500 })
  }
}