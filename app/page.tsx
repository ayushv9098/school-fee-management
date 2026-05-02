'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()
  
  useEffect(() => {
    router.push('/dashboard')
  }, [router])
  
  return null
}
  setLoading(true)
  
  const { data, error } = await supabase.from('students').insert({
    name: form.name,
    class: form.class,
    mobile: form.mobile,
    guardian_name: form.guardian_name,
    address: form.address,
    total_fee: Number(form.total_fee),
    academic_year: form.academic_year
  }).select()
  
  console.log('Result:', data, 'Error:', error)
  
  if (error) {
    alert('Error: ' + error.message)
    setLoading(false)
    return
  }
  
  setSuccess(true)
  setLoading(false)
  setTimeout(() => router.push('/students'), 1200)
}